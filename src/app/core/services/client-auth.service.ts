// src/app/core/services/client-auth.service.ts
//
// Spark customer auth — consumes the Akroma IDP (Plan 4C of the unified-roles
// migration). The legacy `/api/v1/client-auth/*` endpoints were deleted in
// Plan 4A; signup/login/verify now flow through `environment.idpUrl`.
//
// Token storage uses the shared `akroma_id_token` key so admin and customer
// scopes share a single session. ClientInfo (planTier, trialActive, instagram
// state, etc.) does NOT live in the JWT — it's fetched lazily from the Spark
// backend's `/api/v1/client/me` endpoint after a successful auth.
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, tap, switchMap, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

const ID_TOKEN_KEY = 'akroma_id_token';
const REFRESH_TOKEN_KEY = 'akroma_identity_rt';
const CLIENT_KEY = 'akroma_client_info';

export interface ClientInfo {
  clientId: string;
  name: string;
  email?: string;
  planTier: string;
  referralCode?: string;
  trialEndsAt?: string;
  trialActive?: boolean;
  active?: boolean;
  selectedNiche?: string;
  instagramConnected?: boolean;
  instagramUsername?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  whatsapp?: string;
  referralCode?: string;
}

interface IdpLoginResponse {
  access_token?: string;
  refresh_token: string;
  token_type?: string;
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

@Injectable({ providedIn: 'root' })
export class ClientAuthService {
  private isBrowser: boolean;
  private apiUrl = environment.apiUrl;
  private idpBase = environment.idpUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // -------------------------------------------------------------------------
  // Signup
  //
  // POST {idp}/auth/register → returns {refresh_token}, then exchange for a
  // Spark-scoped access token. The IDP emits an email verification link as a
  // side-effect; the magic-link landing page (/verificar) handles the rest.
  // -------------------------------------------------------------------------
  signup(payload: SignupRequest, fingerprint = ''): Observable<TokenPair> {
    // Plan 7 hardening (2026-05-22): Spark é 100% IDP, sem end users.
    // Quem se cadastra aqui é cliente Akroma virando tenant_owner.
    // O backend Spark cuida do auto-create do tenant na primeira chamada
    // autenticada (bridge em src/core/dependencies.py).
    const body = {
      email: payload.email,
      password: payload.password,
      full_name: payload.name,
      phone: payload.whatsapp || undefined,
      fingerprint: fingerprint || undefined,
      product: 'spark',
      role: 'tenant_owner' as const,
    };
    return this.http.post<IdpLoginResponse>(`${this.idpBase}/auth/register`, body).pipe(
      switchMap(res => this.exchange(res.refresh_token)),
      tap(pair => this.persistTokens(pair))
    );
  }

  // -------------------------------------------------------------------------
  // Login
  // -------------------------------------------------------------------------
  login(email: string, password: string): Observable<TokenPair> {
    return this.http
      .post<IdpLoginResponse>(`${this.idpBase}/auth/login`, { email, password })
      .pipe(
        switchMap(res => this.exchange(res.refresh_token)),
        tap(pair => this.persistTokens(pair)),
        switchMap(pair =>
          this.refreshClientInfo().pipe(
            map(() => pair),
            catchError(() => of(pair))
          )
        )
      );
  }

