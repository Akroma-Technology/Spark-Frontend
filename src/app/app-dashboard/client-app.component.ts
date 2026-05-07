import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ClientAuthService, ClientInfo } from '../core/services/client-auth.service';
import { SeoService } from '../core/services/seo.service';
import { environment } from '../../environments/environment';

interface IgError {
  title: string;
  what: string;
  steps: string[];
}

interface ReferralStats {
  referralCode: string | null;
  totalPaidReferrals: number;
  creditMonths: number;
  referralsToNextMonth: number;
}

interface ClientProfile {
  name?: string;
  email?: string;
  selectedNiche?: string;
  instagramConnected?: boolean;
  instagramUsername?: string;
  instagramTokenExpiresAt?: string;
  facebookPageId?: string;
  facebookPageName?: string;
  brandContext?: string;
  brandContextHint?: string;
  brandContextNeedsAttention?: boolean;
  logoUrl?: string;
  // Plan + post config
  planTier?: string;
  maxPostsPerDay?: number;
  facebookEnabled?: boolean;
  postsPerDay?: number;
  activeDays?: string[];
  scheduleTimes?: PostSlot[];
  negativeTopics?: string;
  fixedHashtags?: string;
  watermarkComment?: string;
  imageStyle?: string;
  imageStyleTemplateDefault?: string;
  searchDescription?: string;
}

interface PostSlot {
  time: string;
  dayOfWeek: string;
  format: 'SINGLE' | 'CAROUSEL';
  carouselCount?: number;
  publishStory?: boolean;
  searchTopic?: string | null;
  networks?: string[];
}

