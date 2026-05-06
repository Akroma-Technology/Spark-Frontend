import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'akroma_client_token';
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

export interface LoginResponse extends ClientInfo {
  token: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ClientAuthService {
  private isBrowser: boolean;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  signup(payload: SignupRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/v1/client-auth/signup`, payload).pipe(
      tap(res => this.persist(res))
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/v1/client-auth/login`, { email, password }).pipe(
      tap(res => this.persist(res))
    );
  }

  logout(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(CLIENT_KEY);
    }
    this.router.navigate(['/entrar']);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  }

  getToken(): string | null {
    return this.isBrowser ? sessionStorage.getItem(TOKEN_KEY) : null;
  }

  /** Returns HttpHeaders with Bearer token for authenticated requests. */
  authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  getClient(): ClientInfo | null {
    if (!this.isBrowser) return null;
    const raw = sessionStorage.getItem(CLIENT_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as ClientInfo; } catch { return null; }
  }

  private persist(res: LoginResponse): void {
    if (!this.isBrowser) return;
    sessionStorage.setItem(TOKEN_KEY, res.token);
    const { token, message, ...client } = res;
    sessionStorage.setItem(CLIENT_KEY, JSON.stringify(client));
  }
}
