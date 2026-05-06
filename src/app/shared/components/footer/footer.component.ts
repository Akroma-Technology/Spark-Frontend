import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-spark-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <div class="footer__logo">
            <img src="assets/icone-akroma.png" alt="" class="footer__logo-img" aria-hidden="true">
            <span class="footer__brand-name">Akroma <span class="footer__brand-accent">Spark</span></span>
          </div>
          <p class="footer__tagline">Social media no piloto automático com IA.</p>
          <p class="footer__cnpj">Operado por Akroma Engenharia de Software — CNPJ 65.872.717/0001-79</p>

          <div class="footer__trust">
            <div class="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>SSL Seguro</span>
            </div>
            <div class="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Cloudflare</span>
            </div>
            <div class="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>CNPJ Verificado</span>
            </div>
          </div>

          <a href="https://www.trustpilot.com/review/akroma.com.br"
             target="_blank" rel="noopener"
             class="tp-badge"
             aria-label="Avalie-nos no Trustpilot">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#00b67a" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
            <span>Trustpilot</span>
          </a>
        </div>

        <nav class="footer__nav">
          <div class="footer__col">
            <h4 class="footer__heading">Produto</h4>
            <a routerLink="/como-funciona" class="footer__link">Como funciona</a>
            <a routerLink="/recursos" class="footer__link">Recursos</a>
            <a routerLink="/planos" class="footer__link">Planos</a>
            <a routerLink="/cadastro" class="footer__link footer__link--highlight">Teste grátis 7 dias</a>
          </div>
          <div class="footer__col">
            <h4 class="footer__heading">Empresa</h4>
            <a href="https://akroma.com.br/sobre" class="footer__link">Sobre a Akroma</a>
            <a href="https://akroma.com.br/servicos" class="footer__link">Outros serviços</a>
            <a routerLink="/contato" class="footer__link">Fale Conosco</a>
          </div>
          <div class="footer__col">
            <h4 class="footer__heading">Contato</h4>
            <a href="mailto:contato@akroma.com.br" class="footer__link">contato&#64;akroma.com.br</a>
            <a href="https://akroma.com.br/politica-privacidade" class="footer__link">Privacidade</a>
            <a href="https://akroma.com.br/termos-de-uso" class="footer__link">Termos</a>
            <a href="https://akroma.com.br/politica-cookies" class="footer__link">Cookies</a>
          </div>
        </nav>
      </div>

      <div class="footer__bottom">
        <div class="footer__bottom-inner">
          <span class="footer__copy">© {{ year }} Akroma Spark. Todos os direitos reservados.</span>
          <div class="footer__social">
            <a href="https://www.linkedin.com/company/akroma-tecnologia" target="_blank" rel="noopener" class="footer__social-link" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z"/></svg>
            </a>
            <a href="https://www.instagram.com/akromainc/" target="_blank" rel="noopener" class="footer__social-link" aria-label="Instagram @akromainc">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }
    .footer {
      background: #07070d;
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: 80px;
      color: #d1d5db;
    }
    .footer__inner {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 2fr; gap: 64px;
      padding: 64px 24px;
    }
    @media (max-width: 768px) {
      .footer__inner { grid-template-columns: 1fr; gap: 40px; }
    }
    .footer__logo {
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
    }
    .footer__logo-img {
      height: 28px; width: auto;
      filter: brightness(0) saturate(100%) invert(76%) sepia(43%) saturate(1100%) hue-rotate(358deg) brightness(101%) contrast(99%);
    }
    .footer__brand-name { font-size: 16px; font-weight: 700; color: #fff; }
    .footer__brand-accent {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .footer__tagline { color: #9ca3af; font-size: 14px; margin: 0 0 8px; }
    .footer__cnpj { color: #6b7280; font-size: 12px; margin: 0; }
    .footer__trust {
      display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px;
    }
    .trust-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px;
      color: #9ca3af;
      font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
      transition: border-color 0.2s, color 0.2s;
    }
    .trust-badge svg { width: 12px; height: 12px; flex-shrink: 0; color: #fbbf24; }
    .trust-badge:hover { border-color: rgba(251,191,36,0.35); color: #fff; }
    .tp-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 12px; margin-top: 10px;
      border: 1px solid rgba(0,182,122,0.35); border-radius: 6px;
      color: #9ca3af; font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
      text-decoration: none;
      transition: border-color 0.2s, color 0.2s;
    }
    .tp-badge:hover { border-color: rgba(0,182,122,0.7); color: #fff; }

    .footer__nav {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
    }
    @media (max-width: 480px) { .footer__nav { grid-template-columns: 1fr; } }
    .footer__col { display: flex; flex-direction: column; gap: 8px; }
    .footer__heading {
      color: #fff; font-size: 11px;
      letter-spacing: 0.1em; text-transform: uppercase;
      margin: 0 0 8px;
    }
    .footer__link {
      color: #9ca3af; font-size: 14px;
      text-decoration: none; transition: color 0.15s;
    }
    .footer__link:hover { color: #fbbf24; }
    .footer__link--highlight { color: #fbbf24; font-weight: 600; }
    .footer__link--highlight:hover { color: #fcd34d; }

    .footer__bottom {
      border-top: 1px solid rgba(255,255,255,0.05);
      padding: 20px 0;
    }
    .footer__bottom-inner {
      max-width: 1200px; margin: 0 auto; padding: 0 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    @media (max-width: 480px) {
      .footer__bottom-inner { flex-direction: column; gap: 12px; text-align: center; }
    }
    .footer__copy { color: #6b7280; font-size: 12px; }
    .footer__social { display: inline-flex; gap: 8px; }
    .footer__social-link {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px;
      border: 1px solid rgba(255,255,255,0.08); border-radius: 6px;
      color: #9ca3af;
      text-decoration: none;
      transition: border-color 0.2s, color 0.2s;
    }
    .footer__social-link:hover { border-color: rgba(251,191,36,0.5); color: #fbbf24; }
  `]
})
export class SparkFooterComponent {
  year = new Date().getFullYear();
}
