import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';
import { SparkFooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, SparkTopbarComponent, SparkFooterComponent],
  template: `
    <app-spark-topbar></app-spark-topbar>

    <main class="not-found">
      <div class="container">
        <p class="not-found__code">404</p>
        <h1 class="not-found__title">Página não encontrada</h1>
        <p class="not-found__subtitle">
          O endereço que você buscou não existe ou foi movido. Que tal continuar navegando por aqui?
        </p>

        <div class="not-found__actions">
          <a routerLink="/" class="btn btn--spark">Voltar para a home &rarr;</a>
          <a routerLink="/cadastro" class="btn btn--outline">Começar teste grátis</a>
        </div>

        <div class="not-found__links">
          <h2>Links úteis</h2>
          <ul>
            <li><a href="/#como-funciona">Como funciona</a></li>
            <li><a href="/#solucoes">Soluções por nicho</a></li>
            <li><a href="/#demo">Demonstração</a></li>
            <li><a href="/#planos">Planos</a></li>
            <li><a routerLink="/contato">Fale conosco</a></li>
          </ul>
        </div>
      </div>
    </main>

    <app-spark-footer></app-spark-footer>
  `,
  styles: [`
    :host { display: block; background: #0a0a12; color: #e5e7eb; min-height: 100vh; }
    .container { max-width: 760px; margin: 0 auto; padding: 0 24px; text-align: center; }

    .not-found {
      padding: 160px 0 100px;
      background:
        radial-gradient(ellipse at top, rgba(251,191,36,0.1), transparent 55%),
        #0a0a12;
    }
    .not-found__code {
      margin: 0; font-size: 128px; font-weight: 900; line-height: 1;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      letter-spacing: -0.04em;
      text-shadow:
        0 0 40px rgba(251,191,36,0.2);
    }
    .not-found__title {
      margin: 8px 0 16px; font-size: 36px; font-weight: 800; color: #fff; letter-spacing: -0.02em;
    }
    .not-found__subtitle {
      color: #9ca3af; font-size: 17px; line-height: 1.6; max-width: 540px; margin: 0 auto 36px;
    }

    .not-found__actions {
      display: inline-flex; gap: 12px; flex-wrap: wrap; justify-content: center;
    }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px;
      text-decoration: none; transition: all 0.2s; border: none; cursor: pointer;
    }
    .btn--spark {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #000; border: 1px solid rgba(251,191,36,0.4);
      box-shadow: 0 4px 16px -4px rgba(245,158,11,0.3);
    }
    .btn--spark:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .btn--outline {
      background: transparent; color: #d1d5db;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .btn--outline:hover { border-color: rgba(251,191,36,0.4); color: #fff; }

    .not-found__links {
      margin-top: 72px; padding-top: 40px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .not-found__links h2 {
      margin: 0 0 16px; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; color: #fbbf24; font-weight: 700;
    }
    .not-found__links ul {
      list-style: none; padding: 0; margin: 0;
      display: flex; flex-wrap: wrap; gap: 8px 24px; justify-content: center;
    }
    .not-found__links a {
      color: #d1d5db; font-size: 15px; text-decoration: none;
      border-bottom: 1px solid rgba(251,191,36,0);
      transition: color 0.15s, border-color 0.15s;
    }
    .not-found__links a:hover { color: #fbbf24; border-bottom-color: rgba(251,191,36,0.5); }

    @media (max-width: 560px) {
      .not-found { padding: 120px 0 80px; }
      .not-found__code { font-size: 96px; }
      .not-found__title { font-size: 28px; }
    }
  `]
})
export class NotFoundComponent {}
