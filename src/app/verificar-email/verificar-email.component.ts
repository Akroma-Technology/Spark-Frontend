import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ClientAuthService } from '../core/services/client-auth.service';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-verificar-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SparkTopbarComponent],
  template: `
    <app-spark-topbar />
    <main class="auth-page">
      <div class="auth-card">
        <ng-container *ngIf="!verified; else doneTpl">
          <div class="icon">✉</div>
          <h1>Confirme seu email</h1>
          <p class="muted">
            Enviamos um código de 6 dígitos para <strong>{{ email }}</strong>.
            Digite-o abaixo para ativar sua conta. Verifique também o spam.
          </p>
          <form #f="ngForm" (ngSubmit)="onSubmit(f)" novalidate>
            <label>Código de verificação
              <input type="text" name="code" [(ngModel)]="code" required pattern="\\d{6}"
                maxlength="6" inputmode="numeric" autocomplete="one-time-code"
                placeholder="000000" class="code-input" autofocus />
            </label>
            <p *ngIf="error" class="error">{{ error }}</p>
            <p *ngIf="resent" class="info">Novo código enviado.</p>
            <button class="btn-primary" type="submit" [disabled]="code.length !== 6 || loading">
              {{ loading ? 'Verificando…' : 'Confirmar email' }}
            </button>
            <div class="link-row">
              <button type="button" class="link-btn" (click)="resendCode()" [disabled]="loading">
                Reenviar código
              </button>
              <a class="back-link" routerLink="/entrar">← Voltar para login</a>
            </div>
          </form>
        </ng-container>

        <ng-template #doneTpl>
          <h1>Email confirmado ✓</h1>
          <p class="muted">Tudo certo! Redirecionando para o painel em <strong>{{ countdown }}</strong>…</p>
          <a class="btn-primary" routerLink="/app">Ir para o painel agora</a>
        </ng-template>
      </div>
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0b0d11; color: #f1f5f9; }
    .auth-page {
      display: flex; align-items: center; justify-content: center;
      min-height: calc(100vh - 80px); padding: 24px;
    }
    .auth-card {
      background: #111827; border: 1px solid #1f2937; border-radius: 16px;
      padding: 36px 32px; max-width: 440px; width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,.3); text-align: center;
    }
    .icon {
      font-size: 36px; line-height: 1; margin-bottom: 12px;
      color: #fbbf24;
    }
    h1 { margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #f1f5f9; }
    .muted { margin: 0 0 24px; color: #9ca3af; font-size: 14px; line-height: 1.5; }
    .muted strong { color: #f1f5f9; }
    label { display: block; margin-bottom: 16px; font-size: 13px; color: #d1d5db; font-weight: 600; text-align: left; }
    input {
      width: 100%; padding: 12px 14px; margin-top: 6px; box-sizing: border-box;
      background: #0f1623; border: 1px solid #1f2937; border-radius: 10px;
      color: #f1f5f9; font-size: 14px; font-family: inherit;
    }
    input:focus { outline: none; border-color: #fbbf24; }
    .code-input {
      font-family: 'Courier New', monospace; font-size: 28px;
      letter-spacing: 8px; text-align: center; font-weight: 700;
    }
    .btn-primary {
      display: inline-block; width: 100%; box-sizing: border-box; margin-top: 8px;
      padding: 14px 20px; background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
      color: #1f2937; font-weight: 700; font-size: 15px; border: 0; border-radius: 10px;
      cursor: pointer; transition: transform .1s, opacity .15s; text-align: center;
      text-decoration: none;
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
    .btn-primary:disabled { opacity: .55; cursor: not-allowed; }
    .error {
      color: #f87171; font-size: 13px; margin: 4px 0 12px; text-align: left;
      background: rgba(239,68,68,.08); padding: 10px 12px; border-radius: 8px;
      border-left: 3px solid #ef4444;
    }
    .info {
      color: #4ade80; font-size: 13px; margin: 4px 0 12px; text-align: left;
      background: rgba(74,222,128,.08); padding: 10px 12px; border-radius: 8px;
      border-left: 3px solid #4ade80;
    }
    .back-link { color: #9ca3af; font-size: 13px; text-decoration: none; }
    .back-link:hover { color: #fbbf24; }
    .link-row { display: flex; justify-content: space-between; margin-top: 16px; }
    .link-btn {
      background: transparent; border: 0; color: #fbbf24; font-size: 13px;
      cursor: pointer; padding: 0; font-family: inherit;
    }
    .link-btn:hover:not(:disabled) { text-decoration: underline; }
    .link-btn:disabled { opacity: .5; cursor: not-allowed; }
  `],
})
export class VerificarEmailComponent implements OnInit {
  private auth = inject(ClientAuthService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  email = '';
  code = '';
  loading = false;
  error = '';
  resent = false;
  verified = false;
  countdown = 4;

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      // Sem email pra verificar → manda pra cadastro
      this.router.navigate(['/cadastro']);
    }
  }

  onSubmit(form: NgForm): void {
    if (!form.valid || this.loading) return;
    this.loading = true;
    this.error = '';
    this.resent = false;
    this.http.post(`${environment.idpUrl}/auth/verify-email-code`, {
      email: this.email,
      code: this.code,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.verified = true;
        // Re-trigger token-exchange so the new access_token carries email_verified=true.
        this.auth.refreshTokens().subscribe({
          next: () => this.startCountdown(),
          error: () => this.startCountdown(),  // proceed anyway
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const detail = (err.error && err.error.detail) || '';
        this.error = detail || 'Código inválido ou expirado.';
      },
    });
  }

  resendCode(): void {
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    this.resent = false;
    this.http.post(`${environment.idpUrl}/auth/resend-verification-code`, {
      email: this.email,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.code = '';
        this.resent = true;
      },
      error: () => {
        this.loading = false;
        this.error = 'Falha ao reenviar.';
      },
    });
  }

  private startCountdown(): void {
    const timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(timer);
        this.router.navigate(['/app']);
      }
    }, 1000);
  }
}
