import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientAuthService } from '../core/services/client-auth.service';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';

type Step = 'email' | 'code' | 'password' | 'done';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SparkTopbarComponent],
  template: `
    <app-spark-topbar />
    <main class="auth-page">
      <div class="auth-card">
        <ng-container [ngSwitch]="step">

          <!-- Step 1: enter email -->
          <ng-container *ngSwitchCase="'email'">
            <h1>Recuperar senha</h1>
            <p class="muted">Informe seu email cadastrado. Enviaremos um código de 6 dígitos.</p>
            <form #emailForm="ngForm" (ngSubmit)="onSubmitEmail(emailForm)" novalidate>
              <label>E-mail
                <input type="email" name="email" [(ngModel)]="email" required email
                  autocomplete="email" placeholder="voce@empresa.com" autofocus />
              </label>
              <p *ngIf="error" class="error">{{ error }}</p>
              <button class="btn-primary" type="submit" [disabled]="!emailForm.valid || loading">
                {{ loading ? 'Enviando…' : 'Enviar código' }}
              </button>
              <a class="back-link" routerLink="/entrar">← Voltar para login</a>
            </form>
          </ng-container>

          <!-- Step 2: enter code -->
          <ng-container *ngSwitchCase="'code'">
            <h1>Digite o código</h1>
            <p class="muted">Enviamos um código de 6 dígitos para <strong>{{ email }}</strong>.</p>
            <form #codeForm="ngForm" (ngSubmit)="onSubmitCode(codeForm)" novalidate>
              <label>Código
                <input type="text" name="code" [(ngModel)]="code" required pattern="\\d{6}"
                  maxlength="6" inputmode="numeric" autocomplete="one-time-code"
                  placeholder="000000" class="code-input" autofocus />
              </label>
              <p *ngIf="error" class="error">{{ error }}</p>
              <button class="btn-primary" type="submit" [disabled]="code.length !== 6 || loading">
                {{ loading ? 'Verificando…' : 'Confirmar código' }}
              </button>
              <div class="link-row">
                <button type="button" class="link-btn" (click)="resendCode()" [disabled]="loading">
                  Reenviar código
                </button>
                <a class="back-link" routerLink="/entrar">← Voltar para login</a>
              </div>
            </form>
          </ng-container>

          <!-- Step 3: new password -->
          <ng-container *ngSwitchCase="'password'">
            <h1>Nova senha</h1>
            <p class="muted">Digite e confirme sua nova senha (mínimo 8 caracteres).</p>
            <form #pwdForm="ngForm" (ngSubmit)="onSubmitPassword(pwdForm)" novalidate>
              <label>Nova senha
                <input type="password" name="newPassword" [(ngModel)]="newPassword" required
                  minlength="8" autocomplete="new-password" />
              </label>
              <label>Confirmar nova senha
                <input type="password" name="confirmPassword" [(ngModel)]="confirmPassword" required
                  minlength="8" autocomplete="new-password" />
              </label>
              <p *ngIf="error" class="error">{{ error }}</p>
              <button class="btn-primary" type="submit"
                [disabled]="!pwdForm.valid || newPassword !== confirmPassword || loading">
                {{ loading ? 'Salvando…' : 'Alterar senha' }}
              </button>
              <a class="back-link" routerLink="/entrar">← Voltar para login</a>
            </form>
          </ng-container>

          <!-- Step 4: done with countdown -->
          <ng-container *ngSwitchCase="'done'">
            <h1>Senha alterada ✓</h1>
            <p class="muted">Sua senha foi alterada com sucesso.</p>
            <p>Redirecionando para o login em <strong>{{ countdown }}</strong>…</p>
            <a class="btn-primary" routerLink="/entrar">Ir para login agora</a>
          </ng-container>

        </ng-container>
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
      box-shadow: 0 20px 40px rgba(0,0,0,.3);
    }
    h1 { margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #f1f5f9; }
    .muted { margin: 0 0 24px; color: #9ca3af; font-size: 14px; line-height: 1.5; }
    label { display: block; margin-bottom: 16px; font-size: 13px; color: #d1d5db; font-weight: 600; }
    input {
      width: 100%; padding: 12px 14px; margin-top: 6px; box-sizing: border-box;
      background: #0f1623; border: 1px solid #1f2937; border-radius: 10px;
      color: #f1f5f9; font-size: 14px; font-family: inherit;
    }
    input:focus { outline: none; border-color: #fbbf24; }
    .code-input {
      font-family: 'Courier New', monospace; font-size: 26px;
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
      color: #f87171; font-size: 13px; margin: 4px 0 12px;
      background: rgba(239,68,68,.08); padding: 10px 12px; border-radius: 8px;
      border-left: 3px solid #ef4444;
    }
    .back-link {
      display: block; margin-top: 16px; text-align: center;
      color: #9ca3af; font-size: 13px; text-decoration: none;
    }
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
export class EsqueciSenhaComponent implements OnInit {
  private auth = inject(ClientAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  step: Step = 'email';
  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error = '';
  countdown = 5;

  ngOnInit(): void {
    // Pre-fill email from query param (e.g. coming from login screen).
    const pre = this.route.snapshot.queryParamMap.get('email');
    if (pre) this.email = pre;
  }

  onSubmitEmail(form: NgForm): void {
    if (!form.valid || this.loading) return;
    this.loading = true;
    this.error = '';
    this.auth.requestResetCode(this.email).subscribe({
      next: () => { this.loading = false; this.step = 'code'; },
      error: () => {
        this.loading = false;
        this.error = 'Não foi possível enviar o código. Tente novamente em alguns instantes.';
      },
    });
  }

  resendCode(): void {
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    this.auth.requestResetCode(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.code = '';
        this.error = 'Novo código enviado.';
      },
      error: () => {
        this.loading = false;
        this.error = 'Falha ao reenviar.';
      },
    });
  }

  onSubmitCode(form: NgForm): void {
    if (!form.valid || this.loading) return;
    this.loading = true;
    this.error = '';
    this.auth.verifyResetCode(this.email, this.code).subscribe({
      next: () => { this.loading = false; this.step = 'password'; },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const detail = (err.error && err.error.detail) || '';
        this.error = detail || 'Código inválido ou expirado.';
      },
    });
  }

  onSubmitPassword(form: NgForm): void {
    if (!form.valid || this.loading) return;
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'As senhas não conferem.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.resetPasswordWithCode(this.email, this.code, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'done';
        this.startCountdown();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const detail = (err.error && err.error.detail) || '';
        this.error = detail || 'Falha ao alterar senha. O código pode ter expirado.';
      },
    });
  }

  private startCountdown(): void {
    const timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(timer);
        this.router.navigate(['/entrar']);
      }
    }, 1000);
  }
}
