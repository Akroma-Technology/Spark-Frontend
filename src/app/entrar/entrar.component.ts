import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientAuthService } from '../core/services/client-auth.service';
import { SeoService } from '../core/services/seo.service';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';
import { ParticleNetworkComponent } from '../shared/components/particle-network.component';

@Component({
  selector: 'app-entrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SparkTopbarComponent, ParticleNetworkComponent],
  template: `
    <div class="login-wrapper">
      <app-particle-network color="#fbbf24" />
      <app-spark-topbar></app-spark-topbar>
      <div class="topbar-divider" aria-hidden="true"></div>

      <div class="page">
        <div class="page__glow"></div>

        <div class="card">
          <div class="card__brand">
            <img src="assets/icone-akroma.png" alt="" class="card__logo" aria-hidden="true">
            <span class="card__brand-name">Akroma <span class="card__brand-accent">Spark</span></span>
          </div>

          <h1 class="card__title">Bem-vindo de volta</h1>
          <p class="card__sub">Entre com sua conta para continuar</p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="form" [attr.aria-busy]="loading">
            <input type="text" formControlName="website" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">

            <label class="field">
              <span class="field__label">E-mail</span>
              <input
                class="field__input"
                type="email"
                formControlName="email"
                placeholder="voce@empresa.com"
                autocomplete="email"
                autofocus
              />
              @if (hasError('email')) { <span class="field__error">{{ getError('email') }}</span> }
            </label>

            <label class="field">
              <span class="field__label">Senha</span>
              <div class="field__password">
                <input
                  class="field__input"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  (keyup)="onCapsKey($event)"
                  (keydown)="onCapsKey($event)"
                />
                <button type="button" class="field__eye" (click)="toggleShow()" [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'">
                  @if (showPassword) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.45 18.45 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  } @else {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              @if (capsOn) { <span class="field__caps" role="status">⚠ Caps Lock ativado</span> }
              @if (hasError('password')) { <span class="field__error">{{ getError('password') }}</span> }
            </label>

            @if (error) {
              <div class="alert" role="alert" aria-live="polite">
                <svg class="alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{{ error }}</span>
              </div>
            }

            <button type="submit" class="btn-submit" [disabled]="!form?.valid || loading">
              @if (loading) { <span class="spinner"></span> Entrando… }
              @else { Entrar }
            </button>

            <p class="card__forgot">
              <a [routerLink]="'/esqueci-senha'" [queryParams]="{ email: form?.get('email')?.value || null }" class="link">Esqueci a senha</a>
            </p>
          </form>

          <p class="card__switch">
            Quer assinar o Spark? <a routerLink="/contato" class="link">Entre em contato com a equipe</a>
          </p>

          <p class="card__legal">
            Ao continuar, você concorda com os
            <a href="https://akroma.com.br/termos-de-uso" target="_blank" rel="noopener">Termos de Uso</a>
            e a
            <a href="https://akroma.com.br/politica-privacidade" target="_blank" rel="noopener">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --ak-accent:      #fbbf24;
      --ak-accent-2:    #f59e0b;
      --ak-accent-deep: #d97706;
      --ak-logo-filter: brightness(0) saturate(100%) invert(76%) sepia(43%) saturate(1100%) hue-rotate(358deg) brightness(101%) contrast(99%);
    }

    .login-wrapper {
      min-height: 100vh;
      background: #050810;
      display: flex; flex-direction: column;
    }

    .topbar-divider {
      position: fixed;
      top: 72px;
      left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, var(--ak-accent) 50%, transparent 100%);
      box-shadow: 0 0 16px color-mix(in srgb, var(--ak-accent) 60%, transparent);
      z-index: 51;
      pointer-events: none;
      opacity: 0.55;
    }

    .page {
      flex: 1;
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
      padding: 72px 24px 40px;
    }
    .page__glow {
      position: absolute; top: 0; left: 50%; transform: translateX(-50%);
      width: 700px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--ak-accent-deep) 12%, transparent), transparent 70%);
      pointer-events: none;
    }

    .card {
      position: relative; z-index: 1;
      width: 100%; max-width: 380px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 32px 28px;
      backdrop-filter: blur(10px);
    }

    .card__brand { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
    .card__logo { height: 36px; width: auto; filter: var(--ak-logo-filter); }
    .card__brand-name { font-size: 17px; font-weight: 700; color: #fff; }
    .card__brand-accent {
      background: linear-gradient(135deg, var(--ak-accent), var(--ak-accent-2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .card__title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: #fff; margin: 0 0 6px; }
    .card__sub { font-size: 0.9rem; color: #6b7280; margin: 0 0 28px; }

    .form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field__label { font-size: 13px; font-weight: 600; color: #cbd5e1; }
    .field__input {
      padding: 12px 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      font-size: 15px; color: #fff; outline: none;
      transition: border-color 0.15s, background 0.15s;
      width: 100%; box-sizing: border-box;
    }
    .field__input::placeholder { color: #374151; }
    .field__input:focus-visible {
      border-color: color-mix(in srgb, var(--ak-accent) 50%, transparent);
      background: rgba(255,255,255,0.06);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ak-accent) 20%, transparent);
    }
    .field__error { font-size: 12px; color: #fca5a5; }
    .field__caps { font-size: 12px; color: #fcd34d; }
    .field__password { position: relative; }
    .field__password .field__input { padding-right: 44px; }
    .field__eye {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      background: transparent; border: none; color: #9ca3af; cursor: pointer;
      padding: 6px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.15s, background 0.15s;
    }
    .field__eye:hover { color: #fff; background: rgba(255,255,255,0.06); }
    .field__eye svg { width: 18px; height: 18px; }
    .honeypot {
      position: absolute !important;
      left: -9999px !important;
      width: 1px !important; height: 1px !important;
      opacity: 0 !important; pointer-events: none;
    }

    .alert {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 10px 14px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 8px;
      font-size: 13px; color: #fca5a5;
    }
    .alert__icon { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; }

    .btn-submit {
      margin-top: 4px;
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, var(--ak-accent), var(--ak-accent-deep));
      color: #fff; font-size: 15px; font-weight: 700;
      border: none; border-radius: 12px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 20px -4px color-mix(in srgb, var(--ak-accent) 50%, transparent);
      transition: filter 0.15s, transform 0.15s;
    }
    .btn-submit:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    .spinner {
      display: inline-block; width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .card__switch { margin-top: 20px; text-align: center; font-size: 14px; color: #6b7280; }
    .card__forgot { margin: 12px 0 0; text-align: center; font-size: 13px; }
    .link { color: var(--ak-accent-2); font-weight: 600; text-decoration: none; transition: color 0.15s; }
    .link:hover { color: var(--ak-accent); }

    .card__legal {
      margin-top: 18px;
      font-size: 11px; color: #374151;
      text-align: center; line-height: 1.6;
    }
    .card__legal a { color: #4b5563; text-decoration: none; transition: color 0.15s; }
    .card__legal a:hover { color: #9ca3af; }

    @media (max-width: 480px) { .card { padding: 28px 20px; } }
  `]
})
// Mensagens das razões que o interceptor (verify-email.interceptor) propaga
// via ?reason=... quando força redirect — uma fonte só pra logout normal,
// 403 EMAIL_NOT_VERIFIED, client_not_provisioned, no_product_access, etc.
const REASON_MESSAGES: Record<string, string> = {
  email_not_verified: 'E-mail ainda não verificado. Entre em contato com o suporte da Akroma.',
  client_not_provisioned:
    'Sua conta da Identity Akroma existe, mas você não tem acesso ao Spark. '
    + 'Para contratar, fale com a equipe Akroma.',
  no_product_access:
    'Você não tem acesso ao Spark com esta conta. '
    + 'Para contratar, fale com a equipe Akroma.',
  subscription_inactive:
    'Sua assinatura do Spark não está ativa. Entre em contato com o financeiro.',
  client_inactive:
    'Sua conta no Spark foi desativada. Entre em contato com o suporte.',
  account_suspended:
    'Esta conta está suspensa. Entre em contato com o suporte da Akroma.',
};

