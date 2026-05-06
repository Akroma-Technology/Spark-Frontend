import { Component, OnInit, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ClientAuthService } from '../core/services/client-auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-shell">
      <div class="callback-box">
        <div class="callback-icon" [class.callback-icon--success]="status === 'success'"
             [class.callback-icon--error]="status === 'error'">
          <svg *ngIf="status === 'loading'" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <svg *ngIf="status === 'success'" viewBox="0 0 24 24" fill="none" stroke="#22c55e"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <svg *ngIf="status === 'error'" viewBox="0 0 24 24" fill="none" stroke="#f87171"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h2 class="callback-title">
          <ng-container *ngIf="status === 'loading'">Conectando Instagram...</ng-container>
          <ng-container *ngIf="status === 'success'">Instagram conectado!</ng-container>
          <ng-container *ngIf="status === 'error'">Erro ao conectar</ng-container>
          <ng-container *ngIf="status === 'no-session'">Sessao expirada</ng-container>
        </h2>

        <p class="callback-msg">
          <ng-container *ngIf="status === 'loading'">Aguarde enquanto processamos a autorizacao...</ng-container>
          <ng-container *ngIf="status === 'success'">
            &#64;{{ instagramUsername }} conectado com sucesso. Redirecionando para o painel...
          </ng-container>
          <ng-container *ngIf="status === 'error'">{{ errorMsg }}</ng-container>
          <ng-container *ngIf="status === 'no-session'">
            Sua sessao expirou. Faca login novamente para conectar o Instagram.
          </ng-container>
        </p>

        <button *ngIf="status === 'error' || status === 'no-session'"
                class="callback-btn" type="button" (click)="goToApp()">
          Voltar ao painel
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #050912; min-height: 100vh; }
    .callback-shell {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 24px;
    }
    .callback-box {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px; padding: 48px 40px; max-width: 440px; width: 100%;
      text-align: center;
    }
    .callback-icon {
      width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2);
    }
    .callback-icon--success { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.2); }
    .callback-icon--error   { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); }
    .callback-icon svg { width: 28px; height: 28px; color: #fbbf24; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .callback-title {
      font-size: 22px; font-weight: 800; color: #fff; margin: 0 0 12px;
    }
    .callback-msg { font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px; }
    .callback-btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 10px 24px; border-radius: 10px; font-weight: 600; font-size: 14px;
      background: linear-gradient(135deg, #f59e0b, #d97706); color: #000;
      border: none; cursor: pointer; transition: all 0.2s;
    }
    .callback-btn:hover { filter: brightness(1.08); }
  `]
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private auth = inject(ClientAuthService);

  status: 'loading' | 'success' | 'error' | 'no-session' = 'loading';
  errorMsg = '';
  instagramUsername = '';

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const code = this.route.snapshot.queryParamMap.get('code');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error || !code) {
      this.status = 'error';
      this.errorMsg = 'Autorizacao negada ou cancelada. Tente novamente.';
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.status = 'no-session';
      return;
    }

    const headers = this.auth.authHeaders();
    this.http.post<{ status: string; instagramUsername: string }>(
      `${environment.apiUrl}/api/v1/client/instagram/callback`,
      { code },
      { headers }
    ).subscribe({
      next: (res) => {
        this.instagramUsername = res.instagramUsername;
        this.status = 'success';
        // Redirect to dashboard with success flag after 2 seconds
        setTimeout(() => this.router.navigate(['/app'], { queryParams: { ig: 'connected' } }), 2000);
      },
      error: (err) => {
        this.status = 'error';
        this.errorMsg = err.error?.error || 'Erro ao processar a conexao. Tente novamente.';
      }
    });
  }

  goToApp(): void {
    this.router.navigate(['/app']);
  }
}
