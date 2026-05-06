import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ClientAuthService, ClientInfo } from '../core/services/client-auth.service';
import { SeoService } from '../core/services/seo.service';
import { environment } from '../../environments/environment';

interface ReferralStats {
  referralCode: string;
  totalPaidReferrals: number;
  creditMonths: number;
  referralsToNextMonth: number;
}

interface ClientProfile {
  selectedNiche?: string;
  instagramConnected?: boolean;
  instagramUsername?: string;
  instagramTokenExpiresAt?: string;
}

const NICHE_OPTIONS: { value: string; label: string; emoji: string }[] = [
  { value: 'fitness',     label: 'Fitness / Academia',    emoji: '💪' },
  { value: 'tecnologia',  label: 'Tecnologia',            emoji: '💻' },
  { value: 'gastronomia', label: 'Gastronomia',           emoji: '🍽️' },
  { value: 'moda',        label: 'Moda',                  emoji: '👗' },
  { value: 'juridico',    label: 'Juridico',              emoji: '⚖️' },
  { value: 'imobiliario', label: 'Imobiliario',           emoji: '🏠' },
  { value: 'educacao',    label: 'Educacao',              emoji: '📚' },
  { value: 'saude',       label: 'Saude',                 emoji: '🏥' },
];

interface BillingStatus {
  planTier: string;
  planValue: number;
  billingCycle: string;
  active: boolean;
  canceled: boolean;
  trialActive: boolean;
  trialEndsAt?: string;
  canceledAt?: string;
  periodEnd?: string;
}

interface PlanPrices {
  starter: { monthly: string; annual: string; annualMonthly: string };
  pro:     { monthly: string; annual: string; annualMonthly: string };
}

type Tab = 'overview' | 'posts' | 'referrals' | 'plan';

