import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientAuthService } from '../core/services/client-auth.service';
import { SeoService } from '../core/services/seo.service';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SparkTopbarComponent],
  template: `
    <app-spark-topbar></app-spark-topbar>

    <section class="signup-section">
      <div class="signup-container">
        <div class="signup-header">
          <span class="signup-badge">TRIAL STARTER — 7 DIAS GRATIS</span>
          <h1 class="signup-title">Crie sua conta e ative o Spark</h1>
          <p class="signup-subtitle">
            Sem cartao de credito. Cancele quando quiser. Primeiro post publicado em minutos.
          </p>
        </div>

        <!-- VERIFICATION STEP (shown after signup) -->
        <div *ngIf="pendingEmail" class="verify-step">
          <div class="verify-icon">✉️</div>
          <h2 class="verify-title">Confirme seu e-mail</h2>
          <p class="verify-desc">
            Enviamos um código de 6 dígitos para <strong>{{ pendingEmail }}</strong>.<br>
            Verifique também a caixa de spam.
          </p>
          <form [formGroup]="codeForm" (ngSubmit)="submitCode()" class="verify-form">
            <input
              formControlName="code"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="000000"
              class="signup-field input code-input"
              autocomplete="one-time-code"
            />
            <div class="signup-error signup-error--banner" *ngIf="codeError">{{ codeError }}</div>
            <button type="submit" class="btn btn--spark btn--full" [disabled]="codeLoading">
              {{ codeLoading ? 'Verificando...' : 'Confirmar →' }}
            </button>
          </form>
          <button
            type="button"
            class="resend-btn"
            (click)="resendCode()"
            [disabled]="resendCooldown > 0"
          >
            {{ resendCooldown > 0 ? 'Reenviar em ' + resendCooldown + 's' : 'Reenviar código' }}
          </button>
        </div>

        <!-- SIGNUP FORM (shown before verification) -->
        <form *ngIf="!pendingEmail" [formGroup]="form" (ngSubmit)="submit()" class="signup-form">
          <div class="signup-field">
            <label for="name">Seu nome</label>
            <input id="name" type="text" formControlName="name" autocomplete="name" placeholder="Como quer ser chamado" />
            <span class="signup-error" *ngIf="hasError('name')">{{ getError('name') }}</span>
          </div>

          <div class="signup-field">
            <label for="email">E-mail profissional</label>
            <input id="email" type="email" formControlName="email" autocomplete="email" placeholder="voce@empresa.com" />
            <span class="signup-error" *ngIf="hasError('email')">{{ getError('email') }}</span>
          </div>

          <div class="signup-field">
            <label for="password">Senha</label>
            <input id="password" type="password" formControlName="password" autocomplete="new-password" placeholder="Minimo 6 caracteres" />
            <span class="signup-error" *ngIf="hasError('password')">{{ getError('password') }}</span>
          </div>

          <div class="signup-field">
            <label for="whatsapp">WhatsApp <span class="signup-field__opt">(opcional)</span></label>
            <input id="whatsapp" type="tel" formControlName="whatsapp" autocomplete="tel" placeholder="(11) 9 9999-9999" (input)="maskWhatsapp($event)" maxlength="16" />
          </div>

          <div class="signup-field">
            <label for="referralCode">Codigo de indicacao <span class="signup-field__opt">(opcional)</span></label>
            <input id="referralCode" type="text" formControlName="referralCode" autocapitalize="characters" placeholder="Se um amigo te indicou" />
          </div>

          <div class="signup-error signup-error--banner" *ngIf="error">{{ error }}</div>

          <button type="submit" class="btn btn--spark" [disabled]="loading">
            <span *ngIf="!loading">Comecar teste gratis &rarr;</span>
            <span *ngIf="loading">Criando conta...</span>
          </button>

          <p class="signup-tos">
            Ao continuar, voce aceita os
            <a href="https://akroma.com.br/termos-de-uso" target="_blank" rel="noopener">Termos de Uso</a> e a
            <a href="https://akroma.com.br/politica-privacidade" target="_blank" rel="noopener">Politica de Privacidade</a>.
          </p>

          <div class="signup-alt">
            Ja tem conta? <a routerLink="/entrar">Entrar</a>
          </div>
        </form>

        <div class="signup-perks" *ngIf="!pendingEmail">
          <div class="signup-perk">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <strong>7 dias gratis no plano Starter</strong>
              <span>Acesso completo a recursos premium. Sem cobrancas automaticas.</span>
            </div>
          </div>
          <div class="signup-perk">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <strong>Primeiro post em minutos</strong>
              <span>Conecte seu Instagram e a IA comeca a trabalhar imediatamente.</span>
            </div>
          </div>
          <div class="signup-perk">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <strong>Ganhe meses gratis indicando</strong>
              <span>Seu codigo de indicacao e criado automaticamente na conta.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; background: #050912; min-height: 100vh; }
    .signup-section { padding: 88px 16px 40px; display: flex; justify-content: center; }
    .signup-container {
      max-width: 960px; width: 100%; display: grid;
      grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: start;
    }
    @media (max-width: 860px) { .signup-container { grid-template-columns: 1fr; } }

    .signup-header { grid-column: 1 / -1; text-align: center; margin-bottom: 16px; }
    .signup-badge {
      display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 2px;
      color: #fbbf24; padding: 4px 12px; border-radius: 20px;
      background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.25);
      margin-bottom: 16px;
    }
    .signup-title {
      font-size: clamp(24px, 3.5vw, 34px); font-weight: 800; color: #fff;
      margin: 0 0 12px; line-height: 1.2;
    }
    .signup-subtitle { font-size: 15px; color: #9ca3af; line-height: 1.6; max-width: 540px; margin: 0 auto; }

    .signup-form {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px; padding: 32px;
      display: flex; flex-direction: column; gap: 16px;
    }
    .signup-field { display: flex; flex-direction: column; gap: 6px; }
    .signup-field label { font-size: 13px; font-weight: 600; color: #d1d5db; }
    .signup-field__opt { color: #6b7280; font-weight: 400; margin-left: 4px; }
    .signup-field input, .signup-field.input {
      padding: 12px 14px; border-radius: 10px; font-size: 15px;
      background: rgba(255,255,255,0.05); color: #fff;
      border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 0.15s, background 0.15s;
    }
    .signup-field input:focus, .signup-field.input:focus {
      outline: none; border-color: rgba(251,191,36,0.5); background: rgba(255,255,255,0.07);
    }
    .signup-error { font-size: 12px; color: #f87171; }
    .signup-error--banner {
      padding: 10px 14px; border-radius: 10px;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
      margin-top: 4px;
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
    .btn--full { width: 100%; }

    .signup-tos { font-size: 12px; color: #6b7280; text-align: center; margin: 0; line-height: 1.6; }
    .signup-tos a { color: #fbbf24; text-decoration: none; }
    .signup-tos a:hover { text-decoration: underline; }

    .signup-alt { font-size: 13px; color: #9ca3af; text-align: center; margin-top: 8px; }
    .signup-alt a { color: #fbbf24; text-decoration: none; font-weight: 600; }
    .signup-alt a:hover { text-decoration: underline; }

    .signup-perks { display: flex; flex-direction: column; gap: 20px; padding-top: 24px; }
    .signup-perk {
      display: flex; gap: 14px; align-items: flex-start;
    }
    .signup-perk svg { width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px; }
    .signup-perk strong { display: block; font-size: 14px; color: #fff; font-weight: 700; margin-bottom: 4px; }
    .signup-perk span { font-size: 13px; color: #9ca3af; line-height: 1.5; }

    /* Verification step */
    .verify-step {
      grid-column: 1 / -1;
      max-width: 440px;
      margin: 0 auto;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 40px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
    }
    .verify-icon { font-size: 48px; line-height: 1; }
    .verify-title { font-size: 22px; font-weight: 800; color: #fff; margin: 0; }
    .verify-desc { font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0; }
    .verify-desc strong { color: #e5e7eb; }
    .verify-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
    }
    .code-input {
      width: 100%;
      box-sizing: border-box;
      padding: 16px 14px;
      border-radius: 10px;
      font-size: 28px;
      font-weight: 800;
      font-family: monospace;
      letter-spacing: 10px;
      text-align: center;
      background: rgba(255,255,255,0.05);
      color: #fbbf24;
      border: 1px solid rgba(251,191,36,0.3);
      transition: border-color 0.15s, background 0.15s;
    }
    .code-input:focus {
      outline: none;
      border-color: rgba(251,191,36,0.6);
      background: rgba(255,255,255,0.07);
    }
    .resend-btn {
      background: none;
      border: none;
      color: #fbbf24;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 8px;
      text-decoration: underline;
      transition: opacity 0.15s;
    }
    .resend-btn:disabled {
      color: #6b7280;
      text-decoration: none;
      cursor: default;
    }
    .resend-btn:hover:not(:disabled) { opacity: 0.8; }
  `]
})
export class CadastroComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private auth = inject(ClientAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);

  form!: FormGroup;
  codeForm!: FormGroup;

  error = '';
  loading = false;

  pendingEmail = '';
  codeError = '';
  codeLoading = false;
  resendCooldown = 0;

  private cooldownInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Cadastro — Akroma Spark',
      description: 'Crie sua conta e comece o teste gratis de 7 dias do Akroma Spark.',
      noindex: true
    });

    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/app']);
      return;
    }

    const ref = this.route.snapshot.queryParamMap.get('ref') ?? '';
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      whatsapp: [''],
      referralCode: [ref]
    });

    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';

    this.auth.signup(this.form.value).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.pendingEmail = res.email;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.error = 'Este e-mail ja esta cadastrado. Que tal fazer login?';
        } else if (err.status === 0) {
          this.error = 'Sem conexao com o servidor. Verifique sua internet.';
        } else if (err.error?.error) {
          this.error = err.error.error;
        } else {
          this.error = `Erro ao criar conta (${err.status}). Tente novamente em instantes.`;
        }
        this.loading = false;
      }
    });
  }

  submitCode(): void {
    if (this.codeForm.invalid) { this.codeForm.markAllAsTouched(); return; }
    this.codeLoading = true;
    this.codeError = '';
    const { code } = this.codeForm.value;
    this.auth.verifyCode(this.pendingEmail, code).subscribe({
      next: (res: any) => {
        this.auth.saveSession(res);
        this.router.navigate(['/app'], { queryParams: { welcome: '1' } });
      },
      error: (err: HttpErrorResponse) => {
        this.codeLoading = false;
        this.codeError = err.error?.detail || 'Código inválido. Tente novamente.';
      }
    });
  }

  resendCode(): void {
    if (this.resendCooldown > 0) return;
    this.auth.resendCode(this.pendingEmail).subscribe({
      next: () => {
        this.resendCooldown = 60;
        this.cooldownInterval = setInterval(() => {
          this.resendCooldown--;
          if (this.resendCooldown <= 0) {
            clearInterval(this.cooldownInterval!);
            this.cooldownInterval = null;
          }
        }, 1000);
      },
      error: () => {
        // Silent fail — don't expose info
      }
    });
  }

  maskWhatsapp(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    let masked = '';
    if (v.length > 0)  masked  = '(' + v.slice(0, 2);
    if (v.length >= 3)  masked += ') ' + v.slice(2, 3);
    if (v.length >= 4)  masked += ' ' + v.slice(3, 7);
    if (v.length >= 8)  masked += '-' + v.slice(7, 11);
    input.value = masked;
    this.form.get('whatsapp')?.setValue(masked, { emitEvent: false });
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
    if (ctrl.errors['minlength']) return `Minimo de ${ctrl.errors['minlength'].requiredLength} caracteres.`;
    return '';
  }
}
