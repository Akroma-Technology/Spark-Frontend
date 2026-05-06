import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SeoService } from '../core/services/seo.service';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';
import { SparkFooterComponent } from '../shared/components/footer/footer.component';
import { SPARK_PLANS, Plan, annualPerMonth } from './plans.data';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-planos',
  standalone: true,
  imports: [CommonModule, RouterModule, SparkTopbarComponent, SparkFooterComponent],
  template: `
    <app-spark-topbar></app-spark-topbar>

    <!-- PAGE HERO -->
    <section class="page-hero">
      <div class="container page-hero__inner">
        <h1 class="page-hero__title">Planos simples.<br>Resultado real.</h1>
        <p class="page-hero__subtitle">
          Comece grátis por 7 dias. Sem cartão de crédito. Cancele quando quiser.
        </p>
      </div>
    </section>

    <!-- PRICING -->
    <section class="pricing-section">
      <div class="container">
        <div class="billing-toggle">
          <span [class.active]="!annual">Mensal</span>
          <button class="billing-toggle__switch" [class.annual]="annual" (click)="annual = !annual" aria-label="Alternar cobrança anual">
            <span class="billing-toggle__knob"></span>
          </button>
          <span [class.active]="annual">Anual <span class="billing-toggle__save">2 meses grátis</span></span>
        </div>

        <div class="pricing-grid">
          <div class="pricing-card" *ngFor="let p of plans"
               [class.pricing-card--featured]="p.featured">
            <span class="pricing-card__badge" *ngIf="p.featured">POPULAR</span>
            <div class="pricing-card__head">
              <span class="pricing-card__name">{{ p.name }}</span>
              <div class="pricing-card__price">
                <span class="pricing-card__currency">R$</span>
                <span class="pricing-card__amount">{{ annual ? calcAnnual(p.monthly) : p.monthly }}</span>
                <span class="pricing-card__period">/mes</span>
              </div>
              <div class="pricing-card__annual-note" *ngIf="annual">
                R$ {{ p.monthly * 10 | number:'1.0-0' }}/ano (pague 10, leve 12)
              <!-- pt-BR locale está registrado globalmente em app.config.ts — sem precisar de argumento explícito -->
              </div>
              <div class="pricing-card__prefix" *ngIf="p.prefix">{{ p.prefix }}</div>
            </div>
            <ul class="pricing-card__features">
              <li *ngFor="let f of p.features">{{ f }}</li>
            </ul>
            <a [routerLink]="p.ctaRoute"
               [queryParams]="p.ctaRoute === '/cadastro' ? { plan: p.id, billing: annual ? 'annual' : 'monthly' } : null"
               class="btn btn--full pricing-card__cta"
               [class.btn--spark]="p.featured"
               [class.btn--outline]="!p.featured">
              {{ p.ctaLabel }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- REFERRAL -->
    <section class="referral-section">
      <div class="container">
        <div class="referral-card">
          <div class="referral-card__bg" aria-hidden="true"></div>
          <div class="referral-card__header">
            <span class="label">PROGRAMA DE INDICAÇÃO</span>
            <h2 class="referral-card__title">Indique 4 amigos,<br>ganhe 1 mês grátis</h2>
            <p class="referral-card__desc">
              A cada 4 amigos que assinarem o Spark usando seu código, você ganha 1 mês inteiro de crédito.
              Sem limite de indicações — 8 amigos, 2 meses; 12 amigos, 3 meses; e por aí vai.
            </p>
          </div>
          <div class="referral-card__steps">
            <div class="referral-card__step">
              <span class="referral-card__step-num">1</span>
              <div class="referral-card__step-content">
                <strong>Crie sua conta</strong>
                <span>Receba seu código de indicação único</span>
              </div>
            </div>
            <div class="referral-card__step-arrow" aria-hidden="true">→</div>
            <div class="referral-card__step">
              <span class="referral-card__step-num">2</span>
              <div class="referral-card__step-content">
                <strong>Compartilhe</strong>
                <span>Envie o link para amigos e colegas</span>
              </div>
            </div>
            <div class="referral-card__step-arrow" aria-hidden="true">→</div>
            <div class="referral-card__step">
              <span class="referral-card__step-num">3</span>
              <div class="referral-card__step-content">
                <strong>Ganhe meses grátis</strong>
                <span>A cada 4 indicados, +1 mês de crédito</span>
              </div>
            </div>
          </div>
          <a routerLink="/cadastro" class="btn btn--spark">Criar conta e indicar amigos &rarr;</a>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="page-cta">
      <div class="container page-cta__inner">
        <h2 class="page-cta__title">Comece hoje, veja resultado essa semana</h2>
        <p class="page-cta__desc">7 dias grátis. Sem cartão. Se não gostar, cancela com um clique.</p>
        <a routerLink="/cadastro" class="btn btn--spark btn--lg">Teste grátis 7 dias &rarr;</a>
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
    .btn--outline {
      background: transparent; color: #d1d5db;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .btn--outline:hover { border-color: rgba(255,255,255,0.3); color: #fff; }
    .btn--full { width: 100%; box-sizing: border-box; }
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

    /* Pricing */
    .pricing-section { padding: 60px 0 80px; background: #050810; }
    .billing-toggle {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      margin-bottom: 40px; font-size: 15px; color: #6b7280;
    }
    .billing-toggle span.active { color: #fff; font-weight: 600; }
    .billing-toggle__switch {
      width: 52px; height: 28px; border-radius: 14px; padding: 3px;
      background: rgba(255,255,255,0.1); border: none; cursor: pointer;
      position: relative; transition: background 0.2s;
    }
    .billing-toggle__switch.annual { background: rgba(251,191,36,0.3); }
    .billing-toggle__knob {
      display: block; width: 22px; height: 22px; border-radius: 50%;
      background: #fff; transition: transform 0.2s;
    }
    .billing-toggle__switch.annual .billing-toggle__knob { transform: translateX(24px); }
    .billing-toggle__save {
      font-size: 11px; background: rgba(251,191,36,0.15); color: #fbbf24;
      padding: 2px 8px; border-radius: 4px; font-weight: 700;
    }
    .pricing-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: stretch;
    }
    @media (max-width: 900px) { .pricing-grid { grid-template-columns: 1fr; } }
    .pricing-card {
      padding: 36px 28px; border-radius: 20px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
      position: relative; display: flex; flex-direction: column;
    }
    .pricing-card--featured {
      background: rgba(251,191,36,0.06);
      border-color: rgba(251,191,36,0.45);
      box-shadow: 0 12px 40px -12px rgba(251,191,36,0.25);
    }
    .pricing-card__badge {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #000; font-size: 11px; font-weight: 800; letter-spacing: 1px;
      padding: 4px 16px; border-radius: 20px;
    }
    .pricing-card__head { margin-bottom: 20px; }
    .pricing-card__name { font-size: 20px; font-weight: 700; color: #fff; display: block; margin-bottom: 16px; }
    .pricing-card__price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px; }
    .pricing-card__currency { font-size: 18px; color: #9ca3af; font-weight: 600; }
    .pricing-card__amount { font-size: 48px; font-weight: 900; color: #fff; }
    .pricing-card__period { font-size: 15px; color: #6b7280; }
    .pricing-card__annual-note { font-size: 12px; color: #22c55e; margin-bottom: 16px; }
    .pricing-card__prefix { font-size: 12px; color: #9ca3af; margin-top: 4px; }
    .pricing-card__features {
      list-style: none; padding: 0; margin: 0 0 28px;
      display: flex; flex-direction: column; gap: 12px; flex-grow: 1;
    }
    .pricing-card__features li {
      font-size: 14px; color: #d1d5db; padding-left: 20px; position: relative;
    }
    .pricing-card__features li::before {
      content: '\\2713'; position: absolute; left: 0; color: #fbbf24; font-weight: 700;
    }
    .pricing-card__cta { margin-top: auto; }

    /* Referral */
    .referral-section {
      padding: 80px 0;
      background: #050810;
    }
    .referral-card {
      position: relative; overflow: hidden;
      background: rgba(251,191,36,0.04);
      border: 1px solid rgba(251,191,36,0.25);
      border-radius: 24px; padding: 56px 48px; text-align: center;
    }
    @media (max-width: 768px) { .referral-card { padding: 40px 24px; } }
    .referral-card__bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.08) 0%, transparent 60%);
      pointer-events: none;
    }
    .referral-card__header { position: relative; margin-bottom: 40px; }
    .referral-card__title {
      font-size: clamp(28px, 4vw, 42px); font-weight: 800; color: #fff;
      line-height: 1.15; margin-bottom: 16px;
    }
    .referral-card__desc {
      font-size: 16px; color: #9ca3af; max-width: 540px; margin: 0 auto; line-height: 1.7;
    }
    .referral-card__steps {
      display: flex; align-items: flex-start; justify-content: center;
      gap: 16px; flex-wrap: wrap; margin-bottom: 40px; position: relative;
    }
    .referral-card__step {
      display: flex; align-items: flex-start; gap: 14px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px; padding: 20px 24px;
      text-align: left; flex: 1; min-width: 180px; max-width: 240px;
    }
    .referral-card__step-arrow { font-size: 20px; color: rgba(251,191,36,0.4); padding-top: 28px; flex-shrink: 0; }
    @media (max-width: 700px) {
      .referral-card__step-arrow { display: none; }
      .referral-card__step { max-width: 100%; min-width: unset; width: 100%; }
      .referral-card__steps { flex-direction: column; align-items: stretch; }
    }
    .referral-card__step-num {
      flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 800;
      background: rgba(251,191,36,0.15); color: #fbbf24;
      border: 1px solid rgba(251,191,36,0.3);
    }
    .referral-card__step-content { display: flex; flex-direction: column; gap: 4px; }
    .referral-card__step-content strong { font-size: 15px; font-weight: 700; color: #fff; display: block; }
    .referral-card__step-content span { font-size: 13px; color: #9ca3af; }

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
export class PlanosComponent implements OnInit {
  plans: Plan[] = [...SPARK_PLANS];
  annual = false;
  readonly calcAnnual = annualPerMonth;

  private readonly apiUrl = environment.apiUrl;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private http: HttpClient,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Planos Spark — Simples e transparentes',
      description: 'Starter, Pro e Enterprise. Comece grátis por 7 dias. Programa de indicação incluso.',
    });

    if (isPlatformBrowser(this.platformId)) {
      this.http.get<{ starter: { monthly: string }; pro: { monthly: string } }>(
        `${this.apiUrl}/api/v1/plans/spark`
      ).subscribe({
        next: (prices) => {
          const starterIdx = this.plans.findIndex(p => p.id === 'starter');
          const proIdx = this.plans.findIndex(p => p.id === 'pro');
          if (starterIdx >= 0) this.plans[starterIdx] = { ...this.plans[starterIdx], monthly: +prices.starter.monthly };
          if (proIdx >= 0) this.plans[proIdx] = { ...this.plans[proIdx], monthly: +prices.pro.monthly };
        },
        error: () => {} // mantém defaults em caso de erro
      });
    }
  }
}
