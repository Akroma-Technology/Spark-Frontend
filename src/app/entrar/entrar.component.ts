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
    <app-spark-topbar></app-spark-topbar>

    <section class="login-section">
      <div class="login-container">
        <h1 class="login-title">Entrar na sua conta</h1>

        <p class="login-subtitle">Acesse seu painel do Akroma Spark.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
          <div class="login-field">
            <label for="email">E-mail</label>
            <input id="email" type="email" formControlName="email" autocomplete="email" placeholder="voce@empresa.com" />
            <span class="login-error" *ngIf="hasError('email')">{{ getError('email') }}</span>
          </div>

          <div class="login-field">
            <label for="password">Senha</label>
            <input id="password" type="password" formControlName="password" autocomplete="current-password" />
            <span class="login-error" *ngIf="hasError('password')">{{ getError('password') }}</span>
          </div>

          <div class="login-error login-error--banner" *ngIf="error">{{ error }}</div>

          <button type="submit" class="btn btn--spark" [disabled]="loading">
            <span *ngIf="!loading">Entrar &rarr;</span>
            <span *ngIf="loading">Entrando...</span>
          </button>

          <div class="login-alt">
            Ainda nao tem conta? <a routerLink="/cadastro">Criar conta gratis</a>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; background: #050912; }
    .login-section {
      height: 100vh;
      padding-top: 72px;
      box-sizing: border-box;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .login-container {
      max-width: 420px; width: 100%; text-align: center;
    }
    .login-title {
      font-size: clamp(22px, 3vw, 28px); font-weight: 800; color: #fff;
      margin: 0 0 8px;
    }
    .login-subtitle { font-size: 14px; color: #9ca3af; margin: 0 0 32px; }

    .login-form {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px; padding: 32px;
      display: flex; flex-direction: column; gap: 16px; text-align: left;
    }
    .login-field { display: flex; flex-direction: column; gap: 6px; }
    .login-field label { font-size: 13px; font-weight: 600; color: #d1d5db; }
    .login-field input {
      padding: 12px 14px; border-radius: 10px; font-size: 15px;
      background: rgba(255,255,255,0.05); color: #fff;
      border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 0.15s, background 0.15s;
    }
    .login-field input:focus {
      outline: none; border-color: rgba(251,191,36,0.5); background: rgba(255,255,255,0.07);
    }
    .login-error { font-size: 12px; color: #f87171; }
    .login-error--banner {
      padding: 10px 14px; border-radius: 10px;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
    }

    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 14px 24px; border-radius: 10px; font-weight: 700; font-size: 15px;
      border: none; cursor: pointer; text-decoration: none;
      transition: all 0.2s;
    }
    .btn--spark {
      background: linear-gradient(135deg, #f59e0b, #d97706); color: #000;
      border: 1px solid rgba(251,191,36,0.4);
      box-shadow: 0 4px 16px -4px rgba(245,158,11,0.3);
      margin-top: 8px;
    }
    .btn--spark:hover:not(:disabled) {
      filter: brightness(1.08); transform: translateY(-1px);
      box-shadow: 0 8px 24px -6px rgba(245,158,11,0.4);
    }
    .btn--spark:disabled { opacity: 0.6; cursor: not-allowed; }

    .login-alt { font-size: 13px; color: #9ca3af; text-align: center; }
    .login-alt a { color: #fbbf24; text-decoration: none; font-weight: 600; }
    .login-alt a:hover { text-decoration: underline; }
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
        } else if (err.status === 0) {
          this.error = 'Sem conexao com o servidor. Verifique sua internet.';
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
    if (ctrl.errors['required']) return 'Campo obrigatorio.';
    if (ctrl.errors['email']) return 'E-mail invalido.';
    return '';
  }
}