const NICHE_OPTIONS: { value: string; label: string; emoji: string }[] = [
  { value: 'fitness',     label: 'Fitness / Academia',     emoji: '💪' },
  { value: 'tecnologia',  label: 'Tecnologia',             emoji: '💻' },
  { value: 'gastronomia', label: 'Gastronomia',            emoji: '🍽️' },
  { value: 'moda',        label: 'Moda',                   emoji: '👗' },
  { value: 'juridico',    label: 'Jurídico / Advocacia',   emoji: '⚖️' },
  { value: 'imobiliario', label: 'Imobiliário',            emoji: '🏠' },
  { value: 'educacao',    label: 'Educação',               emoji: '📚' },
  { value: 'saude',       label: 'Saúde / Bem-estar',      emoji: '🏥' },
  { value: 'esportivo',   label: 'Esportivo',              emoji: '⚽' },
  { value: 'nutricao',    label: 'Nutrição',               emoji: '🥗' },
  { value: 'medicina',    label: 'Medicina',               emoji: '⚕️' },
  { value: 'agronomia',   label: 'Agronomia / Agro',       emoji: '🌾' },
  { value: 'veterinaria', label: 'Veterinária / Pet',      emoji: '🐾' },
  { value: 'financas',    label: 'Finanças / Investimentos', emoji: '💰' },
  { value: 'noticias',    label: 'Notícias / Mídia',       emoji: '📰' },
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

type Tab = 'overview' | 'posts' | 'referrals' | 'plan' | 'brand' | 'schedule';

@Component({
  selector: 'app-client-app',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
          <button type="button" class="app-nav__item" [class.app-nav__item--active]="tab === 'brand'" (click)="openBrandTab()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
            <span>Marca</span>
            <span *ngIf="profile?.brandContextNeedsAttention" class="app-nav__dot" title="Personalize sua marca"></span>
          </button>
          <button type="button" class="app-nav__item" [class.app-nav__item--active]="tab === 'schedule'" (click)="openScheduleTab()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Agenda</span>
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
            <strong>Bem-vindo ao Akroma Spark, <span class="hl-name">{{ firstName }}</span>!</strong>
            <span>Seu trial Starter de 7 dias esta ativo. Conecte seu Instagram para comecar.</span>
          </div>
          <button type="button" class="app-welcome__close" (click)="showWelcome = false" aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- OVERVIEW -->
        <div *ngIf="tab === 'overview'">
          <header class="app-page-header">
            <h1>Olá, <span class="hl-name">{{ firstName }}</span></h1>
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
              <span class="app-stat__value">{{ referralStats?.totalPaidReferrals ?? 0 }}</span>
              <span class="app-stat__hint">{{ (referralStats?.creditMonths ?? 0) > 0 ? (referralStats!.creditMonths + ' mes gratis') : 'Amigos que pagaram' }}</span>
            </div>
          </div>

          <!-- TINDER-STYLE PROFILE COMPLETION BANNER -->
          <div *ngIf="profile?.selectedNiche && profile?.brandContextNeedsAttention"
               class="profile-completion-banner">
            <div class="profile-completion-banner__bar">
              <div class="profile-completion-banner__bar-fill" [style.width.%]="completionPercent"></div>
            </div>
            <div class="profile-completion-banner__content">
              <div class="profile-completion-banner__text">
                <h3>Seu perfil está {{ completionPercent }}% pronto</h3>
                <p>Conta pra IA <strong>como sua marca fala</strong> — assim os posts ficam com a sua cara, não genéricos.</p>
              </div>
              <button class="btn btn--spark" (click)="openBrandTab()">
                Completar agora →
              </button>
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

              <!-- Connected state -->
              <div *ngIf="profile?.instagramConnected" class="connected-networks">
                <div class="connected-network-row">
                  <span class="network-badge network-badge--ig">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                    Instagram
                  </span>
                  <strong>&#64;{{ profile?.instagramUsername }}</strong>
                </div>
                <div class="connected-network-row" *ngIf="profile?.facebookPageName">
                  <span class="network-badge network-badge--fb">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    Facebook
                  </span>
                  <strong>{{ profile?.facebookPageName }}</strong>
                </div>
                <p class="connected-networks__hint">A IA pode publicar automaticamente nessas redes.</p>
              </div>

              <!-- Not connected: show requirements checklist -->
              <ng-container *ngIf="!profile?.instagramConnected">
                <ul class="app-ig-requirements">
                  <li>
                    <span class="app-ig-req__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    <span class="app-ig-req__text">
                      <strong>Pagina do Facebook criada</strong>
                      <span>nao pode ser perfil pessoal</span>
                    </span>
                  </li>
                  <li>
                    <span class="app-ig-req__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    <span class="app-ig-req__text">
                      <strong>Instagram Business ou Creator</strong>
                      <span>conta pessoal nao funciona</span>
                    </span>
                  </li>
                  <li>
                    <span class="app-ig-req__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    <span class="app-ig-req__text">
                      <strong>Instagram vinculado a Pagina do Facebook</strong>
                      <span>Instagram → Configuracoes → Conta → Conta vinculada</span>
                    </span>
                  </li>
                </ul>
              </ng-container>

              <button *ngIf="!profile?.instagramConnected" type="button"
                      class="btn btn--spark" [disabled]="igConnecting" (click)="connectInstagram()">
                {{ igConnecting ? 'Redirecionando...' : 'Conectar Instagram →' }}
              </button>
              <button *ngIf="profile?.instagramConnected" type="button"
                      class="btn btn--outline" [disabled]="igConnecting" (click)="connectInstagram()">
                {{ igConnecting ? 'Redirecionando...' : 'Reconectar' }}
              </button>
            </div>

            <!-- Instagram error modal -->
            <div class="app-modal-overlay" *ngIf="igError" (click)="igError = null">
              <div class="app-modal" (click)="$event.stopPropagation()">
                <div class="app-modal__icon app-modal__icon--error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3 class="app-modal__title">{{ igError.title }}</h3>
                <p class="app-modal__body">{{ igError.what }}</p>
                <div class="app-modal__steps" *ngIf="igError.steps.length">
                  <p class="app-modal__steps-label">Como corrigir:</p>
                  <ol>
                    <li *ngFor="let step of igError.steps">{{ step }}</li>
                  </ol>
                </div>
                <div class="app-modal__actions">
                  <button type="button" class="btn btn--outline" (click)="igError = null">Entendi</button>
                  <button type="button" class="btn btn--spark" (click)="igError = null; connectInstagram()">Tentar novamente</button>
                </div>
              </div>
            </div>

            <!-- Niche card -->
            <div class="app-action" [class.app-action--niche-set]="profile?.selectedNiche && !showNichePicker">
              <div class="app-action__status" *ngIf="profile?.selectedNiche && !showNichePicker && !nicheSaved">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Configurado
              </div>
              <div class="app-action__status app-action__status--saved" *ngIf="nicheSaved">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Salvo com sucesso!
              </div>
              <h3>Configure seu nicho</h3>
              <p>
                A IA adapta os posts ao seu mercado.
                <span *ngIf="profile?.selectedNiche">
                  Nicho atual: <strong>{{ nicheLabel(profile?.selectedNiche) }}</strong>
                </span>
                <span *ngIf="!profile?.selectedNiche">Escolha seu nicho para melhores resultados.</span>
              </p>

              <!-- Niche picker collapsed view -->
              <button *ngIf="!showNichePicker" type="button" class="btn btn--outline" (click)="showNichePicker = true; nicheSaved = false">
                {{ profile?.selectedNiche ? 'Mudar nicho' : 'Escolher nicho →' }}
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
                  <svg *ngIf="profile?.selectedNiche === n.value" class="app-niche-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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

          <!-- ANALYTICS BÁSICO -->
          <section class="analytics-section" *ngIf="profile?.instagramConnected">
            <h2 class="analytics-section__title">📊 Análise de Performance</h2>

            <div *ngIf="analyticsLoading" class="analytics-grid">
              <div class="analytics-card analytics-card--skeleton"><div class="skeleton" style="height:40px;border-radius:6px"></div></div>
              <div class="analytics-card analytics-card--skeleton"><div class="skeleton" style="height:40px;border-radius:6px"></div></div>
              <div class="analytics-card analytics-card--skeleton"><div class="skeleton" style="height:40px;border-radius:6px"></div></div>
              <div class="analytics-card analytics-card--skeleton"><div class="skeleton" style="height:40px;border-radius:6px"></div></div>
            </div>

            <div *ngIf="!analyticsLoading && analyticsSummary" class="analytics-grid">
              <div class="analytics-card">
                <span class="analytics-card__label">Posts publicados</span>
                <span class="analytics-card__value">{{ analyticsSummary.totalPosts }}</span>
              </div>
              <div class="analytics-card">
                <span class="analytics-card__label">Taxa de sucesso</span>
                <span class="analytics-card__value">{{ analyticsSummary.successRate | number:'1.0-1' }}%</span>
              </div>
              <div class="analytics-card">
                <span class="analytics-card__label">Curtidas médias</span>
                <span class="analytics-card__value">{{ analyticsSummary.avgLikes | number:'1.0-1' }}</span>
              </div>
              <div class="analytics-card">
                <span class="analytics-card__label">Alcance médio</span>
                <span class="analytics-card__value">{{ analyticsSummary.avgReach | number:'1.0-0' }}</span>
              </div>
            </div>

            <p *ngIf="!analyticsLoading && analyticsSummary?.totalPosts === 0" class="analytics-empty">
              Nenhum post publicado ainda. Assim que seus primeiros posts forem ao ar, você verá as métricas aqui.
            </p>
          </section>
        </div>

        <!-- BRAND TAB -->
        <div *ngIf="tab === 'brand'">
          <header class="app-page-header">
            <h1>✨ Perfil da marca</h1>
            <p>Esses dados guiam o tom, o público e o estilo dos posts gerados pela IA. Seja específico — quanto mais a IA souber, mais a sua cara fica.</p>
          </header>

          <div class="cfg-page">
            <div class="cfg-section">
              <h2 class="cfg-section__title">Sobre o seu negócio</h2>
              <p class="cfg-section__desc" *ngIf="profile?.brandContextHint && (!profile?.brandContext || profile?.brandContext === profile?.brandContextHint)">
                ✨ <strong>Pré-preenchemos um rascunho do nicho <em>{{ nicheLabel(profile?.selectedNiche) }}</em>.</strong>
                Adapte para o seu caso real. Quanto mais único, melhor.
              </p>
              <textarea class="brand-edit-textarea" rows="9"
                        [(ngModel)]="brandContextDraft" [ngModelOptions]="{standalone: true}"
                        placeholder="Ex: Sou uma confeitaria artesanal em Florianópolis. Atendo casamentos e aniversários sofisticados. Tom acolhedor mas elegante, sempre destacando ingredientes premium."></textarea>
            </div>

            <div class="cfg-section">
              <h2 class="cfg-section__title">Logo da marca <span class="cfg-section__badge">opcional</span></h2>
              <p class="cfg-section__desc">URL pública do logo (PNG transparente recomendado). Aparece em alguns formatos de post.</p>
              <input class="brand-edit-input" type="url"
                     [(ngModel)]="logoUrlDraft" [ngModelOptions]="{standalone: true}"
                     placeholder="https://meusite.com/logo.png">
            </div>

            <div class="cfg-section">
              <h2 class="cfg-section__title">🎨 Estilo visual <span class="cfg-section__badge">avançado</span></h2>
              <p class="cfg-section__desc">
                Esse texto guia o gerador de imagem da IA. Já vem com um padrão profissional do nicho <strong>{{ nicheLabel(profile?.selectedNiche) }}</strong> (cores, tipografia, regras).
                <strong>Se mexer no padrão sem saber, pode prejudicar a qualidade dos posts.</strong>
              </p>
              <textarea class="brand-edit-textarea" rows="14"
                        [(ngModel)]="imageStyleDraft" [ngModelOptions]="{standalone: true}"
                        placeholder="DNA Visual da sua marca..."></textarea>
              <div class="image-style-actions">
                <button class="btn btn--outline btn--sm" type="button"
                        (click)="confirmResetImageStyle = true"
                        [disabled]="!profile?.imageStyleTemplateDefault || imageStyleDraft === profile?.imageStyleTemplateDefault">
                  ⟲ Restaurar padrão do nicho
                </button>
              </div>
            </div>

            <!-- Reset confirmation modal -->
            <div *ngIf="confirmResetImageStyle" class="modal-backdrop" (click)="confirmResetImageStyle = false">
              <div class="modal-card" (click)="$event.stopPropagation()">
                <h3>Restaurar estilo padrão?</h3>
                <p>Suas customizações no estilo visual <strong>serão sobrescritas</strong> pelo padrão profissional do nicho. Essa ação não pode ser desfeita.</p>
                <div class="modal-actions">
                  <button class="btn btn--outline" (click)="confirmResetImageStyle = false">Cancelar</button>
                  <button class="btn btn--spark" (click)="doResetImageStyle()" [disabled]="resettingImageStyle">
                    {{ resettingImageStyle ? 'Restaurando...' : 'Sim, restaurar padrão' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="cfg-page__actions">
              <button class="btn btn--spark cfg-page__save-btn" (click)="saveBrandContext()" [disabled]="brandContextSaving || !brandContextDraft.trim()">
                {{ brandContextSaving ? 'Salvando...' : 'Salvar perfil' }}
              </button>
            </div>
            <p class="brand-edit-error" *ngIf="brandContextError">{{ brandContextError }}</p>
          </div>
        </div>

        <!-- SCHEDULE TAB -->
        <div *ngIf="tab === 'schedule'" class="schedule-wrap" [class.schedule-wrap--locked]="!profile?.instagramConnected">
          <!-- Lock overlay (only when Instagram NOT connected) -->
          <div class="schedule-lock" *ngIf="!profile?.instagramConnected">
            <div class="schedule-lock__card">
              <div class="schedule-lock__icon">🔒</div>
              <h2>Conecte seu Instagram primeiro</h2>
              <p>
                Antes de configurar a agenda, autorize o Akroma Spark a publicar
                no seu Instagram. Sem essa conexão, a IA não consegue postar.
              </p>
              <button class="btn btn--spark" (click)="tab = 'overview'">
                ← Ir para a tela inicial e conectar
              </button>
              <p class="schedule-lock__hint">
                Você precisa de uma conta Instagram <strong>Business</strong> ou
                <strong>Creator</strong> vinculada a uma Página do Facebook.
              </p>
            </div>
          </div>

          <header class="app-page-header">
            <h1>📅 Agenda de publicação</h1>
            <p>
              Plano <strong class="hl-name">{{ profile?.planTier }}</strong> —
              até <strong>{{ profile?.maxPostsPerDay }}</strong> post(s) por dia,
              {{ canCarousel ? 'carrossel liberado.' : 'sem carrossel (faça upgrade para Pro).' }}
            </p>
          </header>

          <div class="cfg-page">
            <div class="cfg-section">
              <div class="cfg-section__head">
                <div>
                  <h2 class="cfg-section__title">Postagens agendadas</h2>
                  <p class="cfg-section__desc">{{ postConfigDraft.scheduleTimes.length }} configurada{{ postConfigDraft.scheduleTimes.length !== 1 ? 's' : '' }}. A IA gera e publica automaticamente nos horários definidos.</p>
                </div>
                <button class="btn btn--outline btn--sm" (click)="addSlot()">+ Adicionar postagem</button>
              </div>

              <div class="slots-list" style="margin-top: 12px;">
                <div *ngFor="let s of postConfigDraft.scheduleTimes; let i = index" class="slot-card">
                  <div class="slot-row">
                    <select class="cfg-input slot-day" [(ngModel)]="s.dayOfWeek" [ngModelOptions]="{standalone: true}" (ngModelChange)="recomputeSlotWarnings()">
                      <option *ngFor="let d of allDays" [value]="d.code">{{ d.fullLabel }}</option>
                    </select>
                    <span class="slot-sep">às</span>
                    <input type="time" class="cfg-input slot-time" [(ngModel)]="s.time" [ngModelOptions]="{standalone: true}">
                    <select class="cfg-input slot-format" [(ngModel)]="s.format" [ngModelOptions]="{standalone: true}">
                      <option value="SINGLE">Imagem única</option>
                      <option *ngIf="canCarousel" value="CAROUSEL">Carrossel</option>
                    </select>
                    <input *ngIf="s.format === 'CAROUSEL'" type="number" min="2" max="10"
                           class="cfg-input slot-count"
                           [(ngModel)]="s.carouselCount" [ngModelOptions]="{standalone: true}"
                           title="Slides">
                    <label class="toggle-story-c" title="Publicar também no Story">
                      <input type="checkbox" [(ngModel)]="s.publishStory" [ngModelOptions]="{standalone: true}">
                      <span>Story</span>
                    </label>
                    <button class="schedule-remove" (click)="removeSlot(i)" aria-label="Remover">×</button>
                  </div>

                  <!-- Network selector (Instagram / Facebook / Ambas) -->
                  <div class="slot-network-row">
                    <span class="slot-network-label">Publicar em:</span>
                    <!-- Instagram: always available -->
                    <button type="button" class="slot-net-btn"
                            [class.slot-net-btn--ig]="slotHasNetwork(s, 'instagram')"
                            (click)="setSlotNetwork(s, 'instagram')">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                      Instagram
                    </button>
                    <!-- Facebook: Pro+ only -->
                    <div class="slot-net-wrapper" [title]="!profile?.facebookEnabled ? 'Disponível no plano Pro ou superior' : ''">
                      <button type="button" class="slot-net-btn"
                              [class.slot-net-btn--fb]="slotHasNetwork(s, 'facebook')"
                              [class.slot-net-btn--locked]="!profile?.facebookEnabled"
                              [disabled]="!profile?.facebookEnabled"
                              (click)="profile?.facebookEnabled && setSlotNetwork(s, 'facebook')">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width:13px;height:13px"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        Facebook
                        <span *ngIf="!profile?.facebookEnabled" class="slot-net-lock">🔒</span>
                      </button>
                    </div>
                    <!-- Ambas: Pro+ only -->
                    <div class="slot-net-wrapper" [title]="!profile?.facebookEnabled ? 'Disponível no plano Pro ou superior' : ''">
                      <button type="button" class="slot-net-btn"
                              [class.slot-net-btn--both]="slotHasNetwork(s, 'both')"
                              [class.slot-net-btn--locked]="!profile?.facebookEnabled"
                              [disabled]="!profile?.facebookEnabled"
                              (click)="profile?.facebookEnabled && setSlotNetwork(s, 'both')">
                        Ambas
                        <span *ngIf="!profile?.facebookEnabled" class="slot-net-lock">🔒</span>
                      </button>
                    </div>
                  </div>

                  <div class="slot-topic-row">
                    <input class="cfg-input slot-topic"
                           type="text"
                           [(ngModel)]="s.searchTopic" [ngModelOptions]="{standalone: true}"
                           [placeholder]="'Tema do post (padrão: ' + (profile?.searchDescription || 'descrição do nicho') + ')'">
                  </div>
                  <p *ngIf="slotWarnings[i]" class="slot-warning">⚠️ {{ slotWarnings[i] }}</p>
                </div>
                <p *ngIf="!postConfigDraft.scheduleTimes.length" class="cfg-empty">
                  Nenhuma postagem agendada ainda. Clique em <strong>+ Adicionar postagem</strong> para começar.
                </p>
              </div>
            </div>

            <div class="cfg-page__actions">
              <button class="btn btn--spark cfg-page__save-btn" (click)="savePostConfig()" [disabled]="postConfigSaving">
                {{ postConfigSaving ? 'Salvando...' : 'Salvar agenda' }}
              </button>
            </div>
            <p class="brand-edit-error" *ngIf="postConfigError">{{ postConfigError }}</p>
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

            <!-- No code yet: show generate button -->
            <ng-container *ngIf="!(referralStats?.referralCode || client.referralCode)">
              <p class="app-referral-card__hint">Voce ainda nao tem um codigo de indicacao.</p>
              <button type="button" class="btn btn--spark" (click)="generateReferralCode()" [disabled]="generatingCode">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M12 5v14M5 12h14"/></svg>
                {{ generatingCode ? 'Gerando...' : 'Gerar meu codigo' }}
              </button>
            </ng-container>

            <!-- Has code: show it with copy button -->
            <ng-container *ngIf="referralStats?.referralCode || client.referralCode">
              <div class="app-referral-card__code">
                <strong>{{ referralStats?.referralCode || client.referralCode }}</strong>
                <button type="button" class="app-copy-btn" (click)="copyCode()">
                  <svg *ngIf="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <svg *ngIf="copied" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ copied ? 'Copiado!' : 'Copiar' }}</span>
                </button>
              </div>
              <div class="app-referral-card__share">
                <span>Compartilhe: <code>spark.akroma.com.br/cadastro?ref={{ referralStats?.referralCode || client.referralCode }}</code></span>
              </div>
            </ng-container>
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

          <!-- Zona de Perigo: apagar conta -->
          <div class="danger-zone">
            <h3 class="danger-zone__title">⚠️ Zona de Perigo</h3>
            <p class="danger-zone__desc">
              Apagar sua conta remove todos os seus dados e tokens permanentemente.
              Você não poderá criar uma nova conta com o mesmo e-mail ou conta do Instagram.
            </p>
            <button class="btn danger-zone__toggle-btn" (click)="showDeleteConfirm = !showDeleteConfirm">
              Apagar minha conta
            </button>
            <div *ngIf="showDeleteConfirm" class="delete-confirm">
              <p class="delete-confirm__label">Digite <strong>apagar</strong> para confirmar:</p>
              <input
                type="text"
                [(ngModel)]="deleteConfirmText"
                placeholder="apagar"
                class="delete-confirm__input"
              />
              <button
                class="btn btn--danger"
                [disabled]="deleteConfirmText.toLowerCase() !== 'apagar' || deletingAccount"
                (click)="deleteAccount()"
              >
                {{ deletingAccount ? 'Apagando...' : 'Confirmar — apagar conta' }}
              </button>
            </div>
          </div>
        </div>
      </main>

      <div *ngIf="nicheToast" style="position:fixed;bottom:1.5rem;right:1.5rem;background:#14532d;color:#86efac;border:1px solid #166534;border-radius:10px;padding:.75rem 1.25rem;font-size:.875rem;font-weight:600;z-index:999">{{ nicheToast }}</div>
    </section>
  `,
  styles: [`
    :host { display: block; background: #050912; min-height: 100vh; }
    .hl-name { color: #fbbf24; font-weight: inherit; }
    .app-nav__dot {
      margin-left: auto; width: 8px; height: 8px; border-radius: 50%;
      background: #fbbf24; box-shadow: 0 0 6px rgba(251,191,36,.7);
      animation: pulseDot 1.6s ease-in-out infinite;
    }
    @keyframes pulseDot {
      0%, 100% { opacity: .55; transform: scale(.85); }
      50%      { opacity: 1;   transform: scale(1.1); }
    }

    /* CONFIG PAGES (Brand / Schedule tabs) */
    .cfg-page { display: flex; flex-direction: column; gap: 20px; max-width: 880px; }
    .cfg-section {
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px;
      padding: 22px 24px;
    }
    .cfg-section__title { font-size: 16px; font-weight: 700; color: #fff; margin: 0 0 6px; display: flex; align-items: center; gap: 8px; }
    .cfg-section__desc { font-size: 13px; color: #9ca3af; margin: 0 0 14px; line-height: 1.6; }
    .cfg-section__desc strong { color: #fbbf24; font-weight: 600; }
    .cfg-section__desc em { color: #e5e7eb; font-style: normal; font-weight: 600; }
    .cfg-page__actions { margin-top: 8px; }
    .cfg-page__save-btn { width: 100%; justify-content: center; }
    .cfg-section__badge {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      background: rgba(255,255,255,.06); color: #9ca3af;
      padding: 2px 8px; border-radius: 4px; letter-spacing: .04em;
    }
    .cfg-section__head {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap;
    }
    .cfg-page__actions {
      display: flex; justify-content: space-between; gap: 10px; padding-top: 8px;
    }
    .cfg-empty {
      text-align: center; padding: 24px; color: #6b7280; font-size: 13px;
      background: rgba(255,255,255,.02); border: 1px dashed rgba(255,255,255,.08); border-radius: 10px;
    }
    .image-style-actions { display: flex; justify-content: flex-end; margin-top: 10px; }

    /* Generic modal */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
      animation: fadeBg .15s ease-out;
    }
    @keyframes fadeBg { from { opacity: 0; } to { opacity: 1; } }
    .modal-card {
      background: #0d1117; border: 1px solid rgba(251,191,36,.2); border-radius: 14px;
      max-width: 480px; width: 100%; padding: 24px 28px;
      box-shadow: 0 20px 60px rgba(0,0,0,.55);
      animation: cardIn .2s ease-out;
    }
    @keyframes cardIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .modal-card h3 { font-size: 17px; font-weight: 700; color: #fbbf24; margin: 0 0 8px; }
    .modal-card p { font-size: 14px; color: #d1d5db; line-height: 1.6; margin: 0 0 20px; }
    .modal-card p strong { color: #fff; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

    /* TINDER-STYLE PROFILE COMPLETION BANNER */
    .profile-completion-banner {
      background: linear-gradient(135deg, rgba(251,191,36,.08), rgba(124,58,237,.08));
      border: 1px solid rgba(251,191,36,.25);
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 24px;
      animation: slideInBanner .35s ease-out;
    }
    @keyframes slideInBanner {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .profile-completion-banner__bar {
      height: 6px; background: rgba(255,255,255,.06); border-radius: 999px;
      overflow: hidden; margin-bottom: 16px;
    }
    .profile-completion-banner__bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #fbbf24, #f59e0b);
      border-radius: 999px;
      transition: width .6s ease;
      box-shadow: 0 0 12px rgba(251,191,36,.5);
    }
    .profile-completion-banner__content {
      display: flex; gap: 20px; align-items: center; justify-content: space-between; flex-wrap: wrap;
    }
    .profile-completion-banner__text h3 {
      font-size: 16px; font-weight: 700; color: #fff; margin: 0 0 4px;
    }
    .profile-completion-banner__text p {
      font-size: 13px; color: #9ca3af; margin: 0; max-width: 540px;
    }
    .profile-completion-banner__text strong { color: #fbbf24; font-weight: 600; }

    /* BRAND CONTEXT EDITOR */
    .app-action--brand-edit {
      grid-column: 1 / -1;
      animation: slideInBanner .25s ease-out;
    }
    .brand-edit-desc {
      font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 12px;
    }
    .brand-edit-desc strong { color: #fbbf24; font-weight: 600; }
    .brand-edit-textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 14px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px;
      color: #e5e7eb;
      font-size: 14px;
      font-family: inherit;
      line-height: 1.55;
      resize: vertical;
      min-height: 140px;
      transition: border-color .15s;
    }
    .brand-edit-textarea:focus {
      outline: none; border-color: rgba(251,191,36,.5);
    }
    .brand-edit-row { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
    .brand-edit-label { font-size: 12px; color: #9ca3af; font-weight: 600; }
    .brand-edit-input {
      box-sizing: border-box;
      width: 100%;
      padding: 10px 14px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px;
      color: #e5e7eb;
      font-size: 14px;
      transition: border-color .15s;
    }
    .brand-edit-input:focus { outline: none; border-color: rgba(251,191,36,.5); }
    .brand-edit-actions {
      display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px;
    }
    .brand-edit-error { color: #f87171; font-size: 13px; margin: 8px 0 0; }

    /* Post Config Editor */
    .cfg-row { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
    .cfg-row:first-child { margin-top: 0; }
    .cfg-hint { color: #6b7280; font-weight: 400; font-size: 11px; margin-left: 6px; text-transform: none; }
    .cfg-input {
      box-sizing: border-box;
      padding: 8px 10px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 8px;
      color: #e5e7eb;
      font-size: 13px;
    }
    .cfg-input--sm { font-size: 12px; padding: 6px 8px; }
    .cfg-input:focus { outline: none; border-color: rgba(251,191,36,.5); }
    .cfg-warning { font-size: 12px; color: #fbbf24; margin: 4px 0 0; }

    .posts-per-day-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .posts-pd-btn {
      min-width: 44px; padding: 8px 14px;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
      color: #9ca3af; border-radius: 8px; font-weight: 700; cursor: pointer;
      transition: all .15s;
    }
    .posts-pd-btn:hover { border-color: rgba(251,191,36,.5); color: #fff; }
    .posts-pd-btn--on { background: rgba(251,191,36,.15); border-color: rgba(251,191,36,.6); color: #fbbf24; }

    .day-toggles { display: flex; flex-wrap: wrap; gap: 6px; }
    .day-toggle {
      padding: 8px 14px;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
      color: #9ca3af; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer;
      transition: all .15s;
    }
    .day-toggle:hover { border-color: rgba(251,191,36,.5); color: #fff; }
    .day-toggle--on { background: rgba(124,58,237,.18); border-color: rgba(124,58,237,.6); color: #c4b5fd; }

    /* Schedule lock overlay (when Instagram not connected) */
    .schedule-wrap { position: relative; }
    .schedule-wrap--locked > :not(.schedule-lock) {
      filter: blur(6px);
      pointer-events: none;
      user-select: none;
      opacity: 0.55;
    }
    .schedule-lock {
      position: absolute;
      inset: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(180deg, rgba(10,10,15,.55), rgba(10,10,15,.85));
      backdrop-filter: blur(2px);
      border-radius: 16px;
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .schedule-lock__card {
      max-width: 480px;
      width: 100%;
      background: rgba(15,15,20,.95);
      border: 1px solid rgba(251,191,36,.35);
      border-radius: 14px;
      padding: 32px 28px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,.5);
    }
    .schedule-lock__icon {
      font-size: 42px;
      margin-bottom: 14px;
      filter: drop-shadow(0 4px 12px rgba(251,191,36,.4));
    }
    .schedule-lock__card h2 {
      margin: 0 0 12px;
      font-size: 22px;
      color: #fff;
      letter-spacing: -0.01em;
    }
    .schedule-lock__card p {
      margin: 0 0 20px;
      color: #cbd5e1;
      font-size: 14px;
      line-height: 1.55;
    }
    .schedule-lock__hint {
      margin-top: 18px !important;
      font-size: 12px !important;
      color: #94a3b8 !important;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,.08);
    }
    .schedule-lock__hint strong { color: #fbbf24; }

    /* Slot cards (matches admin style) */
    .slots-list { display: flex; flex-direction: column; gap: 10px; }
    .slot-card {
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 10px;
      padding: 10px 12px;
    }
    .slot-row {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }
    .slot-day { min-width: 130px; }
    .slot-time { width: 110px; }
    .slot-format { min-width: 140px; }
    .slot-count { width: 64px; }
    .slot-sep { color: #9ca3af; font-size: 13px; }
    .slot-topic-row { margin-top: 8px; }
    .slot-topic { width: 100%; font-size: 13px; }
    .toggle-story-c {
      display: flex; align-items: center; gap: 6px; font-size: 12px; color: #9ca3af; cursor: pointer;
    }
    .schedule-remove {
      margin-left: auto;
      background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.25);
      color: #f87171; cursor: pointer;
      font-size: 16px; width: 30px; height: 30px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .schedule-remove:hover { background: rgba(239,68,68,.22); }
    .slot-warning {
      margin: 8px 0 0; font-size: 12px; color: #fbbf24;
    }


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

    /* Instagram requirements checklist */
    .app-ig-requirements {
      list-style: none; padding: 0; margin: 0 0 16px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .app-ig-requirements li {
      display: flex; align-items: flex-start; gap: 10px;
    }
    .app-ig-req__icon {
      flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px;
      background: rgba(34,197,94,0.12); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .app-ig-req__icon svg { width: 11px; height: 11px; stroke: #22c55e; }
    .app-ig-req__text {
      display: flex; flex-direction: column; gap: 2px;
    }
    .app-ig-req__text strong { font-size: 13px; color: #f3f4f6; font-weight: 600; line-height: 1.3; }
    .app-ig-req__text span { font-size: 11px; color: #6b7280; line-height: 1.3; }

    /* Instagram error modal */
    .app-modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 20px;
      animation: fadeIn 0.15s ease-out;
    }
    .app-modal {
      background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
      padding: 28px; max-width: 460px; width: 100%;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
      animation: modalSlideIn 0.2s ease-out;
    }
    @keyframes modalSlideIn {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .app-modal__icon {
      width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
    }
    .app-modal__icon--error { background: rgba(239,68,68,0.15); }
    .app-modal__icon--error svg { width: 24px; height: 24px; stroke: #f87171; }
    .app-modal__title { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 10px; }
    .app-modal__body { font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 20px; }
    .app-modal__steps { margin-bottom: 24px; }
    .app-modal__steps-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #6b7280; text-transform: uppercase; margin: 0 0 10px; }
    .app-modal__steps ol { padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .app-modal__steps ol li { font-size: 13px; color: #d1d5db; line-height: 1.5; }
    .app-modal__actions { display: flex; gap: 10px; }
    .app-modal__actions .btn { flex: 1; justify-content: center; }

    .app-action--niche-set {
      background: rgba(34,197,94,0.04); border-color: rgba(34,197,94,0.2);
    }
    .app-action__status--saved { color: #4ade80 !important; }

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
    .app-niche-check { width: 13px; height: 13px; margin-left: auto; flex-shrink: 0; stroke: #fbbf24; }
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
    .app-referral-card__hint { font-size: 14px; color: #9ca3af; margin: 0 0 16px; }

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

    /* Connected networks (Instagram + Facebook) */
    .connected-networks { margin: 0 0 16px; }
    .connected-network-row {
      display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
    }
    .connected-network-row strong { font-size: 13px; color: #fff; }
    .connected-networks__hint { font-size: 12px; color: #6b7280; margin: 6px 0 0; }
    .network-badge {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 11px; font-weight: 700; letter-spacing: .4px;
      padding: 3px 9px; border-radius: 6px;
    }
    .network-badge svg { width: 12px; height: 12px; flex-shrink: 0; }
    .network-badge--ig {
      background: rgba(225,48,108,.12); color: #e1306c; border: 1px solid rgba(225,48,108,.25);
    }
    .network-badge--fb {
      background: rgba(24,119,242,.12); color: #4e9af1; border: 1px solid rgba(24,119,242,.25);
    }

    /* Slot network selector */
    .slot-network-row {
      display: flex; align-items: center; gap: 6px; margin: 8px 0 0; flex-wrap: wrap;
    }
    .slot-network-label { font-size: 11px; color: #6b7280; font-weight: 600; margin-right: 2px; }
    .slot-net-wrapper { position: relative; }
    .slot-net-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 7px; font-size: 12px; font-weight: 600;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
      color: #9ca3af; cursor: pointer; transition: all .15s; white-space: nowrap;
    }
    .slot-net-btn:hover:not(:disabled):not(.slot-net-btn--locked) {
      border-color: rgba(255,255,255,.25); color: #fff;
    }
    .slot-net-btn--ig {
      background: rgba(225,48,108,.14); border-color: rgba(225,48,108,.45); color: #e1306c;
    }
    .slot-net-btn--fb {
      background: rgba(24,119,242,.14); border-color: rgba(24,119,242,.45); color: #4e9af1;
    }
    .slot-net-btn--both {
      background: rgba(251,191,36,.12); border-color: rgba(251,191,36,.45); color: #fbbf24;
    }
    .slot-net-btn--locked {
      opacity: .45; cursor: not-allowed;
    }
    .slot-net-lock { font-size: 10px; margin-left: 2px; }

    .btn--sm { padding: 7px 14px; font-size: 12px; }

    /* Analytics básico */
    .analytics-section { margin: 28px 0 0; }
    .analytics-section__title {
      font-size: 15px; font-weight: 700; color: #fff; margin: 0 0 14px;
    }
    .analytics-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;
    }
    .analytics-card {
      background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1rem;
      display: flex; flex-direction: column; gap: 0.35rem;
    }
    .analytics-card--skeleton { opacity: .5; }
    .analytics-card__label {
      font-size: 11px; color: #6b7280; text-transform: uppercase;
      letter-spacing: .05em; font-weight: 600;
    }
    .analytics-card__value { font-size: 1.6rem; font-weight: 800; color: #fff; line-height: 1; }
    .analytics-empty { color: #6b7280; font-size: .875rem; padding: .75rem 0; }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .skeleton {
      background: linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 75%);
      background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px;
    }

    /* Zona de perigo / apagar conta */
    .danger-zone {
      margin-top: 40px; padding: 24px; border-radius: 14px;
      border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.03);
    }
    .danger-zone__title { font-size: 15px; font-weight: 700; color: #f87171; margin: 0 0 8px; }
    .danger-zone__desc { font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 16px; }
    .danger-zone__toggle-btn {
      background: transparent; border: 1px solid rgba(239,68,68,0.3);
      color: #f87171; font-size: 13px; padding: 8px 18px; border-radius: 8px; cursor: pointer;
      transition: all 0.2s;
    }
    .danger-zone__toggle-btn:hover { background: rgba(239,68,68,0.08); }
    .delete-confirm {
      margin-top: 14px; display: flex; flex-direction: column; gap: 10px;
    }
    .delete-confirm__label { font-size: 13px; color: #9ca3af; margin: 0; }
    .delete-confirm__label strong { color: #fff; }
    .delete-confirm__input {
      padding: 8px 12px; border: 1px solid rgba(255,255,255,.1); border-radius: 8px;
      background: rgba(255,255,255,.04); color: #fff; font-size: 13px; max-width: 180px;
    }
    .btn--danger {
      background: #dc2626; color: #fff; border: none; padding: 9px 18px;
      border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 700;
      transition: opacity 0.15s; align-self: flex-start;
    }
    .btn--danger:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn--danger:hover:not(:disabled) { opacity: 0.85; }
  `]
})
export class ClientAppComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(ClientAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);

  client: ClientInfo | null = null;

  get firstName(): string {
    const fromProfile = (this.profile?.name || '').trim();
    const fromClient  = (this.client?.name  || '').trim();
    const full = fromProfile || fromClient;
    if (!full) return 'cliente';
    return full.split(' ')[0];
  }
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
  nicheSaved = false;
  igConnecting = false;
  igError: IgError | null = null;

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

  // Analytics básico
  analyticsSummary: {
    totalPosts: number; successRate: number;
    avgLikes: number; avgReach: number; avgComments: number; avgSaves: number;
  } | null = null;
  analyticsLoading = false;

  // Apagar conta
  showDeleteConfirm = false;
  deleteConfirmText = '';
  deletingAccount = false;

  // Toast notification
  nicheToast = '';
  private _nicheToastTimer: any;

  showNicheToast(msg: string): void {
    this.nicheToast = msg;
    clearTimeout(this._nicheToastTimer);
    this._nicheToastTimer = setTimeout(() => this.nicheToast = '', 4000);
  }

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

    // Always load full profile from API (includes imageStyle, brandContext, etc.)
    this.loadProfile();
    this.loadAnalytics();

    // After Instagram OAuth callback, handle success or error
    const igParam = this.route.snapshot.queryParamMap.get('ig');
    if (igParam === 'connected') {
      this.loadProfile();
    } else if (igParam === 'error') {
      const reason = this.route.snapshot.queryParamMap.get('ig_reason') || '';
      this.igError = this.translateIgError(reason);
    }
  }

  private translateIgError(reason: string): IgError {
    const r = (reason || '').toLowerCase();

    if (r.includes('no facebook pages') || r.includes('no facebook page')) {
      return {
        title: 'Pagina do Facebook nao autorizada',
        what: 'O Facebook nao retornou nenhuma Pagina com acesso liberado. Isso acontece quando: (1) durante o login voce nao autorizou acesso a sua Pagina, ou (2) sua Pagina ainda nao tem uma conta Instagram vinculada.',
        steps: [
          'Na sua Pagina do Facebook, va em Configuracoes → Contas vinculadas → Instagram',
          'Vincule sua conta Instagram Business ou Creator a Pagina',
          'Volte aqui e clique em "Conectar Instagram" novamente',
          'Na tela do Facebook, certifique-se de clicar em "Continuar como..." e confirmar o acesso a Pagina',
        ],
      };
    }

    if (r.includes('no linked instagram') || r.includes('no instagram') || r.includes('not_business') || r.includes('instagram_business_account')) {
      return {
        title: 'Instagram nao vinculado a Pagina do Facebook',
        what: 'Sua Pagina do Facebook foi encontrada, mas ela nao tem nenhuma conta Instagram Business vinculada. Sem essa vinculacao a publicacao automatica nao funciona.',
        steps: [
          'Na sua Pagina do Facebook, va em Configuracoes → Contas vinculadas → Instagram',
          'Clique em "Adicionar conta do Instagram" e faca o login',
          'Certifique-se que a conta Instagram e do tipo Business ou Creator (nao pessoal)',
          'Volte aqui e clique em "Conectar Instagram" novamente',
        ],
      };
    }

    if (r.includes('access_denied') || r.includes('user_cancelled') || r.includes('user_denied')) {
      return {
        title: 'Autorizacao negada',
        what: 'Voce cancelou ou negou as permissoes. A IA precisa de autorizacao para publicar no seu Instagram.',
        steps: [
          'Clique em "Conectar Instagram" novamente',
          'Na tela do Facebook, aceite TODAS as permissoes solicitadas',
          'Nao desmarque nenhuma permissao — todas sao necessarias para a publicacao automatica',
        ],
      };
    }

    if (r.includes('invalid_state') || r.includes('missing_code') || r.includes('expired')) {
      return {
        title: 'Sessao expirada',
        what: 'O tempo limite da autorizacao foi atingido ou a sessao ficou invalida.',
        steps: [
          'Clique em "Tentar novamente" abaixo',
          'Complete o processo sem demorar mais de 5 minutos',
        ],
      };
    }

    if (r.includes('permission') || r.includes('scope')) {
      return {
        title: 'Permissoes insuficientes',
        what: 'Algumas permissoes necessarias nao foram concedidas. Sem elas a IA nao consegue publicar.',
        steps: [
          'Clique em "Tentar novamente"',
          'Na tela do Facebook, nao desmarque nenhuma permissao',
          'Se o problema persistir, verifique se sua conta Instagram e do tipo Business ou Creator',
        ],
      };
    }

    // Generic fallback
    return {
      title: 'Erro ao conectar Instagram',
      what: reason ? `Detalhes: ${reason}` : 'Ocorreu um erro inesperado durante a autorizacao.',
      steps: [
        'Verifique se sua conta Instagram e do tipo Business ou Creator (nao pessoal)',
        'Verifique se sua conta Instagram esta vinculada a uma Pagina do Facebook',
        'Tente novamente. Se o erro persistir, entre em contato com o suporte.',
      ],
    };
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

  generatingCode = false;

  loadReferralStats(): void {
    if (!this.client) return;
    if (this.referralStats) return; // cached
    const headers = this.auth.authHeaders();
    this.http.get<ReferralStats>(`${environment.apiUrl}/api/v1/client/referral-stats`, { headers }).subscribe({
      next: (stats) => this.referralStats = stats,
      error: () => {
        // Fallback: build minimal stats from JWT token info
        this.referralStats = {
          referralCode: this.client?.referralCode || null,
          totalPaidReferrals: 0,
          creditMonths: 0,
          referralsToNextMonth: 4
        };
      }
    });
  }

  generateReferralCode(): void {
    if (this.generatingCode) return;
    this.generatingCode = true;
    const headers = this.auth.authHeaders();
    this.http.post<ReferralStats>(`${environment.apiUrl}/api/v1/client/referral-code/generate`, {}, { headers }).subscribe({
      next: (stats) => {
        this.referralStats = stats;
        this.generatingCode = false;
      },
      error: () => { this.generatingCode = false; }
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
    this.igError = null;
    const headers = this.auth.authHeaders();
    this.http.get<{ url: string }>(`${environment.apiUrl}/api/v1/client/instagram/oauth-url`, { headers }).subscribe({
      next: (res) => { window.location.href = res.url; },
      error: () => {
        this.igConnecting = false;
        this.igError = {
          title: 'Erro ao iniciar conexao',
          what: 'Nao foi possivel gerar o link de autorizacao. Verifique sua conexao e tente novamente.',
          steps: ['Atualize a pagina e tente conectar novamente', 'Se persistir, entre em contato com o suporte.'],
        };
      }
    });
  }

  loadProfile(): void {
    const headers = this.auth.authHeaders();
    this.http.get<ClientProfile>(`${environment.apiUrl}/api/v1/client/me`, { headers }).subscribe({
      next: (p) => {
        this.profile = p;
        // Persist the name back to the auth client so it survives reloads
        if (p?.name && (!this.client || this.client.name !== p.name)) {
          if (this.client) this.client = { ...this.client, name: p.name };
          this.auth.updateStoredClient({ name: p.name });
        }
      },
      error: () => {}
    });
  }

  loadAnalytics(): void {
    this.analyticsLoading = true;
    const headers = this.auth.authHeaders();
    this.http.get<any>(`${environment.apiUrl}/api/v1/client/analytics/summary`, { headers }).subscribe({
      next: (data) => { this.analyticsSummary = data; this.analyticsLoading = false; },
      error: () => { this.analyticsSummary = null; this.analyticsLoading = false; }
    });
  }

  deleteAccount(): void {
    if (this.deleteConfirmText.toLowerCase() !== 'apagar') return;
    this.deletingAccount = true;
    const headers = this.auth.authHeaders();
    this.http.delete(`${environment.apiUrl}/api/v1/client/account`, { headers }).subscribe({
      next: () => {
        this.auth.logout();
        window.location.href = '/';
      },
      error: () => {
        alert('Erro ao apagar conta. Tente novamente ou contate o suporte.');
        this.deletingAccount = false;
      }
    });
  }

  // ─── Brand context (now lives in /brand tab) ───────────
  brandContextDraft = '';
  logoUrlDraft = '';
  imageStyleDraft = '';
  brandContextSaving = false;
  brandContextError = '';
  confirmResetImageStyle = false;
  resettingImageStyle = false;

  get completionPercent(): number {
    if (!this.profile) return 0;
    let pct = 0;
    if (this.profile.selectedNiche) pct += 35;
    if (this.profile.instagramConnected) pct += 30;
    if (this.profile.brandContext && this.profile.brandContext.trim() &&
        this.profile.brandContext !== this.profile.brandContextHint) pct += 25;
    if (this.profile.logoUrl && this.profile.logoUrl.trim()) pct += 10;
    return Math.min(pct, 100);
  }

  openBrandTab(): void {
    this.tab = 'brand';
    this.brandContextError = '';
    this.confirmResetImageStyle = false;

    // Always fetch fresh data from the API to avoid stale-profile race conditions
    const headers = this.auth.authHeaders();
    this.http.get<ClientProfile>(`${environment.apiUrl}/api/v1/client/me`, { headers }).subscribe({
      next: (p) => {
        this.profile = { ...this.profile, ...p };
        this.brandContextDraft = (p.brandContext && p.brandContext.trim())
          ? p.brandContext
          : (p.brandContextHint || '');
        this.logoUrlDraft = p.logoUrl || '';
        this.imageStyleDraft = (p.imageStyle && p.imageStyle.trim())
          ? p.imageStyle
          : (p.imageStyleTemplateDefault || '');
      },
      error: () => {
        // Fallback to cached profile values if API call fails
        this.brandContextDraft = (this.profile?.brandContext && this.profile.brandContext.trim())
          ? this.profile.brandContext
          : (this.profile?.brandContextHint || '');
        this.logoUrlDraft = this.profile?.logoUrl || '';
        this.imageStyleDraft = (this.profile?.imageStyle && this.profile.imageStyle.trim())
          ? this.profile.imageStyle
          : (this.profile?.imageStyleTemplateDefault || '');
      }
    });
  }

  doResetImageStyle(): void {
    if (this.resettingImageStyle) return;
    this.resettingImageStyle = true;
    const headers = this.auth.authHeaders();
    this.http.post<{ ok: boolean; imageStyle: string }>(
      `${environment.apiUrl}/api/v1/client/image-style/reset`, {}, { headers }
    ).subscribe({
      next: (res) => {
        this.imageStyleDraft = res.imageStyle || (this.profile?.imageStyleTemplateDefault || '');
        if (this.profile) this.profile = { ...this.profile, imageStyle: this.imageStyleDraft };
        this.resettingImageStyle = false;
        this.confirmResetImageStyle = false;
        this.showNicheToast('Estilo visual restaurado para o padrão do nicho ✨');
      },
      error: () => {
        this.resettingImageStyle = false;
        this.brandContextError = 'Erro ao restaurar padrão. Tente novamente.';
      }
    });
  }

  openScheduleTab(): void {
    this.startPostConfigEdit();
    this.tab = 'schedule';
  }

  // ─── Post Config (publish settings with plan limits) ────────
  postConfigSaving = false;
  postConfigError = '';
  postConfigDraft: {
    postsPerDay: number;
    activeDays: string[];
    scheduleTimes: PostSlot[];
    negativeTopics: string;
    fixedHashtags: string;
    watermarkComment: string;
  } = {
    postsPerDay: 1, activeDays: [], scheduleTimes: [],
    negativeTopics: '', fixedHashtags: '', watermarkComment: '',
  };

  slotWarnings: Record<number, string> = {};

  readonly allDays = [
    { code: 'MON', label: 'Seg', fullLabel: 'Segunda' },
    { code: 'TUE', label: 'Ter', fullLabel: 'Terça' },
    { code: 'WED', label: 'Qua', fullLabel: 'Quarta' },
    { code: 'THU', label: 'Qui', fullLabel: 'Quinta' },
    { code: 'FRI', label: 'Sex', fullLabel: 'Sexta' },
    { code: 'SAT', label: 'Sáb', fullLabel: 'Sábado' },
    { code: 'SUN', label: 'Dom', fullLabel: 'Domingo' },
  ];

  get canCarousel(): boolean {
    const tier = (this.profile?.planTier ?? 'STARTER').toUpperCase();
    return tier === 'PRO' || tier === 'ENTERPRISE';
  }

  startPostConfigEdit(): void {
    this.postConfigDraft = {
      postsPerDay: this.profile?.maxPostsPerDay ?? 1,
      activeDays: [...(this.profile?.activeDays ?? ['MON','TUE','WED','THU','FRI'])],
      scheduleTimes: (this.profile?.scheduleTimes ?? []).map(s => ({
        ...s,
        // sanitize: if plan doesn't allow carousel, force SINGLE
        format: (!this.canCarousel && s.format === 'CAROUSEL') ? 'SINGLE' : s.format,
        // sanitize: if facebook not enabled on this plan, force instagram only
        networks: !this.profile?.facebookEnabled
          ? ['instagram']
          : (s.networks ?? ['instagram']),
      })),
      negativeTopics: this.profile?.negativeTopics ?? '',
      fixedHashtags: this.profile?.fixedHashtags ?? '',
      watermarkComment: this.profile?.watermarkComment ?? '',
    };
    this.postConfigError = '';
    this.recomputeSlotWarnings();
  }

  addSlot(): void {
    const defaultTopic = this.profile?.searchDescription || null;
    // Default: publish to both networks if facebook is enabled, else instagram only
    const defaultNetworks = this.profile?.facebookEnabled
      ? ['instagram', 'facebook']
      : ['instagram'];
    this.postConfigDraft.scheduleTimes.push({
      time: '09:00',
      dayOfWeek: 'MON',
      format: 'SINGLE',
      carouselCount: 3,
      publishStory: false,
      searchTopic: defaultTopic,
      networks: defaultNetworks,
    });
    this.recomputeSlotWarnings();
  }

  /** Returns which network key is "active" for the slot: 'instagram', 'facebook', or 'both' */
  slotHasNetwork(slot: PostSlot, key: 'instagram' | 'facebook' | 'both'): boolean {
    const nets = slot.networks ?? ['instagram'];
    if (key === 'both') return nets.includes('instagram') && nets.includes('facebook');
    if (key === 'instagram') return nets.includes('instagram') && !nets.includes('facebook');
    if (key === 'facebook') return nets.includes('facebook') && !nets.includes('instagram');
    return false;
  }

  /** Toggle/set the network selection for a slot */
  setSlotNetwork(slot: PostSlot, key: 'instagram' | 'facebook' | 'both'): void {
    if (key === 'instagram') slot.networks = ['instagram'];
    else if (key === 'facebook') slot.networks = ['facebook'];
    else slot.networks = ['instagram', 'facebook'];
  }

  removeSlot(idx: number): void {
    this.postConfigDraft.scheduleTimes.splice(idx, 1);
    this.recomputeSlotWarnings();
  }

  recomputeSlotWarnings(): void {
    const max = this.profile?.maxPostsPerDay ?? 1;
    this.slotWarnings = {};
    const counts: Record<string, number> = {};
    this.postConfigDraft.scheduleTimes.forEach((s, i) => {
      counts[s.dayOfWeek] = (counts[s.dayOfWeek] || 0) + 1;
      if (counts[s.dayOfWeek] > max) {
        this.slotWarnings[i] = `Excede o limite de ${max} post(s) por dia do seu plano (${this.profile?.planTier}).`;
      }
    });
  }

  savePostConfig(): void {
    if (this.postConfigSaving) return;
    this.recomputeSlotWarnings();
    if (Object.keys(this.slotWarnings).length > 0) {
      this.postConfigError = 'Resolva os horários em conflito antes de salvar.';
      return;
    }
    // Derive activeDays from the slots themselves
    const usedDays = new Set(this.postConfigDraft.scheduleTimes.map(s => s.dayOfWeek));
    this.postConfigDraft.activeDays = Array.from(usedDays);

    this.postConfigSaving = true;
    this.postConfigError = '';
    const headers = this.auth.authHeaders();
    this.http.put(`${environment.apiUrl}/api/v1/client/post-config`,
      this.postConfigDraft,
      { headers }
    ).subscribe({
      next: () => {
        this.postConfigSaving = false;
        if (this.profile) {
          this.profile = { ...this.profile, ...this.postConfigDraft };
        }
        this.showNicheToast('Agenda salva! 📅');
        this.tab = 'overview';
      },
      error: (err) => {
        this.postConfigSaving = false;
        this.postConfigError = err?.error?.detail || 'Erro ao salvar configuração.';
      }
    });
  }

  saveBrandContext(): void {
    if (this.brandContextSaving) return;
    const text = this.brandContextDraft.trim();
    if (!text) return;
    this.brandContextSaving = true;
    this.brandContextError = '';
    const headers = this.auth.authHeaders();
    const imgStyle = (this.imageStyleDraft || '').trim();

    // Save brand context first; if image_style differs from server, save that too
    const tasks: Promise<any>[] = [];
    tasks.push(this.http.put(`${environment.apiUrl}/api/v1/client/brand-context`,
      { brandContext: text, logoUrl: this.logoUrlDraft.trim() || null },
      { headers }).toPromise());
    if (imgStyle && imgStyle !== (this.profile?.imageStyle || '')) {
      tasks.push(this.http.put(`${environment.apiUrl}/api/v1/client/image-style`,
        { imageStyle: imgStyle }, { headers }).toPromise());
    }

    Promise.all(tasks).then(() => {
      this.brandContextSaving = false;
      if (this.profile) {
        this.profile = {
          ...this.profile,
          brandContext: text,
          logoUrl: this.logoUrlDraft.trim() || this.profile.logoUrl,
          imageStyle: imgStyle || this.profile.imageStyle,
          brandContextNeedsAttention: false,
        };
      }
      this.showNicheToast('Perfil da marca salvo! ✨ Os próximos posts vão ficar com a sua cara.');
      this.tab = 'overview';
    }).catch((err: any) => {
      this.brandContextSaving = false;
      this.brandContextError = err?.error?.detail || 'Erro ao salvar. Tente novamente.';
    });
  }

  selectNiche(niche: string): void {
    if (this.nicheLoading) return;
    this.nicheLoading = true;
    this.nicheError = '';
    const headers = this.auth.authHeaders();
    this.http.post<{ niche: string; templateApplied: boolean }>(`${environment.apiUrl}/api/v1/client/niche`, { niche }, { headers }).subscribe({
      next: (res) => {
        this.nicheLoading = false;
        this.showNichePicker = false;
        this.nicheSaved = true;
        if (this.profile) this.profile = { ...this.profile, selectedNiche: res.niche };
        if (this.client) this.client = { ...this.client, selectedNiche: res.niche };
        this.auth.updateStoredClient({ selectedNiche: res.niche });
        setTimeout(() => this.nicheSaved = false, 3000);
        if (res.templateApplied) {
          this.showNicheToast('Configuração padrão para este nicho foi aplicada ✓');
        }
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
