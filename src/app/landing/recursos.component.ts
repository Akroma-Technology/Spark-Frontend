import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SeoService } from '../core/services/seo.service';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';
import { SparkFooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [RouterModule, SparkTopbarComponent, SparkFooterComponent],
  template: `
    <app-spark-topbar></app-spark-topbar>

    <!-- PAGE HERO -->
    <section class="page-hero">
      <div class="container page-hero__inner">
        <h1 class="page-hero__title">Tudo que você precisa<br>para crescer no automático</h1>
        <p class="page-hero__subtitle">
          Cada funcionalidade do Spark foi pensada para eliminar o trabalho manual do social media.
        </p>
      </div>
    </section>

    <!-- FEATURES GRID -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <span class="feature-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </span>
            <h4 class="feature-item__title">Posts diários com IA</h4>
            <p class="feature-item__desc">Conteúdo original gerado por IA todos os dias, com tom personalizado para sua marca e baseado em tendências reais do seu nicho.</p>
          </div>
          <div class="feature-item">
            <span class="feature-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
            </span>
            <h4 class="feature-item__title">Analytics de engajamento</h4>
            <p class="feature-item__desc">Score 0–100 por post, tracking de hashtags, melhores horários por dia da semana e feedback loop automático para melhorar os próximos posts.</p>
          </div>
          <div class="feature-item">
            <span class="feature-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </span>
            <h4 class="feature-item__title">Imagens e carrosseis</h4>
            <p class="feature-item__desc">Criação visual com Gemini/Imagen — single posts e carrosseis de até 10 slides com design profissional, adaptados ao formato de cada rede.</p>
          </div>
          <div class="feature-item">
            <span class="feature-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
            </span>
            <h4 class="feature-item__title">Agendamento inteligente</h4>
            <p class="feature-item__desc">Configure slots por dia da semana com temas personalizados. O Spark publica no melhor horário para engajamento no seu nicho.</p>
          </div>
          <div class="feature-item">
            <span class="feature-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </span>
            <h4 class="feature-item__title">Templates de nicho</h4>
            <p class="feature-item__desc">Configurações pré-prontas para fitness, tech, gastronomia, jurídico, imobiliário e muito mais — adaptadas ao tom e linguagem de cada mercado.</p>
          </div>
          <div class="feature-item">
            <span class="feature-item__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.3"/></svg>
            </span>
            <h4 class="feature-item__title">Renovação automática</h4>
            <p class="feature-item__desc">Tokens do Instagram e Facebook renovados automaticamente em segundo plano. Nenhuma interrupção, nenhuma manutenção manual da sua parte.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="page-cta">
      <div class="container page-cta__inner">
        <h2 class="page-cta__title">Escolha o plano certo para você</h2>
        <p class="page-cta__desc">Todos os recursos disponíveis a partir do plano Starter.</p>
        <a routerLink="/planos" class="btn btn--spark btn--lg">Ver planos &rarr;</a>
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
    .btn--lg { padding: 18px 36px; font-size: 17px; }

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

    .features-section {
      padding: 80px 0 100px;
      background: #050810;
    }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    @media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .features-grid { grid-template-columns: 1fr; } }
    .feature-item {
      padding: 28px; border-radius: 16px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
      transition: transform 0.25s ease, border-color 0.2s, background 0.2s;
    }
    .feature-item:hover {
      transform: translateY(-4px);
      border-color: rgba(251,191,36,0.2);
      background: rgba(255,255,255,0.05);
    }
    .feature-item__icon {
      display: flex; align-items: center; justify-content: center;
      width: 48px; height: 48px; border-radius: 12px; margin-bottom: 16px;
      background: rgba(251,191,36,0.1); color: #fbbf24;
    }
    .feature-item__icon svg { width: 24px; height: 24px; }
    .feature-item__title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .feature-item__desc { font-size: 14px; color: #9ca3af; line-height: 1.65; }

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
export class RecursosComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Recursos do Spark — Tudo que você precisa para crescer',
      description: 'Posts diários com IA, analytics, carrosseis, agendamento e muito mais. Conheça todos os recursos.',
    });
  }
}