export class EntrarComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(ClientAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);

  form!: FormGroup;
  error = '';
  loading = false;
  showPassword = false;
  capsOn = false;

  toggleShow(): void { this.showPassword = !this.showPassword; }
  onCapsKey(e: KeyboardEvent): void {
    this.capsOn = e.getModifierState?.('CapsLock') ?? false;
  }

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Entrar — Akroma Spark',
      description: 'Acesse seu painel do Akroma Spark.',
      noindex: true
    });

    // Reason vem do verify-email.interceptor quando força redirect — mostra
    // mensagem clara em vez do user voltar à tela em branco achando que foi
    // bug de login.
    const reason = this.route.snapshot.queryParamMap.get('reason') || '';
    if (reason && REASON_MESSAGES[reason]) {
      this.error = REASON_MESSAGES[reason];
    }

    if (this.auth.isLoggedIn() && !reason) {
      this.router.navigate(['/app']);
      return;
    }

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      website: [''],  // honeypot
    });
  }

  submit(): void {
    if (this.form.value.website) return;  // honeypot
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/app']),
      error: (err: HttpErrorResponse) => {
        // detail pode ser string OU {reason,message} — extrai reason quando
        // for objeto (IDP novo retorna {reason:'no_product_access',message:..}).
        const detail = err.error?.detail;
        const detailReason = (typeof detail === 'object' && detail?.reason) || (typeof detail === 'string' ? detail : '');
        const mapped = REASON_MESSAGES[detailReason];

        if (err.status === 401) {
          this.error = 'E-mail ou senha incorretos.';
        } else if (err.status === 403 && mapped) {
          this.error = mapped;
        } else if (err.status === 403 && typeof detail === 'object' && detail?.message) {
          // fallback pra qualquer 403 com objeto — usa o message do backend
          this.error = String(detail.message);
        } else if (err.status === 0) {
          this.error = 'Sem conexão com o servidor. Verifique sua internet.';
        } else {
          this.error = `Erro ao entrar (${err.status}). Tente novamente em instantes.`;
        }
        this.loading = false;
      }
    });
  }

  hasError(field: string): boolean {
    const ctrl = this.form?.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  getError(field: string): string {
    const ctrl = this.form?.get(field);
    if (!ctrl?.errors || !ctrl?.touched) return '';
    if (ctrl.errors['required']) return 'Campo obrigatório.';
    if (ctrl.errors['email']) return 'E-mail inválido.';
    return '';
  }
}
