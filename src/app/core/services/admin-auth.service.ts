// src/app/core/services/admin-auth.service.ts
//
// Spark admin auth — consumes the Akroma IDP (Plan 4C of the unified-roles
// migration). The legacy `${apiUrl}/api/v1/auth/login` endpoint was deleted in
// Plan 4A; all auth now flows through the IDP at `environment.idpUrl`.
//
// Login flow:
//   1) POST {idpUrl}/auth/login → returns {access_token (aud=portal), refresh_token}
//   2) POST {idpUrl}/token/exchange?audience=spark → returns Spark-scoped access_token
//   3) Persist access_token (session) + refresh_token (local)
//
// Admin authority is decided from the JWT claims:
//   - `akroma_level === 'akroma_super_admin' | 'akroma_staff'`  (preferred)
//   - `is_admin === true`                                       (legacy fallback)
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, switchMap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

const ID_TOKEN_KEY = 'akroma_id_token';
const REFRESH_TOKEN_KEY = 'akroma_identity_rt';

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
export class AdminAuthService {
  private isBrowser: boolean;
  private idpBase = environment.idpUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Authenticate against the IDP and exchange for a Spark-scoped access token.
   * Returns the final TokenPair so callers can chain on success.
   */
  login(email: string, password: string): Observable<TokenPair> {
    return this.http
      .post<IdpLoginResponse>(`${this.idpBase}/auth/login`, { email, password })
      .pipe(
        switchMap(res =>
          this.http.post<TokenPair>(
            `${this.idpBase}/token/exchange?audience=spark`,
            { refresh_token: res.refresh_token }
          )
        ),
        tap(pair => this.persist(pair))
      );
  }

  logout(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem(ID_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    this.router.navigate(['/admin/nichos']);
  }

  /** True iff a non-expired token with admin authority is held. */
  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    const claims = this.getClaims();
    if (!claims) return false;
    if (typeof claims['exp'] !== 'number' || claims['exp'] * 1000 <= Date.now()) {
      return false;
    }
    return this.isAdminFromClaims(claims);
  }

  /** True iff the caller is Akroma staff or super-admin. */
  isAdmin(): boolean {
    return this.isAdminFromClaims(this.getClaims());
  }

  /** True iff the caller is specifically akroma_super_admin. */
  isSuperAdmin(): boolean {
    const claims = this.getClaims();
    return claims?.['akroma_level'] === 'akroma_super_admin';
  }

  getToken(): string | null {
    return this.isBrowser ? sessionStorage.getItem(ID_TOKEN_KEY) : null;
  }

  authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  /** Decode and return the JWT payload, or null. */
  getClaims(): Record<string, any> | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      return JSON.parse(this.base64UrlDecode(parts[1]));
    } catch {
      return null;
    }
  }

  private isAdminFromClaims(claims: Record<string, any> | null): boolean {
    if (!claims) return false;
    const level = claims['akroma_level'];
    if (level === 'akroma_super_admin' || level === 'akroma_staff') return true;
    // Transition fallback for tokens minted before Plan 1 rollout.
    return claims['is_admin'] === true;
  }

  private persist(pair: TokenPair): void {
    if (!this.isBrowser) return;
    sessionStorage.setItem(ID_TOKEN_KEY, pair.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, pair.refresh_token);
  }

  private base64UrlDecode(input: string): string {
    let s = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = s.length % 4;
    if (pad) s += '='.repeat(4 - pad);
    return atob(s);
  }
}
