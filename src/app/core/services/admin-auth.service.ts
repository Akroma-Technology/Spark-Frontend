// src/app/core/services/admin-auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const ADMIN_TOKEN_KEY = 'akroma_admin_token';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private isBrowser: boolean;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(email: string, password: string): Observable<{ access_token: string; role: string }> {
    return this.http
      .post<{ access_token: string; role: string }>(
        `${this.apiUrl}/api/v1/auth/login`,
        { email, password }
      )
      .pipe(tap(res => this.persist(res.access_token)));
  }

  logout(): void {
    if (this.isBrowser) sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    this.router.navigate(['/admin/nichos']);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin' && payload.exp * 1000 > Date.now();
    } catch { return false; }
  }

  getToken(): string | null {
    return this.isBrowser ? sessionStorage.getItem(ADMIN_TOKEN_KEY) : null;
  }

  authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private persist(token: string): void {
    if (this.isBrowser) sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}
