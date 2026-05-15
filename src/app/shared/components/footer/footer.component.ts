import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-spark-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer class="ak-footer">
      <div class="ak-footer__inner">
        <div class="ak-footer__logo">
          <div class="ak-footer__dot"></div>
          <span class="ak-footer__brand">Akroma</span>
          <span class="ak-footer__badge">SPARK</span>
        </div>
        <div class="ak-footer__links">
          <a href="https://akroma.com.br">akroma.com.br</a>
          <a href="https://akroma.com.br/politica-privacidade">Privacidade</a>
          <a href="https://akroma.com.br/termos-de-uso">Termos</a>
          <a routerLink="/contato">Contato</a>
        </div>
        <span class="ak-footer__copy">© {{ year }} Akroma Technology. Todos os direitos reservados.</span>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      --ak-accent:  #fbbf24;
      --ak-accent-2:#f59e0b;
    }
    .ak-footer {
      background: #07070d;
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: 80px;
      padding: 2rem 0;
      color: #d1d5db;
    }
    .ak-footer__inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 2rem; flex-wrap: wrap;
    }
    .ak-footer__logo {
      display: flex; align-items: center; gap: 0.5rem;
    }
    .ak-footer__dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: linear-gradient(135deg, var(--ak-accent), var(--ak-accent-2));
      box-shadow: 0 0 12px color-mix(in srgb, var(--ak-accent) 60%, transparent);
    }
    .ak-footer__brand {
      font-weight: 800; font-size: 1rem; color: #fff;
    }
    .ak-footer__badge {
      font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em;
      padding: 2px 8px; border-radius: 4px;
      background: color-mix(in srgb, var(--ak-accent) 15%, transparent);
      border: 1px solid color-mix(in srgb, var(--ak-accent) 30%, transparent);
      color: var(--ak-accent);
    }
    .ak-footer__links {
      display: flex; gap: 2rem; flex-wrap: wrap;
    }
    .ak-footer__links a {
      font-size: 0.875rem; color: #7888aa;
      text-decoration: none;
      transition: color 0.15s;
    }
    .ak-footer__links a:hover { color: #fff; }
    .ak-footer__copy {
      font-size: 0.8125rem; color: #7888aa;
    }
    @media (max-width: 768px) {
      .ak-footer__inner {
        flex-direction: column; text-align: center; gap: 1.25rem;
      }
      .ak-footer__links { justify-content: center; }
    }
  `]
})
export class SparkFooterComponent {
  year = new Date().getFullYear();
}
