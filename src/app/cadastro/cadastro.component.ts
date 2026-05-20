import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientAuthService } from '../core/services/client-auth.service';
import { FingerprintService } from '../core/services/fingerprint.service';
import { SeoService } from '../core/services/seo.service';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SparkTopbarComponent],
  template: `
    <div class="login-wrapper">
      <app-spark-topbar></app-spark-topbar>

      <div class="page">
        <div class="page__glow"></div>

        <div class="card">
          <div class="card__brand">
            <img src="/assets/akroma-icon.svg" alt="" class="card__logo" aria-hidden="true" onerror="this.style.display='none'">
            <span class="card__brand-name">Akroma <span class="card__brand-accent">Spark</span></span>
          </div>

          @if (pendingEmail) {
            <div class="verify-step">
              <div class="verify-icon">✉️</div>
              <h1 class="card__title">Confirme seu e-mail</h1>
              <p class="card__sub">
                Enviamos um link de confirmação para <strong class="verify-email">{{ pendingEmail }}</strong>.
                Clique no link para ativar sua conta. Verifique também a caixa de spam.
              </p>
              <a routerLink="/app" class="btn-submit">Ir para o painel →</a>
            </div>
          } @else {
            <div class="badge">TRIAL STARTER — 7 DIAS GRÁTIS</div>
            <h1 class="card__title">Crie sua conta</h1>
            <p class="card__sub">Sem cartão de crédito. Cancele quando quiser.</p>

            <form [formGroup]="form" (ngSubmit)="submit()" class="form">
              <label class="field">
                <span class="field__label">Seu nome</span>
                <input
                  class="field__input"
                  type="text"
                  formControlName="name"
                  placeholder="Como quer ser chamado"
                  autocomplete="name"
                />
                @if (hasError('name')) { <span class="field__error">{{ getError('name') }}</span> }
              </label>

              <label class="field">
                <span class="field__label">E-mail profissional</span>
                <input
                  class="field__input"
                  type="email"
                  formControlName="email"
                  placeholder="voce@empresa.com"
                  autocomplete="email"
                />
                @if (hasError('email')) { <span class="field__error">{{ getError('email') }}</span> }
              </label>

              <label class="field">
                <span class="field__label">Senha</span>
                <input
                  class="field__input"
                  type="password"
                  formControlName="password"
                  placeholder="Mínimo 6 caracteres"
                  autocomplete="new-password"
                />
                @if (hasError('password')) { <span class="field__error">{{ getError('password') }}</span> }
              </label>

              <label class="field">
                <span class="field__label">WhatsApp <span class="field__opt">(opcional)</span></span>
                <input
                  class="field__input"
                  type="tel"
                  formControlName="whatsapp"
                  placeholder="(11) 9 9999-9999"
                  autocomplete="tel"
                  maxlength="16"
                />
              </label>

              <label class="field">
                <span class="field__label">Código de indicação <span class="field__opt">(opcional)</span></span>
                <input
                  class="field__input"
                  type="text"
                  formControlName="referralCode"
                  placeholder="Se um amigo te indicou"
                  autocapitalize="characters"
                />
              </label>

              @if (error) { <div class="alert">{{ error }}</div> }

              <button type="submit" class="btn-submit" [disabled]="loading">
                @if (loading) { <span class="spinner"></span> Criando conta… }
                @else { Começar teste grátis → }
              </button>
            </form>

            <p class="card__switch">
              Já tem conta? <a routerLink="/entrar" class="link">Entrar</a>
            </p>

            <p class="card__legal">
              Ao continuar, você concorda com os
              <a href="https://akroma.com.br/termos-de-uso" target="_blank" rel="noopener">Termos de Uso</a>
              e a
              <a href="https://akroma.com.br/politica-privacidade" target="_blank" rel="noopener">Política de Privacidade</a>.
            </p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --ak-accent:      #f97316;
      --ak-accent-2:    #fb923c;
      --ak-accent-deep: #ea580c;
      --ak-logo-filter: brightness(0) saturate(100%) invert(56%) sepia(72%) saturate(1800%) hue-rotate(5deg) brightness(105%) contrast(101%);
    }

    .login-wrapper {
      min-height: 100vh;
      background: #050810;
      display: flex; flex-direction: column;
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
      width: 100%; max-width: 460px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 40px;
      backdrop-filter: blur(10px);
    }

    .card__brand { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .card__logo { height: 36px; width: auto; filter: var(--ak-logo-filter); }
    .card__brand-name { font-size: 17px; font-weight: 700; color: #fff; }
    .card__brand-accent {
      background: linear-gradient(135deg, var(--ak-accent), var(--ak-accent-2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .badge {
      display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
      color: var(--ak-accent-2);
      padding: 4px 12px; border-radius: 20px;
      background: color-mix(in srgb, var(--ak-accent) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--ak-accent) 25%, transparent);
      margin-bottom: 16px;
    }

    .card__title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: #fff; margin: 0 0 6px; }
    .card__sub { font-size: 0.9rem; color: #6b7280; margin: 0 0 28px; line-height: 1.5; }

    .form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field__label { font-size: 13px; font-weight: 600; color: #9ca3af; }
    .field__opt { color: #6b7280; font-weight: 400; margin-left: 4px; }
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
    .field__input:focus {
      border-color: color-mix(in srgb, var(--ak-accent) 50%, transparent);
      background: rgba(255,255,255,0.06);
    }
    .field__error { font-size: 12px; color: #fca5a5; }

    .alert {
      padding: 10px 14px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 8px;
      font-size: 13px; color: #fca5a5;
    }

    .btn-submit {
      margin-top: 4px;
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, var(--ak-accent), var(--ak-accent-deep));
      color: #fff; font-size: 15px; font-weight: 700;
      border: none; border-radius: 12px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 20px -4px color-mix(in srgb, var(--ak-accent) 50%, transparent);
      transition: filter 0.15s, transform 0.15s;
      text-decoration: none;
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
    .link { color: var(--ak-accent-2); font-weight: 600; text-decoration: none; transition: color 0.15s; }
    .link:hover { color: var(--ak-accent); }

    .card__legal {
      margin-top: 18px;
      font-size: 11px; color: #374151;
      text-align: center; line-height: 1.6;
    }
    .card__legal a { color: #4b5563; text-decoration: none; transition: color 0.15s; }
    .card__legal a:hover { color: #9ca3af; }

    .verify-step { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; }
    .verify-icon { font-size: 48px; line-height: 1; }
    .verify-email { color: #e5e7eb; }
    .verify-step .btn-submit { margin-top: 12px; }

    @media (max-width: 480px) { .card { padding: 28px 20px; } }
  `]
})
export class CadastroComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private auth = inject(ClientAuthService);
  private fp = inject(FingerprintService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);

  form!: FormGroup;
  error = '';
  loading = false;
  pendingEmail = '';

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Cadastro — Akroma Spark',
      description: 'Crie sua conta e comece o teste grátis de 7 dias do Akroma Spark.',
      noindex: true
    });

    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/app']);
      return;
    }

    const emailParam = this.route.snapshot.queryParamMap.get('email');
    const verifyParam = this.route.snapshot.queryParamMap.get('verify');
    if (emailParam && verifyParam === '1') {
      this.pendingEmail = emailParam;
    }

    const ref = this.route.snapshot.queryParamMap.get('ref') ?? '';
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      whatsapp: [''],
      referralCode: [ref]
    });

    this.form.get('whatsapp')?.valueChanges.subscribe(val => {
      if (!val) return;
      const d = String(val).replace(/\D/g, '').slice(0, 11);
      let m = '';
      if (d.length > 0) m  = '(' + d.slice(0, 2);
      if (d.length >= 3) m += ') ' + d.slice(2, 3);
      if (d.length >= 4) m += ' ' + d.slice(3, 7);
      if (d.length >= 8) m += '-' + d.slice(7, 11);
      if (m !== val) this.form.get('whatsapp')?.setValue(m, { emitEvent: false });
    });
  }

  ngOnDestroy(): void {}

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';

    this.fp.getVisitorId().then(visitorId => {
      const email = this.form.value.email;
      this.auth.signup(this.form.value, visitorId).subscribe({
        next: () => {
          this.loading = false;
          this.pendingEmail = email;
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            this.error = 'Este e-mail já está cadastrado. Que tal fazer login?';
          } else if (err.status === 0) {
            this.error = 'Sem conexão com o servidor. Verifique sua internet.';
          } else if (err.error?.detail) {
            this.error = err.error.detail;
          } else if (err.error?.error) {
            this.error = err.error.error;
          } else {
            this.error = `Erro ao criar conta (${err.status}). Tente novamente em instantes.`;
          }
          this.loading = false;
        }
      });
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
    if (ctrl.errors['minlength']) return `Mínimo de ${ctrl.errors['minlength'].requiredLength} caracteres.`;
    return '';
  }
}
