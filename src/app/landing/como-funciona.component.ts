import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../core/services/seo.service';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';
import { SparkFooterComponent } from '../shared/components/footer/footer.component';
import { NICHES, NicheInfo } from './niches.data';

@Component({
  selector: 'app-como-funciona',
  standalone: true,
  imports: [CommonModule, RouterModule, SparkTopbarComponent, SparkFooterComponent],
  template: `
    <app-spark-topbar></app-spark-topbar>

    <!-- PAGE HERO -->
    <section class="page-hero">
      <div class="container page-hero__inner">
        <h1 class="page-hero__title">Veja como o Spark<br>trabalha por você</h1>
        <p class="page-hero__subtitle">
          Da pesquisa de tendências à publicação — tudo automatizado.
          Entenda cada etapa do processo.
        </p>
      </div>
    </section>

    <!-- OS 4 PASSOS -->
    <section class="steps-section">
      <div class="container">
        <div class="steps-grid">
          <div class="step-card">
            <span class="step-card__num">01</span>
            <h3 class="step-card__title">Pesquisa de tendências</h3>
            <p class="step-card__desc">
              A IA usa o Google Search em tempo real para identificar as notícias, trends e
              discussões mais relevantes do seu nicho nas últimas 24–48h. Nenhum conteúdo
              genérico ou desatualizado — cada post parte de algo que está acontecendo agora.
            </p>
          </div>
          <div class="step-card">
            <span class="step-card__num">02</span>
            <h3 class="step-card__title">Geração de conteúdo</h3>
            <p class="step-card__desc">
              Com base nas tendências encontradas, a IA cria legendas com hooks de scroll-stop,
              estrutura de storytelling, hashtags segmentadas por nicho e CTA adequado ao seu
              objetivo — sem você escrever uma linha sequer.
            </p>
          </div>
          <div class="step-card">
            <span class="step-card__num">03</span>
            <h3 class="step-card__title">Criação visual</h3>
            <p class="step-card__desc">
              O Spark usa modelos de geração de imagem (Gemini/Imagen) para criar fotos e
              carrosseis de até 10 slides com design profissional, adaptados ao estilo visual
              da sua marca e ao formato do post (feed, story, carrossel).
            </p>
          </div>
          <div class="step-card">
            <span class="step-card__num">04</span>
            <h3 class="step-card__title">Publicação automática</h3>
            <p class="step-card__desc">
              No horário configurado, o Spark publica automaticamente no Instagram, Facebook
              e LinkedIn. Tokens de acesso são renovados em segundo plano — zero manutenção,
              zero interrupção, zero esforço da sua parte.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SOLUÇÕES POR NICHO -->
    <section class="niches-section">
      <div class="container">
        <span class="label">SOLUÇÕES POR NICHO</span>
        <h2 class="section-title">Feito para o seu mercado</h2>
        <div class="niches-grid">
          <button *ngFor="let n of niches" type="button"
                  class="niche-card"
                  [class.niche-card--active]="expandedNiche === n.value"
                  (click)="toggleNiche(n.value)">
            {{ n.label }}
          </button>
        </div>

        <div class="niche-detail" *ngIf="activeNiche">
          <div class="niche-detail__header">
            <div>
              <h3 class="niche-detail__title">{{ activeNiche.title }}</h3>
              <p class="niche-detail__subtitle">{{ activeNiche.subtitle }}</p>
            </div>
            <button type="button" class="niche-detail__close" (click)="expandedNiche = null" aria-label="Fechar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="niche-detail__stats">
            <div class="niche-detail__stat" *ngFor="let s of activeNiche.stats">
              <span class="niche-detail__stat-num">{{ s.num }}</span>
              <span class="niche-detail__stat-label">{{ s.label }}</span>
            </div>
          </div>
          <ul class="niche-detail__benefits">
            <li *ngFor="let b of activeNiche.benefits">{{ b }}</li>
          </ul>
          <a routerLink="/cadastro" [queryParams]="{ niche: activeNiche.value }" class="btn btn--spark btn--full">
            Começar teste grátis no nicho {{ activeNiche.label }} &rarr;
          </a>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="page-cta">
      <div class="container page-cta__inner">
        <h2 class="page-cta__title">Pronto para ver na prática?</h2>
        <p class="page-cta__desc">7 dias grátis. Sem cartão. Cancela quando quiser.</p>
        <a routerLink="/cadastro" class="btn btn--spark btn--lg">Começar agora &rarr;</a>
      </div>
    </section>

    <app-spark-footer></app-spark-footer>
  `,
  styles: [`
    :host { display: block; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .label {
      font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      color: #fbbf24; display: block; margin-bottom: 12px;
    }
    .section-title {
      font-size: clamp(28px, 4vw, 42px); font-weight: 800; color: #fff;
      line-height: 1.15; margin-bottom: 48px;
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
    .btn--full { width: 100%; box-sizing: border-box; }
    .btn--lg { padding: 18px 36px; font-size: 17px; }

    /* Page Hero */
    .page-hero {
      padding: 120px 0 80px;
      background: linear-gradient(180deg, #080c1a 0%, #050810 100%);
      text-align: center;
    }
    .page-hero__title {
      font-size: clamp(32px, 4.5vw, 56px); font-weight: 900; color: #fff;
      line-height: 1.1; margin-bottom: 20px;
    }
    .page-hero__subtitle {
      font-size: 18px; color: #9ca3af; line-height: 1.6;
      max-width: 560px; margin: 0 auto;
    }

    /* Steps */
    .steps-section { padding: 80px 0 100px; background: #050810; }
    .steps-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    @media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr; } }
    .step-card {
      padding: 36px 28px; border-radius: 16px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
      transition: border-color 0.2s, transform 0.25s ease, background 0.2s;
    }
    .step-card:hover {
      border-color: rgba(251,191,36,0.25);
      transform: translateY(-4px);
      background: rgba(255,255,255,0.05);
    }
    .step-card__num {
      font-size: 40px; font-weight: 900; display: block; margin-bottom: 16px;
      color: #fbbf24;
      text-shadow: 0 0 8px rgba(251,191,36,0.55), 0 0 20px rgba(251,191,36,0.35);
    }
    .step-card__title { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 12px; }
    .step-card__desc { font-size: 14px; color: #9ca3af; line-height: 1.7; }

    /* Niches */
    .niches-section { padding: 80px 0; background: #050810; }
    .niches-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
    .niche-card {
      padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600;
      color: #d1d5db; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      cursor: pointer; font-family: inherit; transition: all 0.18s;
    }
    .niche-card:hover { border-color: rgba(251,191,36,0.3); color: #fbbf24; }
    .niche-card--active {
      background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.4); color: #fbbf24;
    }
    .niche-detail {
      margin: 40px auto 0; max-width: 760px; padding: 32px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(251,191,36,0.2);
      border-radius: 20px;
      animation: niche-expand 0.25s ease-out;
    }
    @keyframes niche-expand {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .niche-detail__header {
      display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
      margin-bottom: 24px;
    }
    .niche-detail__title {
      font-size: clamp(20px, 2.5vw, 26px); font-weight: 800; color: #fff;
      line-height: 1.2; margin: 0 0 8px;
    }
    .niche-detail__subtitle { font-size: 15px; color: #9ca3af; line-height: 1.6; margin: 0; }
    .niche-detail__close {
      flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
      color: #9ca3af; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .niche-detail__close:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .niche-detail__close svg { width: 16px; height: 16px; }
    .niche-detail__stats {
      display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;
      padding: 20px; background: rgba(0,0,0,0.2); border-radius: 12px;
    }
    .niche-detail__stat { flex: 1; min-width: 140px; }
    .niche-detail__stat-num {
      display: block; font-size: 28px; font-weight: 900; color: #fbbf24; margin-bottom: 2px;
    }
    .niche-detail__stat-label { font-size: 12px; color: #6b7280; }
    .niche-detail__benefits {
      list-style: none; padding: 0; margin: 0 0 28px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .niche-detail__benefits li {
      font-size: 14px; color: #d1d5db; line-height: 1.6;
      padding-left: 22px; position: relative;
    }
    .niche-detail__benefits li::before {
      content: '\\2713'; position: absolute; left: 0; top: 0;
      color: #fbbf24; font-weight: 700;
    }

    /* Page CTA */
    .page-cta {
      padding: 100px 0;
      background: #050810;
    }
    .page-cta__inner { text-align: center; }
    .page-cta__title {
      font-size: clamp(28px, 4vw, 40px); font-weight: 800; color: #fff; margin-bottom: 16px;
    }
    .page-cta__desc { font-size: 18px; color: #9ca3af; margin-bottom: 32px; }
  `]
})
export class ComoFuncionaComponent implements OnInit {
  readonly niches = NICHES;
  expandedNiche: string | null = null;

  get activeNiche(): NicheInfo | null {
    return this.niches.find(n => n.value === this.expandedNiche) ?? null;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Como funciona o Spark — Automação de social media com IA',
      description: 'Entenda como o Spark pesquisa tendências, gera conteúdo e publica automaticamente. Veja por nicho.',
    });
  }

  toggleNiche(value: string): void {
    this.expandedNiche = this.expandedNiche === value ? null : value;
    if (this.expandedNiche && isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        document.querySelector('.niche-detail')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }
}
