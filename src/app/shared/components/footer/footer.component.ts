import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-spark-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer class="ak-footer">
      <div class="ak-footer__inner">

        <div class="ak-footer__brand">
          <div class="ak-footer__logo">
            <img src="assets/icone-akroma.png" alt="" class="ak-footer__logo-icon" aria-hidden="true">
            <span class="ak-footer__brand-name">
              Akroma <span class="ak-footer__brand-accent">Spark</span>
            </span>
          </div>
          <p class="ak-footer__tagline">Social media no piloto automático com IA.</p>
          <p class="ak-footer__cnpj">Operado por Akroma Engenharia de Software — CNPJ 65.872.717/0001-79</p>

          <div class="ak-footer__trust">
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
        </div>

        <nav class="ak-footer__nav">
          <div class="ak-footer__col">
            <h4 class="ak-footer__heading">Produto</h4>
            <a routerLink="/como-funciona" class="ak-footer__link">Como funciona</a>
            <a routerLink="/recursos" class="ak-footer__link">Recursos</a>
            <a routerLink="/planos" class="ak-footer__link">Planos</a>
            <a routerLink="/cadastro" class="ak-footer__link">Teste grátis 7 dias</a>
          </div>
          <div class="ak-footer__col">
            <h4 class="ak-footer__heading">Empresa</h4>
            <a href="https://akroma.com.br/sobre" class="ak-footer__link">Sobre a Akroma</a>
            <a href="https://akroma.com.br/servicos" class="ak-footer__link">Outros serviços</a>
            <a routerLink="/contato" class="ak-footer__link">Fale Conosco</a>
          </div>
          <div class="ak-footer__col">
            <h4 class="ak-footer__heading">Legal</h4>
            <a href="https://akroma.com.br/politica-privacidade" target="_blank" rel="noopener" class="ak-footer__link">Privacidade</a>
            <a href="https://akroma.com.br/termos-de-uso" target="_blank" rel="noopener" class="ak-footer__link">Termos de Uso</a>
            <a href="https://akroma.com.br/politica-cookies" target="_blank" rel="noopener" class="ak-footer__link">Cookies</a>
          </div>
        </nav>

      </div>

      <div class="ak-footer__bottom">
        <div class="ak-footer__bottom-inner">
          <span class="ak-footer__copy">© {{ year }} Akroma Spark. Todos os direitos reservados.</span>
          <div class="ak-footer__social">
            <a href="https://www.linkedin.com/company/akroma-tecnologia" target="_blank" rel="noopener" class="ak-footer__social-link" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z"/></svg>
            </a>
            <a href="https://www.instagram.com/akromainc/" target="_blank" rel="noopener" class="ak-footer__social-link" aria-label="Instagram @akromainc">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --ak-accent:      #fbbf24;
      --ak-accent-2:    #f59e0b;
      --ak-accent-deep: #d97706;
      /* Logo recolor filter (amber) */
      --ak-logo-filter: brightness(0) saturate(100%) invert(76%) sepia(43%) saturate(1100%) hue-rotate(358deg) brightness(101%) contrast(99%);
    }
    .ak-footer {
      position: relative;
      background: #07070d;
      border-top: 1px solid rgba(255,255,255,0.05);
      color: #d1d5db;
    }
    .ak-footer::before {
      content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
      background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--ak-accent) 35%, transparent), transparent);
      pointer-events: none;
    }
    .ak-footer::after {
      content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
      width: 500px; height: 250px; border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--ak-accent-deep) 8%, transparent), transparent 70%);
      pointer-events: none;
    }
    .ak-footer__inner {
      max-width: 1200px; margin: 0 auto; padding: 72px 24px 48px;
      display: grid; grid-template-columns: 1.4fr 2fr; gap: 64px;
    }
    .ak-footer__brand { display: flex; flex-direction: column; }
    .ak-footer__logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .ak-footer__logo-icon { height: 30px; width: auto; flex-shrink: 0; filter: var(--ak-logo-filter); }
    .ak-footer__brand-name { font-size: 17px; font-weight: 700; color: #fff; }
    .ak-footer__brand-accent {
      background: linear-gradient(135deg, var(--ak-accent), var(--ak-accent-2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .ak-footer__tagline { font-size: 14px; color: #6b7280; margin: 0 0 8px; line-height: 1.5; }
    .ak-footer__cnpj   { font-size: 11px; color: #374151; margin: 0 0 24px; line-height: 1.5; }

    .ak-footer__trust { display: flex; flex-wrap: wrap; gap: 8px; }
    .trust-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 20px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
      font-size: 11px; color: #6b7280;
    }
    .trust-badge svg { width: 12px; height: 12px; color: var(--ak-accent); flex-shrink: 0; }

    .ak-footer__nav { display: flex; gap: 48px; padding-top: 4px; }
    .ak-footer__col { display: flex; flex-direction: column; gap: 10px; flex: 1; }
    .ak-footer__heading {
      font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      color: var(--ak-accent); margin: 0 0 8px;
    }
    .ak-footer__link {
      font-size: 14px; color: #6b7280; text-decoration: none; transition: color 0.15s;
    }
    .ak-footer__link:hover { color: #e5e7eb; }

    .ak-footer__bottom { border-top: 1px solid rgba(255,255,255,0.04); }
    .ak-footer__bottom-inner {
      max-width: 1200px; margin: 0 auto; padding: 20px 24px;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 12px;
    }
    .ak-footer__copy { font-size: 13px; color: #374151; }
    .ak-footer__social { display: flex; gap: 12px; }
    .ak-footer__social-link {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 8px;
      color: #4b5563; background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      text-decoration: none; transition: color 0.15s, border-color 0.15s, background 0.15s;
    }
    .ak-footer__social-link:hover {
      color: var(--ak-accent);
      border-color: color-mix(in srgb, var(--ak-accent) 25%, transparent);
      background: color-mix(in srgb, var(--ak-accent) 6%, transparent);
    }

    @media (max-width: 820px) {
      .ak-footer__inner { grid-template-columns: 1fr; gap: 40px; }
      .ak-footer__nav { flex-wrap: wrap; }
    }
    @media (max-width: 500px) {
      .ak-footer__nav { flex-direction: column; gap: 28px; }
      .ak-footer__bottom-inner { flex-direction: column; text-align: center; }
    }
  `]
})
export class SparkFooterComponent {
  year = new Date().getFullYear();
}