  // -------------------------------------------------------------------------
  // Forgot password — 6-digit code flow
  // -------------------------------------------------------------------------
  requestResetCode(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.idpBase}/auth/forgot-password-code`,
      { email },
    );
  }

  verifyResetCode(email: string, code: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(
      `${this.idpBase}/auth/verify-reset-code`,
      { email, code },
    );
  }

  resetPasswordWithCode(
    email: string, code: string, newPassword: string,
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.idpBase}/auth/reset-password-with-code`,
      { email, code, new_password: newPassword },
    );
  }

  /**
   * Persist a JWT obtained from a magic-link redirect (#jwt=...).
   * Used by /verificar after the IDP redirects the user back to the FE.
   */
  saveSessionFromJwt(jwt: string): void {
    if (!this.isBrowser) return;
    sessionStorage.setItem(ID_TOKEN_KEY, jwt);
    // Seed minimal ClientInfo from claims so the dashboard has something to
    // render before /me lands. Full info loads lazily.
    try {
      const claims = this.decodeClaims(jwt);
      if (claims) {
        const seed: ClientInfo = {
          clientId: String(claims['sub'] ?? ''),
          name: String(claims['name'] ?? ''),
          email: typeof claims['email'] === 'string' ? claims['email'] : undefined,
          planTier: 'STARTER',
        };
        sessionStorage.setItem(CLIENT_KEY, JSON.stringify(seed));
      }
    } catch {
      // Ignore decode errors — /me will populate ClientInfo.
    }
  }

  logout(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem(ID_TOKEN_KEY);
      sessionStorage.removeItem(CLIENT_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    this.router.navigate(['/entrar']);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    const token = sessionStorage.getItem(ID_TOKEN_KEY);
    if (!token) return false;
    const claims = this.decodeClaims(token);
    if (!claims || typeof claims['exp'] !== 'number') return false;
    return claims['exp'] * 1000 > Date.now();
  }

  getToken(): string | null {
    return this.isBrowser ? sessionStorage.getItem(ID_TOKEN_KEY) : null;
  }

  /** HttpHeaders with Bearer token for authenticated Spark backend requests. */
  authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  /** Returns JWT claims from the access token, or null. */
  getClaims(): Record<string, any> | null {
    const token = this.getToken();
    return token ? this.decodeClaims(token) : null;
  }

  getClient(): ClientInfo | null {
    if (!this.isBrowser) return null;
    const raw = sessionStorage.getItem(CLIENT_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as ClientInfo; } catch { return null; }
  }

  /** Patch specific fields in the stored ClientInfo without touching the token. */
  updateStoredClient(updates: Partial<ClientInfo>): void {
    if (!this.isBrowser) return;
    const current = this.getClient() ?? this.minimalClient();
    sessionStorage.setItem(CLIENT_KEY, JSON.stringify({ ...current, ...updates }));
  }

  /**
   * Fetch fresh ClientInfo from the Spark backend (`/api/v1/client/me`) and
   * cache it in sessionStorage. Components can call this on init when they
   * need up-to-date profile fields (planTier, trialActive, instagram state).
   */
  refreshClientInfo(): Observable<ClientInfo | null> {
    if (!this.isBrowser || !this.getToken()) return of(null);
    return this.http
      .get<any>(`${this.apiUrl}/api/v1/client/me`, { headers: this.authHeaders() })
      .pipe(
        map(p => this.normalizeProfile(p)),
        tap(info => {
          if (info) sessionStorage.setItem(CLIENT_KEY, JSON.stringify(info));
        }),
        catchError(() => of(null))
      );
  }

  /**
   * Force re-exchange the stored refresh_token for a fresh access_token.
   * Used after email verification so the access_token's email_verified claim
   * is updated server-side without forcing the user to log in again.
   */
  refreshTokens(): Observable<TokenPair | null> {
    if (!this.isBrowser) return of(null);
    const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!rt) return of(null);
    return this.exchange(rt).pipe(
      tap(pair => this.persistTokens(pair)),
      catchError(() => of(null))
    );
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------
  private exchange(refreshToken: string): Observable<TokenPair> {
    return this.http.post<TokenPair>(
      `${this.idpBase}/token/exchange?audience=spark`,
      { refresh_token: refreshToken }
    );
  }

  private persistTokens(pair: TokenPair): void {
    if (!this.isBrowser) return;
    sessionStorage.setItem(ID_TOKEN_KEY, pair.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, pair.refresh_token);
    // Seed ClientInfo from claims so guards/dashboard have *something* before
    // /me resolves.
    const claims = this.decodeClaims(pair.access_token);
    if (claims) {
      const seed: ClientInfo = {
        clientId: String(claims['sub'] ?? ''),
        name: String(claims['name'] ?? ''),
        email: typeof claims['email'] === 'string' ? claims['email'] : undefined,
        planTier: this.extractPlanTier(claims) ?? 'STARTER',
      };
      sessionStorage.setItem(CLIENT_KEY, JSON.stringify(seed));
    }
  }

  private extractPlanTier(claims: Record<string, any>): string | null {
    const spark = claims?.['products']?.['spark'];
    if (spark && typeof spark['plan_tier'] === 'string') return spark['plan_tier'];
    return null;
  }

  private normalizeProfile(p: any): ClientInfo | null {
    if (!p) return null;
    return {
      clientId: p.clientId ?? p.client_id ?? p.id ?? '',
      name: p.name ?? '',
      email: p.email,
      planTier: p.planTier ?? p.plan_tier ?? 'STARTER',
      referralCode: p.referralCode ?? p.referral_code,
      trialEndsAt: p.trialEndsAt ?? p.trial_ends_at,
      trialActive: p.trialActive ?? p.trial_active,
      active: p.active,
      selectedNiche: p.selectedNiche ?? p.selected_niche,
      instagramConnected: p.instagramConnected ?? p.instagram_connected,
      instagramUsername: p.instagramUsername ?? p.instagram_username,
    };
  }

  private decodeClaims(jwt: string): Record<string, any> | null {
    try {
      const parts = jwt.split('.');
      if (parts.length < 2) return null;
      return JSON.parse(this.base64UrlDecode(parts[1]));
    } catch {
      return null;
    }
  }

  private base64UrlDecode(input: string): string {
    let s = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = s.length % 4;
    if (pad) s += '='.repeat(4 - pad);
    return atob(s);
  }

  private minimalClient(): ClientInfo {
    return { clientId: '', name: '', planTier: 'STARTER' };
  }
}