@Component({
  selector: 'app-client-app',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="app-shell" *ngIf="client">
      <aside class="app-sidebar">
        <a routerLink="/" class="app-logo">
          <img src="assets/icone-akroma.png" alt="" class="app-logo__icon" aria-hidden="true">
          <span class="app-logo__name">Akroma <span class="app-logo__accent">Spark</span></span>
        </a>

        <nav class="app-nav">
          <button type="button" class="app-nav__item" [class.app-nav__item--active]="tab === 'overview'" (click)="tab = 'overview'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Inicio</span>
          </button>
          <button type="button" class="app-nav__item" [class.app-nav__item--active]="tab === 'posts'" (click)="tab = 'posts'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <span>Posts</span>
          </button>
          <button type="button" class="app-nav__item" [class.app-nav__item--active]="tab === 'referrals'" (click)="tab = 'referrals'; loadReferralStats()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Indicacoes</span>
          </button>
          <button type="button" class="app-nav__item" [class.app-nav__item--active]="tab === 'plan'" (click)="tab = 'plan'; loadPlanData()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span>Plano</span>
          </button>
        </nav>

        <div class="app-sidebar__footer">
          <button type="button" class="app-logout" (click)="logout()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair
          </button>
        </div>
      </aside>

      <main class="app-main">
        <!-- Welcome banner (first time) -->
        <div class="app-welcome" *ngIf="showWelcome">
          <div class="app-welcome__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <strong>Bem-vindo ao Akroma Spark, {{ client.name.split(' ')[0] }}!</strong>
            <span>Seu trial Starter de 7 dias esta ativo. Conecte seu Instagram para comecar.</span>
          </div>
          <button type="button" class="app-welcome__close" (click)="showWelcome = false" aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- OVERVIEW -->
        <div *ngIf="tab === 'overview'">
          <header class="app-page-header">
            <h1>Ola, {{ client.name.split(' ')[0] }}</h1>
            <p>Este e o seu painel do Akroma Spark.</p>
          </header>

          <div class="app-stats">
            <div class="app-stat" *ngIf="trialDaysLeft !== null">
              <span class="app-stat__label">Trial</span>
              <span class="app-stat__value">{{ trialDaysLeft }} {{ trialDaysLeft === 1 ? 'dia' : 'dias' }}</span>
              <span class="app-stat__hint">Restantes</span>
            </div>
            <div class="app-stat">
              <span class="app-stat__label">Plano atual</span>
              <span class="app-stat__value">{{ client.planTier }}</span>
              <span class="app-stat__hint">{{ trialActive ? 'Em teste gratis' : 'Ativo' }}</span>
            </div>
            <div class="app-stat">
              <span class="app-stat__label">Indicados</span>
              <span class="app-stat__value">{{ referralStats?.totalPaidReferrals ?? '—' }}</span>
              <span class="app-stat__hint">{{ (referralStats?.creditMonths ?? 0) > 0 ? (referralStats!.creditMonths + ' mes gratis') : 'Amigos que pagaram' }}</span>
            </div>
          </div>

          <div class="app-actions">
            <!-- Instagram card -->
            <div class="app-action" [class.app-action--primary]="!profile?.instagramConnected"
                 [class.app-action--connected]="profile?.instagramConnected">
              <div class="app-action__status" *ngIf="profile?.instagramConnected">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Conectado
              </div>
              <h3>{{ profile?.instagramConnected ? 'Instagram conectado' : 'Conecte seu Instagram' }}</h3>
              <p *ngIf="!profile?.instagramConnected">
                Para a IA publicar, precisamos da autorizacao do Instagram. Isso leva 1 minuto.
              </p>
              <p *ngIf="profile?.instagramConnected">
                Conta <strong>&#64;{{ profile?.instagramUsername }}</strong> autorizada. A IA pode publicar automaticamente.
              </p>
              <button *ngIf="!profile?.instagramConnected" type="button"
                      class="btn btn--spark" [disabled]="igConnecting" (click)="connectInstagram()">
                {{ igConnecting ? 'Redirecionando...' : 'Conectar Instagram →' }}
              </button>
              <button *ngIf="profile?.instagramConnected" type="button"
                      class="btn btn--outline" [disabled]="igConnecting" (click)="connectInstagram()">
                {{ igConnecting ? 'Redirecionando...' : 'Reconectar' }}
              </button>
              <p class="app-action__error" *ngIf="igConnectError">{{ igConnectError }}</p>
            </div>

            <!-- Niche card -->
            <div class="app-action">
              <h3>Configure seu nicho</h3>
              <p>
                A IA adapta os posts ao seu mercado.
                <span *ngIf="profile?.selectedNiche">
                  Nicho atual: <strong>{{ nicheLabel(profile?.selectedNiche) }}</strong>
                </span>
                <span *ngIf="!profile?.selectedNiche">Escolha seu nicho para melhores resultados.</span>
              </p>

              <!-- Niche picker collapsed view -->
              <button *ngIf="!showNichePicker" type="button" class="btn btn--outline" (click)="showNichePicker = true">
                {{ profile?.selectedNiche ? 'Mudar nicho' : 'Escolher nicho' }}
              </button>

              <!-- Niche grid -->
              <div class="app-niche-grid" *ngIf="showNichePicker">
                <button *ngFor="let n of nicheOptions" type="button"
                        class="app-niche-btn"
                        [class.app-niche-btn--active]="profile?.selectedNiche === n.value"
                        [disabled]="nicheLoading"
                        (click)="selectNiche(n.value)">
                  <span class="app-niche-emoji">{{ n.emoji }}</span>
                  <span>{{ n.label }}</span>
                </button>
                <div class="app-niche-error" *ngIf="nicheError">{{ nicheError }}</div>
              </div>
            </div>

            <!-- Referral card -->
            <div class="app-action">
              <h3>Indique e ganhe 1 mes gratis</h3>
              <p>A cada 4 amigos que assinarem um plano pago com seu link, voce ganha 1 mes gratis.</p>
              <div class="app-referral-inline">
                <code class="app-referral-inline__link">spark.akroma.com.br/cadastro?ref={{ client.referralCode }}</code>
                <button type="button" class="app-copy-btn" (click)="copyReferralLink()">
                  <svg *ngIf="!copiedLink" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <svg *ngIf="copiedLink" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ copiedLink ? 'Copiado!' : 'Copiar' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- POSTS -->
        <div *ngIf="tab === 'posts'">
          <header class="app-page-header">
            <h1>Seus posts</h1>
            <p>Aprove, edite ou reagende os posts gerados pela IA.</p>
          </header>
          <div class="app-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <h3>Nenhum post ainda</h3>
            <p>Conecte seu Instagram para a IA comecar a gerar posts automaticamente.</p>
            <button type="button" class="btn btn--spark" (click)="tab = 'overview'">Ir para o inicio</button>
          </div>
        </div>

        <!-- REFERRALS -->
        <div *ngIf="tab === 'referrals'">
          <header class="app-page-header">
            <h1>Programa de indicacao</h1>
            <p>A cada 4 amigos que assinarem um plano pago com seu codigo, voce ganha 1 mes gratis.</p>
          </header>

          <div class="app-referral-card">
            <span class="app-referral-card__label">SEU CODIGO</span>
            <div class="app-referral-card__code">
              <strong>{{ referralStats?.referralCode || client.referralCode || '—' }}</strong>
              <button type="button" class="app-copy-btn" (click)="copyCode()">
                <svg *ngIf="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <svg *ngIf="copied" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{{ copied ? 'Copiado!' : 'Copiar' }}</span>
              </button>
            </div>
            <div class="app-referral-card__share">
              <span>Compartilhe: <code>spark.akroma.com.br/cadastro?ref={{ referralStats?.referralCode || client.referralCode }}</code></span>
            </div>
          </div>

          <div class="app-stats">
            <div class="app-stat">
              <span class="app-stat__label">Amigos pagando</span>
              <span class="app-stat__value">{{ referralStats?.totalPaidReferrals ?? 0 }}</span>
              <span class="app-stat__hint">Indicados com plano ativo</span>
            </div>
            <div class="app-stat">
              <span class="app-stat__label">Meses gratis</span>
              <span class="app-stat__value">{{ referralStats?.creditMonths ?? 0 }}</span>
              <span class="app-stat__hint">{{ (referralStats?.creditMonths ?? 0) === 1 ? 'mes gratis conquistado' : 'meses gratis conquistados' }}</span>
            </div>
            <div class="app-stat" *ngIf="(referralStats?.referralsToNextMonth ?? 0) > 0">
              <span class="app-stat__label">Proximo mes gratis</span>
              <span class="app-stat__value">{{ referralStats?.referralsToNextMonth ?? 4 }}</span>
              <span class="app-stat__hint">Indicados que faltam</span>
            </div>
          </div>
        </div>

        <!-- PLAN -->
        <div *ngIf="tab === 'plan'">
          <header class="app-page-header">
            <h1>Seu plano</h1>
            <p>Gerencie sua assinatura e cobrancas.</p>
          </header>

          <!-- Current plan status -->
          <div class="app-plan-card" [class.app-plan-card--canceled]="billingStatus?.canceled">
            <div class="app-plan-card__header">
              <div>
                <span class="app-plan-card__tag">PLANO ATUAL</span>
                <strong>{{ billingStatus?.planTier || client.planTier }}</strong>
                <span class="app-plan-card__status" *ngIf="billingStatus?.trialActive">
                  Trial gratis — {{ trialDaysLeft }} dias restantes
                </span>
                <span class="app-plan-card__status app-plan-card__status--paid"
                      *ngIf="!billingStatus?.trialActive && billingStatus?.active && !billingStatus?.canceled">
                  Ativo {{ billingStatus?.billingCycle === 'ANNUAL' ? '(anual)' : '(mensal)' }}
                </span>
                <span class="app-plan-card__status app-plan-card__status--canceled"
                      *ngIf="billingStatus?.canceled">
                  Cancelado — acesso ate {{ billingStatus?.periodEnd | date:'dd/MM/yyyy' }}
                </span>
              </div>
            </div>
            <p class="app-plan-card__desc" *ngIf="!billingStatus?.canceled">
              {{ billingStatus?.trialActive
                ? 'Ative um plano antes do trial encerrar para continuar publicando automaticamente.'
                : 'Voce pode mudar de plano ou cancelar a qualquer momento. Cancelamentos nao geram reembolso do periodo ja pago.' }}
            </p>
            <p class="app-plan-card__desc" *ngIf="billingStatus?.canceled">
              Sua assinatura foi cancelada. Voce mantem acesso ate <strong>{{ billingStatus?.periodEnd | date:'dd/MM/yyyy' }}</strong>.
              Para reativar, escolha um plano abaixo.
            </p>
          </div>

          <!-- Plan selector: only show if on trial or free or canceled -->
          <div class="app-plan-upgrade" *ngIf="billingStatus?.trialActive || !billingStatus?.active || billingStatus?.canceled">
            <h2 class="app-plan-upgrade__title">Escolha seu plano</h2>

            <!-- Cycle toggle -->
            <div class="app-cycle-toggle">
              <button type="button" class="app-cycle-btn" [class.app-cycle-btn--active]="selectedCycle === 'MONTHLY'"
                      (click)="selectedCycle = 'MONTHLY'">Mensal</button>
              <button type="button" class="app-cycle-btn" [class.app-cycle-btn--active]="selectedCycle === 'ANNUAL'"
                      (click)="selectedCycle = 'ANNUAL'">
                Anual <span class="app-cycle-discount">2 meses gratis</span>
              </button>
            </div>

            <!-- Plan cards -->
            <div class="app-plan-options" *ngIf="planPrices">
              <!-- Starter -->
              <div class="app-plan-option" [class.app-plan-option--selected]="selectedPlanTier === 'STARTER'"
                   (click)="selectedPlanTier = 'STARTER'">
                <div class="app-plan-option__header">
                  <span class="app-plan-option__name">Starter</span>
                  <div class="app-plan-option__price">
                    <span class="app-plan-option__price-main">
                      R$ {{ selectedCycle === 'ANNUAL' ? planPrices.starter.annualMonthly : planPrices.starter.monthly }}
                    </span>
                    <span class="app-plan-option__price-label">/mes</span>
                  </div>
                  <div class="app-plan-option__annual-note" *ngIf="selectedCycle === 'ANNUAL'">
                    R$ {{ planPrices.starter.annual }} cobrado anualmente
                  </div>
                </div>
                <ul class="app-plan-option__features">
                  <li>Posts automaticos diarios</li>
                  <li>Geração de imagem por IA</li>
                  <li>1 perfil Instagram</li>
                  <li>Relatorios basicos</li>
                </ul>
              </div>

              <!-- Pro -->
              <div class="app-plan-option app-plan-option--pro" [class.app-plan-option--selected]="selectedPlanTier === 'PRO'"
                   (click)="selectedPlanTier = 'PRO'">
                <div class="app-plan-option__badge">RECOMENDADO</div>
                <div class="app-plan-option__header">
                  <span class="app-plan-option__name">Pro</span>
                  <div class="app-plan-option__price">
                    <span class="app-plan-option__price-main">
                      R$ {{ selectedCycle === 'ANNUAL' ? planPrices.pro.annualMonthly : planPrices.pro.monthly }}
                    </span>
                    <span class="app-plan-option__price-label">/mes</span>
                  </div>
                  <div class="app-plan-option__annual-note" *ngIf="selectedCycle === 'ANNUAL'">
                    R$ {{ planPrices.pro.annual }} cobrado anualmente
                  </div>
                </div>
                <ul class="app-plan-option__features">
                  <li>Tudo do Starter</li>
                  <li>Carrossis e stories</li>
                  <li>Multiplos perfis</li>
                  <li>Relatorios avancados</li>
                  <li>Suporte prioritario</li>
                </ul>
              </div>
            </div>

            <!-- Loading prices -->
            <div class="app-plan-loading" *ngIf="!planPrices && planLoading">Carregando precos...</div>

            <!-- Checkout button -->
            <button type="button" class="btn btn--spark app-plan-cta"
                    [disabled]="checkoutLoading || !planPrices"
                    (click)="startCheckout()">
              <span *ngIf="!checkoutLoading">
                Assinar {{ selectedPlanTier | titlecase }} {{ selectedCycle === 'ANNUAL' ? 'Anual' : 'Mensal' }} &rarr;
              </span>
              <span *ngIf="checkoutLoading">Redirecionando para pagamento...</span>
            </button>
            <p class="app-plan-note">
              Voce sera redirecionado para o checkout seguro. Aceitamos PIX, cartao de credito e debito.
            </p>
            <div class="app-plan-error" *ngIf="checkoutError">{{ checkoutError }}</div>
          </div>

          <!-- Cancel subscription (only for paying, non-canceled clients) -->
          <div class="app-cancel-section"
               *ngIf="!billingStatus?.trialActive && billingStatus?.active && !billingStatus?.canceled && billingStatus?.planValue && billingStatus?.planValue! > 0">
            <h3>Cancelar assinatura</h3>
            <p>
              Ao cancelar, nenhuma nova cobranca sera gerada. Voce mantem acesso ao Spark
              ate o fim do periodo ja pago (<strong>{{ billingStatus?.periodEnd | date:'dd/MM/yyyy' }}</strong>).
            </p>
            <div *ngIf="!cancelConfirm">
              <button type="button" class="btn app-cancel-btn" (click)="cancelConfirm = true">
                Cancelar assinatura
              </button>
            </div>
            <div class="app-cancel-confirm" *ngIf="cancelConfirm">
              <p class="app-cancel-confirm__warning">Tem certeza? Esta acao nao pode ser desfeita.</p>
              <div class="app-cancel-confirm__btns">
                <button type="button" class="btn btn--outline" (click)="cancelConfirm = false"
                        [disabled]="cancelLoading">Nao, manter assinatura</button>
                <button type="button" class="btn app-cancel-btn--confirm"
                        [disabled]="cancelLoading" (click)="cancelSubscription()">
                  {{ cancelLoading ? 'Cancelando...' : 'Sim, cancelar' }}
                </button>
              </div>
            </div>
            <div class="app-plan-error" *ngIf="cancelError">{{ cancelError }}</div>
          </div>
        </div>
      </main>
    </section>
  `,
  styles: [`
    :host { display: block; background: #050912; min-height: 100vh; }

    .app-shell {
      display: grid; grid-template-columns: 240px 1fr; min-height: 100vh;
    }
    @media (max-width: 768px) {
      .app-shell { grid-template-columns: 1fr; }
      .app-sidebar { display: none; }
    }

    .app-sidebar {
      background: #07091a; border-right: 1px solid rgba(255,255,255,0.05);
      padding: 24px 16px; display: flex; flex-direction: column; gap: 24px;
    }
    .app-logo {
      display: flex; align-items: center; gap: 8px;
      padding: 0 8px; text-decoration: none;
    }
    .app-logo__icon {
      height: 28px; width: auto;
      filter: brightness(0) saturate(100%) invert(76%) sepia(43%) saturate(1100%) hue-rotate(358deg) brightness(101%) contrast(99%);
    }
    .app-logo__name { font-size: 15px; font-weight: 700; color: #fff; }
    .app-logo__accent {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .app-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .app-nav__item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; border-radius: 8px;
      background: transparent; color: #9ca3af; border: none; cursor: pointer;
      font-size: 14px; font-weight: 500; text-align: left;
      transition: all 0.15s;
    }
    .app-nav__item svg { width: 16px; height: 16px; flex-shrink: 0; }
    .app-nav__item:hover { background: rgba(255,255,255,0.04); color: #fff; }
    .app-nav__item--active {
      background: rgba(251,191,36,0.08); color: #fbbf24;
    }

    .app-sidebar__footer { padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); }
    .app-logout {
      display: flex; align-items: center; gap: 10px;
      width: 100%; padding: 10px 14px; border-radius: 8px;
      background: transparent; color: #9ca3af; border: none; cursor: pointer;
      font-size: 13px; font-weight: 500; text-align: left;
      transition: all 0.15s;
    }
    .app-logout:hover { background: rgba(239,68,68,0.08); color: #f87171; }
    .app-logout svg { width: 14px; height: 14px; }

    .app-main { padding: 32px 40px; max-width: 1100px; }
    @media (max-width: 768px) { .app-main { padding: 24px 16px; } }

    .app-welcome {
      display: flex; align-items: center; gap: 16px;
      padding: 16px 20px; margin-bottom: 32px; border-radius: 14px;
      background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.2);
    }
    .app-welcome__icon { flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px;
      background: rgba(251,191,36,0.12); display: flex; align-items: center; justify-content: center; }
    .app-welcome__icon svg { width: 18px; height: 18px; }
    .app-welcome > div:nth-child(2) { flex: 1; }
    .app-welcome strong { display: block; color: #fff; font-size: 15px; margin-bottom: 2px; }
    .app-welcome span { font-size: 13px; color: #d1d5db; }
    .app-welcome__close {
      background: transparent; border: none; cursor: pointer; color: #6b7280;
      padding: 6px; border-radius: 6px; transition: all 0.15s;
    }
    .app-welcome__close:hover { background: rgba(255,255,255,0.05); color: #fff; }
    .app-welcome__close svg { width: 16px; height: 16px; }

    .app-page-header { margin-bottom: 28px; }
    .app-page-header h1 {
      font-size: clamp(24px, 3vw, 30px); font-weight: 800; color: #fff; margin: 0 0 6px;
    }
    .app-page-header p { font-size: 14px; color: #9ca3af; margin: 0; }

    .app-stats {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;
    }
    @media (max-width: 640px) { .app-stats { grid-template-columns: 1fr; } }
    .app-stat {
      padding: 20px; border-radius: 14px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    }
    .app-stat__label {
      display: block; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
      color: #6b7280; text-transform: uppercase; margin-bottom: 8px;
    }
    .app-stat__value {
      display: block; font-size: 28px; font-weight: 800; color: #fbbf24; line-height: 1;
      margin-bottom: 4px;
    }
    .app-stat__value--mono { font-family: 'SF Mono', Menlo, monospace; font-size: 22px; letter-spacing: 1px; }
    .app-stat__hint { font-size: 12px; color: #9ca3af; }

    .app-actions {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
    }
    @media (max-width: 860px) { .app-actions { grid-template-columns: 1fr; } }
    .app-action {
      padding: 24px; border-radius: 14px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    }
    .app-action--primary {
      background: rgba(251,191,36,0.05); border-color: rgba(251,191,36,0.2);
    }
    .app-action--connected {
      background: rgba(34,197,94,0.04); border-color: rgba(34,197,94,0.2);
    }
    .app-action__status {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
      color: #22c55e; text-transform: uppercase; margin-bottom: 8px;
    }
    .app-action__status svg { width: 12px; height: 12px; }
    .app-action__error { font-size: 12px; color: #f87171; margin-top: 8px; }
    .app-action h3 { font-size: 15px; font-weight: 700; color: #fff; margin: 0 0 6px; }
    .app-action p { font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 16px; }

    .app-niche-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;
    }
    .app-niche-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; border-radius: 10px; font-size: 13px; font-weight: 500;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      color: #d1d5db; cursor: pointer; text-align: left; transition: all 0.15s;
    }
    .app-niche-btn:hover:not(:disabled) { border-color: rgba(251,191,36,0.3); color: #fff; }
    .app-niche-btn--active {
      border-color: #fbbf24; background: rgba(251,191,36,0.08); color: #fbbf24;
    }
    .app-niche-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .app-niche-emoji { font-size: 16px; }
    .app-niche-error { grid-column: 1/-1; font-size: 12px; color: #f87171; }

    .app-referral-inline {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px; padding: 10px 12px;
    }
    .app-referral-inline__link {
      flex: 1; font-size: 12px; color: #fbbf24; font-family: monospace;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 10px 18px; border-radius: 10px; font-weight: 600; font-size: 14px;
      border: none; cursor: pointer; text-decoration: none;
      transition: all 0.2s;
    }
    .btn--spark {
      background: linear-gradient(135deg, #f59e0b, #d97706); color: #000;
      border: 1px solid rgba(251,191,36,0.4);
    }
    .btn--spark:hover:not(:disabled) {
      filter: brightness(1.08); transform: translateY(-1px);
    }
    .btn--spark:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn--outline {
      background: transparent; color: #d1d5db;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .btn--outline:hover:not(:disabled) { border-color: rgba(255,255,255,0.3); color: #fff; }
    .btn--outline:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Empty */
    .app-empty {
      text-align: center; padding: 64px 24px; border-radius: 14px;
      background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.08);
    }
    .app-empty svg { width: 42px; height: 42px; color: #4b5563; margin-bottom: 16px; }
    .app-empty h3 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px; }
    .app-empty p { font-size: 14px; color: #9ca3af; max-width: 360px; margin: 0 auto 20px; }

    /* Referral */
    .app-referral-card {
      padding: 24px; border-radius: 14px; margin-bottom: 24px;
      background: rgba(251,191,36,0.05); border: 1px solid rgba(251,191,36,0.2);
    }
    .app-referral-card__label {
      display: block; font-size: 11px; font-weight: 700; letter-spacing: 2px;
      color: #fbbf24; margin-bottom: 12px;
    }
    .app-referral-card__code {
      display: flex; align-items: center; gap: 16px;
      font-family: 'SF Mono', Menlo, monospace; margin-bottom: 12px;
    }
    .app-referral-card__code strong {
      font-size: 32px; font-weight: 800; color: #fff; letter-spacing: 3px;
    }
    .app-copy-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600;
      background: rgba(255,255,255,0.06); color: #d1d5db;
      border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
      transition: all 0.15s;
    }
    .app-copy-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .app-copy-btn svg { width: 13px; height: 13px; }
    .app-referral-card__share { font-size: 12px; color: #9ca3af; }
    .app-referral-card__share code {
      background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;
      font-size: 12px; color: #fbbf24;
    }

    /* Plan */
    .app-plan-card {
      padding: 28px; border-radius: 14px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    }
    .app-plan-card__header { margin-bottom: 16px; }
    .app-plan-card__tag {
      display: block; font-size: 11px; font-weight: 700; letter-spacing: 2px;
      color: #6b7280; margin-bottom: 8px;
    }
    .app-plan-card__header strong {
      display: block; font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 6px;
    }
    .app-plan-card__status {
      display: inline-block; padding: 4px 12px; border-radius: 20px;
      background: rgba(34,197,94,0.1); color: #22c55e;
      font-size: 12px; font-weight: 600;
    }
    .app-plan-card__desc { font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0 0 20px; }
    .app-plan-card__ctas { display: flex; gap: 12px; flex-wrap: wrap; }
    .app-plan-card--canceled { border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.04); }
    .app-plan-card__status--paid { background: rgba(34,197,94,0.1); color: #22c55e; }
    .app-plan-card__status--canceled { background: rgba(239,68,68,0.1); color: #f87171; }

    /* Plan upgrade section */
    .app-plan-upgrade { margin-top: 32px; }
    .app-plan-upgrade__title {
      font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 20px;
    }

    /* Cycle toggle */
    .app-cycle-toggle {
      display: inline-flex; gap: 4px; padding: 4px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; margin-bottom: 24px;
    }
    .app-cycle-btn {
      padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;
      background: transparent; color: #9ca3af; border: none; cursor: pointer;
      transition: all 0.2s; display: flex; align-items: center; gap: 8px;
    }
    .app-cycle-btn--active { background: rgba(251,191,36,0.1); color: #fbbf24; }
    .app-cycle-discount {
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
      padding: 2px 8px; border-radius: 10px;
      background: rgba(34,197,94,0.12); color: #22c55e;
    }

    /* Plan option cards */
    .app-plan-options {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;
    }
    @media (max-width: 640px) { .app-plan-options { grid-template-columns: 1fr; } }

    .app-plan-option {
      position: relative; padding: 24px; border-radius: 16px; cursor: pointer;
      background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.08);
      transition: all 0.2s;
    }
    .app-plan-option:hover { border-color: rgba(251,191,36,0.3); }
    .app-plan-option--selected { border-color: #fbbf24; background: rgba(251,191,36,0.05); }
    .app-plan-option--pro { background: rgba(251,191,36,0.03); }
    .app-plan-option--pro.app-plan-option--selected { border-color: #fbbf24; background: rgba(251,191,36,0.08); }

    .app-plan-option__badge {
      position: absolute; top: -1px; right: 20px;
      font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
      padding: 4px 12px; border-radius: 0 0 10px 10px;
      background: linear-gradient(135deg, #f59e0b, #d97706); color: #000;
    }

    .app-plan-option__header { margin-bottom: 16px; }
    .app-plan-option__name {
      display: block; font-size: 13px; font-weight: 700; letter-spacing: 1.5px;
      color: #9ca3af; text-transform: uppercase; margin-bottom: 8px;
    }
    .app-plan-option__price { display: flex; align-items: baseline; gap: 4px; }
    .app-plan-option__price-main { font-size: 28px; font-weight: 800; color: #fff; }
    .app-plan-option__price-label { font-size: 13px; color: #6b7280; }
    .app-plan-option__annual-note {
      font-size: 12px; color: #6b7280; margin-top: 4px;
    }

    .app-plan-option__features {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column; gap: 8px;
    }
    .app-plan-option__features li {
      font-size: 13px; color: #d1d5db;
      padding-left: 18px; position: relative;
    }
    .app-plan-option__features li::before {
      content: '✓'; position: absolute; left: 0;
      color: #22c55e; font-weight: 700; font-size: 12px;
    }

    .app-plan-loading { font-size: 14px; color: #6b7280; padding: 16px 0; }

    .app-plan-cta { width: 100%; padding: 14px 24px; font-size: 16px; }
    .app-plan-note {
      text-align: center; font-size: 12px; color: #6b7280; margin: 12px 0 0; line-height: 1.5;
    }
    .app-plan-error {
      margin-top: 12px; padding: 10px 14px; border-radius: 8px; font-size: 13px;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #f87171;
    }

    /* Cancel section */
    .app-cancel-section {
      margin-top: 40px; padding: 24px; border-radius: 14px;
      background: rgba(239,68,68,0.04); border: 1px solid rgba(239,68,68,0.15);
    }
    .app-cancel-section h3 {
      font-size: 15px; font-weight: 700; color: #f87171; margin: 0 0 8px;
    }
    .app-cancel-section p { font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 16px; }
    .app-cancel-btn {
      background: transparent; border: 1px solid rgba(239,68,68,0.3);
      color: #f87171; font-size: 13px; padding: 8px 18px; border-radius: 8px; cursor: pointer;
      transition: all 0.2s;
    }
    .app-cancel-btn:hover { background: rgba(239,68,68,0.08); }
    .app-cancel-confirm { background: rgba(239,68,68,0.06); border-radius: 10px; padding: 16px; }
    .app-cancel-confirm__warning { font-size: 14px; color: #fca5a5; font-weight: 600; margin: 0 0 12px; }
    .app-cancel-confirm__btns { display: flex; gap: 12px; }
    .app-cancel-btn--confirm {
      padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
      background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #f87171;
      transition: all 0.2s;
    }
    .app-cancel-btn--confirm:hover:not(:disabled) { background: rgba(239,68,68,0.3); }
    .app-cancel-btn--confirm:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class ClientAppComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(ClientAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);

  client: ClientInfo | null = null;
  tab: Tab = 'overview';
  showWelcome = false;
  copied = false;
  copiedLink = false;
  referralStats: ReferralStats | null = null;
  readonly nicheOptions = NICHE_OPTIONS;

  // Profile (instagram + niche)
  profile: ClientProfile | null = null;
  showNichePicker = false;
  nicheLoading = false;
  nicheError = '';
  igConnecting = false;
  igConnectError = '';

  // Plan tab state
  billingStatus: BillingStatus | null = null;
  planPrices: PlanPrices | null = null;
  planLoading = false;
  selectedPlanTier: 'STARTER' | 'PRO' = 'STARTER';
  selectedCycle: 'MONTHLY' | 'ANNUAL' = 'MONTHLY';
  checkoutLoading = false;
  checkoutError = '';
  cancelConfirm = false;
  cancelLoading = false;
  cancelError = '';

  ngOnInit(): void {
    this.seo.setPage({ title: 'Painel — Akroma Spark', description: '', noindex: true });

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/entrar']);
      return;
    }

    this.client = this.auth.getClient();
    if (!this.client) {
      this.auth.logout();
      return;
    }

    this.showWelcome = this.route.snapshot.queryParamMap.get('welcome') === '1';

    // Seed profile from stored client info (instant, no extra request)
    this.profile = {
      selectedNiche: this.client.selectedNiche,
      instagramConnected: this.client.instagramConnected,
      instagramUsername: this.client.instagramUsername
    };

    // After Instagram OAuth callback, refresh profile to get updated token info
    if (this.route.snapshot.queryParamMap.get('ig') === 'connected') {
      this.loadProfile();
    }
  }

  get trialActive(): boolean {
    if (!this.client?.trialEndsAt) return false;
    return new Date(this.client.trialEndsAt).getTime() > Date.now();
  }

  get trialDaysLeft(): number | null {
    if (!this.client?.trialEndsAt) return null;
    const ms = new Date(this.client.trialEndsAt).getTime() - Date.now();
    return ms > 0 ? Math.floor(ms / (1000 * 60 * 60 * 24)) : 0;
  }

  loadReferralStats(): void {
    if (!this.client) return;
    if (this.referralStats) return; // cached
    this.http.get<ReferralStats>(`${environment.apiUrl}/api/v1/referral/stats/${this.client.clientId}`).subscribe({
      next: (stats) => this.referralStats = stats,
      error: () => {
        if (this.client?.referralCode) {
          this.referralStats = {
            referralCode: this.client.referralCode,
            totalPaidReferrals: 0,
            creditMonths: 0,
            referralsToNextMonth: 4
          };
        }
      }
    });
  }

  loadPlanData(): void {
    if (this.billingStatus && this.planPrices) return; // cached

    this.planLoading = true;
    const headers = this.auth.authHeaders();

    // Load billing status
    this.http.get<BillingStatus>(`${environment.apiUrl}/api/v1/client-billing/status`, { headers }).subscribe({
      next: (status) => {
        this.billingStatus = status;
        // Pre-select current plan tier if on a paid plan
        if (status.planTier && status.planTier !== 'FREE') {
          this.selectedPlanTier = status.planTier as 'STARTER' | 'PRO';
        }
        if (status.billingCycle) {
          this.selectedCycle = status.billingCycle as 'MONTHLY' | 'ANNUAL';
        }
      },
      error: () => {
        // Fallback to client info from JWT
        if (this.client) {
          this.billingStatus = {
            planTier: this.client.planTier,
            planValue: 0,
            billingCycle: 'MONTHLY',
            active: true,
            canceled: false,
            trialActive: this.trialActive,
            trialEndsAt: this.client.trialEndsAt
          };
        }
      }
    });

    // Load Spark pricing (public endpoint, no auth)
    this.http.get<PlanPrices>(`${environment.apiUrl}/api/v1/plans/spark`).subscribe({
      next: (prices) => { this.planPrices = prices; this.planLoading = false; },
      error: () => {
        this.planPrices = {
          starter: { monthly: '97',  annual: '970',  annualMonthly: '81' },
          pro:     { monthly: '197', annual: '1970', annualMonthly: '164' }
        };
        this.planLoading = false;
      }
    });
  }

  startCheckout(): void {
    if (this.checkoutLoading || !this.planPrices) return;
    this.checkoutLoading = true;
    this.checkoutError = '';
    const headers = this.auth.authHeaders();

    this.http.post<{ paymentUrl: string }>(
      `${environment.apiUrl}/api/v1/client-billing/checkout`,
      { planTier: this.selectedPlanTier, billingCycle: this.selectedCycle },
      { headers }
    ).subscribe({
      next: (res) => {
        this.checkoutLoading = false;
        window.location.href = res.paymentUrl;
      },
      error: (err) => {
        this.checkoutLoading = false;
        this.checkoutError = err.error?.error || 'Erro ao iniciar pagamento. Tente novamente.';
      }
    });
  }

  cancelSubscription(): void {
    if (this.cancelLoading) return;
    this.cancelLoading = true;
    this.cancelError = '';
    const headers = this.auth.authHeaders();

    this.http.post<{ message: string; canceledAt: string; periodEnd: string }>(
      `${environment.apiUrl}/api/v1/client-billing/cancel`,
      {},
      { headers }
    ).subscribe({
      next: (res) => {
        this.cancelLoading = false;
        this.cancelConfirm = false;
        if (this.billingStatus) {
          this.billingStatus.canceled = true;
          this.billingStatus.canceledAt = res.canceledAt;
          this.billingStatus.periodEnd = res.periodEnd;
        }
      },
      error: (err) => {
        this.cancelLoading = false;
        this.cancelError = err.error?.error || 'Erro ao cancelar. Tente novamente.';
      }
    });
  }

  copyCode(): void {
    const code = this.referralStats?.referralCode || this.client?.referralCode;
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    } catch {
      // noop
    }
  }

  copyReferralLink(): void {
    const code = this.client?.referralCode;
    if (!code) return;
    try {
      navigator.clipboard.writeText(`https://spark.akroma.com.br/cadastro?ref=${code}`);
      this.copiedLink = true;
      setTimeout(() => this.copiedLink = false, 2000);
    } catch {
      // noop
    }
  }

  connectInstagram(): void {
    if (this.igConnecting) return;
    this.igConnecting = true;
    this.igConnectError = '';
    const headers = this.auth.authHeaders();
    this.http.get<{ url: string }>(`${environment.apiUrl}/api/v1/client/instagram/oauth-url`, { headers }).subscribe({
      next: (res) => { window.location.href = res.url; },
      error: (err) => {
        this.igConnecting = false;
        this.igConnectError = err.error?.error || 'Erro ao iniciar conexao com Instagram.';
      }
    });
  }

  loadProfile(): void {
    const headers = this.auth.authHeaders();
    this.http.get<ClientProfile>(`${environment.apiUrl}/api/v1/client/me`, { headers }).subscribe({
      next: (p) => { this.profile = p; },
      error: () => {}
    });
  }

  selectNiche(niche: string): void {
    if (this.nicheLoading) return;
    this.nicheLoading = true;
    this.nicheError = '';
    const headers = this.auth.authHeaders();
    this.http.post<{ niche: string }>(`${environment.apiUrl}/api/v1/client/niche`, { niche }, { headers }).subscribe({
      next: (res) => {
        this.nicheLoading = false;
        this.showNichePicker = false;
        if (this.profile) this.profile = { ...this.profile, selectedNiche: res.niche };
        if (this.client) this.client = { ...this.client, selectedNiche: res.niche };
      },
      error: (err) => {
        this.nicheLoading = false;
        this.nicheError = err.error?.error || 'Erro ao salvar nicho. Tente novamente.';
      }
    });
  }

  nicheLabel(value: string | undefined): string {
    if (!value) return 'Nao configurado';
    return this.nicheOptions.find(n => n.value === value)?.label ?? value;
  }

  logout(): void {
    this.auth.logout();
  }
}
