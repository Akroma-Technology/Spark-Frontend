import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientAuthService } from '../core/services/client-auth.service';
import { SeoService } from '../core/services/seo.service';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-entrar',
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

          <h1 class="card__title">Bem-vindo de volta</h1>
          <p class="card__sub">Entre com sua conta para continuar</p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="form">
            <label class="field">
              <span class="field__label">E-mail</span>
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
                placeholder="••••••••"
                autocomplete="current-password"
              />
              @if (hasError('password')) { <span class="field__error">{{ getError('password') }}</span> }
            </label>

            @if (error) { <div class="alert">{{ error }}</div> }

            <button type="submit" class="btn-submit" [disabled]="loading">
              @if (loading) { <span class="spinner"></span> Entrando… }
              @else { Entrar }
            </button>
          </form>

          <p class="card__switch">
            Não tem conta? <a routerLink="/cadastro" class="link">Cadastre-se aqui</a>
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
      width: 100%; max-width: 420px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 40px;
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
    .field__label { font-size: 13px; font-weight: 600; color: #9ca3af; }
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

    @media (max-width: 480px) { .card { padding: 28px 20px; } }
  `]
})
export class EntrarComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(ClientAuthService);
  private router = inject(Router);
  private seo = inject(SeoService);

  form!: FormGroup;
  error = '';
  loading = false;

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Entrar — Akroma Spark',
      description: 'Acesse seu painel do Akroma Spark.',
      noindex: true
    });

    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/app']);
      return;
    }

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/app']),
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.error = 'E-mail ou senha incorretos.';
        } else if (err.status === 403 && err.error?.detail === 'email_not_verified') {
          this.router.navigate(['/cadastro'], { queryParams: { email, verify: '1' } });
          return;
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
