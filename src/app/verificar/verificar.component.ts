import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClientAuthService } from '../core/services/client-auth.service';

@Component({
  selector: 'app-verificar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="verify-page">
      <div *ngIf="state === 'loading'" class="verify-state">
        <div class="verify-spinner"></div>
        <p class="verify-msg">Verificando seu e-mail...</p>
      </div>
      <div *ngIf="state === 'success'" class="verify-state verify-state--success">
        <div class="verify-checkmark">✓</div>
        <h2 class="verify-heading">E-mail confirmado!</h2>
        <p class="verify-msg">Sua conta está ativa. Bem-vindo ao Spark.</p>
        <a routerLink="/app" class="btn btn--spark">Ir para o Spark →</a>
      </div>
      <div *ngIf="state === 'error'" class="verify-state verify-state--error">
        <div class="verify-x">✕</div>
        <h2 class="verify-heading">Link inválido ou expirado</h2>
        <p class="verify-msg">O link de verificação não é válido ou já foi utilizado.</p>
        <a routerLink="/cadastro" class="btn btn--outline">Voltar ao cadastro</a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #050912; min-height: 100vh; }
    .verify-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .verify-state {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 48px 40px;
      max-width: 420px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .verify-spinner {
      width: 48px;
      height: 48px;
      border: 3px solid rgba(251,191,36,0.2);
      border-top-color: #fbbf24;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .verify-checkmark {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(34,197,94,0.15);
      border: 2px solid rgba(34,197,94,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #4ade80;
      font-weight: 700;
    }
    .verify-x {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(239,68,68,0.12);
      border: 2px solid rgba(239,68,68,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #f87171;
      font-weight: 700;
    }
    .verify-heading {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      margin: 0;
    }
    .verify-msg {
      font-size: 15px;
      color: #9ca3af;
      line-height: 1.6;
      margin: 0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 14px 28px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 15px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      margin-top: 8px;
    }
    .btn--spark {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #000;
      border: 1px solid rgba(251,191,36,0.4);
      box-shadow: 0 4px 16px -4px rgba(245,158,11,0.3);
    }
    .btn--spark:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
    .btn--outline {
      background: transparent;
      color: #fbbf24;
      border: 1px solid rgba(251,191,36,0.4);
    }
    .btn--outline:hover {
      background: rgba(251,191,36,0.08);
    }
  `]
})
export class VerificarComponent implements OnInit {
  state: 'loading' | 'success' | 'error' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private auth: ClientAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Magic link JWT is delivered via URL fragment (#jwt=...) to prevent
    // it from appearing in server logs, Cloudflare logs, or browser history.
    // Fragments are never sent to servers — client-side only.
    const fragment = this.route.snapshot.fragment ?? '';
    const fragmentParams = new URLSearchParams(fragment);
    const jwt =
      fragmentParams.get('jwt') ||          // new: #jwt=... (never logged)
      this.route.snapshot.queryParamMap.get('jwt'); // legacy: ?jwt=... fallback
    const token = this.route.snapshot.queryParamMap.get('token');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (jwt) {
      // Magic link flow: backend redirected here with JWT already minted
      this.auth.saveSessionFromJwt(jwt);
      this.state = 'success';
    } else if (token) {
      // Should not happen on frontend — token goes to backend first.
      // Redirect to backend to trigger magic link verification.
      this.state = 'loading';
      // The backend /client-auth/verify-magic-link redirects back here with ?jwt=...
      // If somehow the raw token ended up here, just mark error.
      this.state = 'error';
    } else if (error) {
      this.state = 'error';
    } else {
      this.state = 'error';
    }
  }
}
