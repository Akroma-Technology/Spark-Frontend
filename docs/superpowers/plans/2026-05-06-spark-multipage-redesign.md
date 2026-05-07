# Spark Multipage Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestruturar o site do Spark de landing page única para 4 subpáginas Angular com rotas próprias (`/`, `/como-funciona`, `/recursos`, `/planos`), reorganizar o conteúdo por página e melhorar os textos comerciais.

**Architecture:** Rotas Angular standalone com lazy loading. Cada página é um componente self-contained. O topbar passa de âncoras + scroll-spy para `routerLink` + `routerLinkActive`. Dados compartilhados entre páginas (NICHES, Plan[]) são extraídos para arquivos `.data.ts` dedicados.

**Tech Stack:** Angular 19 standalone, SSR (app.config.server.ts), SeoService, httpx para fetch de preços, Pillow/PIL não relevante aqui.

**Spec:** `docs/superpowers/specs/2026-05-06-spark-multipage-redesign.md`

---

## File Map

### Criar
| Arquivo | Responsabilidade |
|---|---|
| `src/app/landing/niches.data.ts` | Array `NICHES: NicheInfo[]` e interface — extraído de spark.component.ts |
| `src/app/landing/plans.data.ts` | Interface `Plan`, array `SPARK_PLANS`, e `annualPerMonth()` — extraído de spark.component.ts |
| `src/app/landing/como-funciona.component.ts` | Página `/como-funciona`: mini hero + 4 passos expandidos + soluções por nicho + CTA |
| `src/app/landing/recursos.component.ts` | Página `/recursos`: mini hero + features grid + CTA |
| `src/app/landing/planos.component.ts` | Página `/planos`: mini hero + pricing + referral + CTA |

### Modificar
| Arquivo | O que muda |
|---|---|
| `src/app/landing/spark.component.ts` | Renomeia classe para `SparkHomeComponent`; remove niches section, features section, referral section; adiciona teaser "como funciona", bloco "Spark by Akroma", atualiza copy; importa NICHES de niches.data.ts |
| `src/app/shared/components/topbar/topbar.component.ts` | Troca âncoras por routerLink, remove scroll-spy (IntersectionObserver, activeId), adiciona exact:true no link Início |
| `src/app/app.routes.ts` | Adiciona 3 novas rotas **antes** de `{ path: ':niche' }` |

---

## Task 1: Extrair dados compartilhados para arquivos .data.ts

**Files:**
- Create: `src/app/landing/niches.data.ts`
- Create: `src/app/landing/plans.data.ts`

- [ ] **1.1 — Criar niches.data.ts**

Extrair a interface `NicheInfo` e o array `NICHES` do topo de `spark.component.ts` para um arquivo dedicado:

```typescript
// src/app/landing/niches.data.ts

export interface NicheInfo {
  value: string;
  label: string;
  title: string;
  subtitle: string;
  benefits: string[];
  stats: { num: string; label: string }[];
}

export const NICHES: NicheInfo[] = [
  {
    value: 'fitness',
    label: 'Fitness / Academia',
    title: 'Automação de Instagram para Academias e Personal Trainers',
    subtitle: 'Posts diários com IA sobre treino, nutrição e motivação — sem você precisar criar nada.',
    benefits: [
      'Conteúdo sobre exercícios, nutrição e lifestyle fitness gerado automaticamente',
      'Imagens profissionais de treino adaptadas ao estilo da sua marca',
      'Hashtags otimizadas para o nicho fitness (#treino #gym #saude)',
      'Posts nos melhores horários para engajamento de alunos'
    ],
    stats: [
      { num: '+180%', label: 'Engajamento médio' },
      { num: '30', label: 'Posts/mês sem esforço' },
      { num: '2h/dia', label: 'Tempo economizado' }
    ]
  },
  {
    value: 'tecnologia',
    label: 'Tecnologia',
    title: 'Social Media com IA para Empresas de Tecnologia',
    subtitle: 'A IA pesquisa as últimas tendências tech e publica conteúdo relevante todos os dias.',
    benefits: [
      'Acompanha tendências de IA, cloud, dev e startups em tempo real',
      'Legendas técnicas com linguagem acessível para seu público',
      'Carrosseis explicativos sobre conceitos complexos',
      'Hashtags otimizadas para tech (#tecnologia #inovação #dev)'
    ],
    stats: [
      { num: '+210%', label: 'Alcance orgânico' },
      { num: '24/7', label: 'Monitoramento de trends' },
      { num: '98%', label: 'Taxa de publicação' }
    ]
  },
  {
    value: 'gastronomia',
    label: 'Gastronomia',
    title: 'Automação de Instagram para Restaurantes e Chefs',
    subtitle: 'Conteúdo gourmet publicado diariamente — receitas, dicas e trends culinárias.',
    benefits: [
      'Posts sobre receitas, ingredientes da estação e técnicas culinárias',
      'Imagens apetitosas geradas por IA no estilo food photography',
      'Conteúdo adaptado para delivery, restaurante ou chef pessoal',
      'Hashtags de gastronomia otimizadas por região'
    ],
    stats: [
      { num: '+165%', label: 'Engajamento em 60 dias' },
      { num: '12', label: 'Temas por semana' },
      { num: '3x', label: 'Mais salvamentos' }
    ]
  },
  {
    value: 'moda',
    label: 'Moda',
    title: 'Instagram no Piloto Automático para Marcas de Moda',
    subtitle: 'Tendências de moda, looks e styling publicados diariamente com IA.',
    benefits: [
      'Conteúdo sobre tendências, cores da temporada e styling tips',
      'Imagens de moda geradas com estética profissional',
      'Carrosseis de looks e combinações automáticos',
      'Hashtags segmentadas por nicho (#moda #fashion #estilo)'
    ],
    stats: [
      { num: '+190%', label: 'Crescimento de seguidores' },
      { num: '7/7', label: 'Posts por semana' },
      { num: '4x', label: 'Mais interações' }
    ]
  },
  {
    value: 'juridico',
    label: 'Jurídico',
    title: 'Marketing Jurídico com IA — Posts Diários para Advogados',
    subtitle: 'Conteúdo informativo sobre direito publicado todo dia, respeitando a ética da OAB.',
    benefits: [
      'Posts sobre direitos do consumidor, trabalhista, tributário e mais',
      'Tom educativo e informativo (sem captação direta)',
      'Carrosseis explicativos sobre leis e direitos',
      'Linguagem acessível para leigos'
    ],
    stats: [
      { num: '+140%', label: 'Engajamento orgânico' },
      { num: '100%', label: 'Compliance OAB' },
      { num: '5x', label: 'Mais consultas via DM' }
    ]
  },
  {
    value: 'imobiliario',
    label: 'Imobiliário',
    title: 'Automação de Instagram para Corretores de Imóveis',
    subtitle: 'Posts sobre mercado imobiliário, dicas de compra e investimento — todo dia, automático.',
    benefits: [
      'Conteúdo sobre mercado, financiamento, decoração e investimento',
      'Imagens de imóveis e ambientes geradas por IA',
      'Posts educativos que atraem leads qualificados',
      'Hashtags geolocalizadas por cidade e bairro'
    ],
    stats: [
      { num: '2.3', label: 'Leads/semana em média' },
      { num: '+175%', label: 'Alcance orgânico' },
      { num: '40 dias', label: 'Para primeiro lead' }
    ]
  },
  {
    value: 'educacao',
    label: 'Educação',
    title: 'Social Media com IA para Escolas e Cursos',
    subtitle: 'Conteúdo educacional publicado diariamente — dicas de estudo, curiosidades e motivação.',
    benefits: [
      'Posts sobre aprendizado, produtividade e curiosidades educacionais',
      'Carrosseis didáticos que simplificam conceitos complexos',
      'Conteúdo adaptado para escola, faculdade ou curso online',
      'Hashtags de educação otimizadas'
    ],
    stats: [
      { num: '+155%', label: 'Engajamento de alunos' },
      { num: '30', label: 'Posts educativos/mês' },
      { num: '2x', label: 'Mais matrículas' }
    ]
  },
  {
    value: 'saude',
    label: 'Saúde',
    title: 'Automação de Instagram para Clínicas e Profissionais de Saúde',
    subtitle: 'Conteúdo informativo sobre saúde e bem-estar publicado todo dia com IA.',
    benefits: [
      'Posts sobre prevenção, saúde mental, nutrição e qualidade de vida',
      'Tom profissional e acolhedor, sem promessas médicas',
      'Carrosseis educativos sobre condições e tratamentos',
      'Hashtags de saúde segmentadas por especialidade'
    ],
    stats: [
      { num: '+160%', label: 'Engajamento em 90 dias' },
      { num: '3x', label: 'Mais agendamentos' },
      { num: '98%', label: 'Conteúdo aprovado' }
    ]
  }
];
```

- [ ] **1.2 — Criar plans.data.ts**

```typescript
// src/app/landing/plans.data.ts

export interface Plan {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  monthly: number;
  prefix?: string;
  featured: boolean;
  features: string[];
  ctaLabel: string;
  ctaRoute: string;
}

export const SPARK_PLANS: Plan[] = [
  {
    id: 'starter', name: 'Starter', monthly: 297, featured: false,
    features: [
      '1 perfil (Instagram)',
      '1 post por dia',
      'Imagens com IA',
      'Analytics básico',
      'Templates de nicho',
    ],
    ctaLabel: 'Teste grátis 7 dias', ctaRoute: '/cadastro',
  },
  {
    id: 'pro', name: 'Pro', monthly: 497, featured: true,
    features: [
      '3 redes (IG + FB + LinkedIn)',
      '2 posts por dia',
      'Carrosseis com IA',
      'Analytics completo + Score',
      'A/B Testing de conteúdo',
      'Renovação de tokens',
    ],
    ctaLabel: 'Teste grátis 7 dias', ctaRoute: '/cadastro',
  },
  {
    id: 'enterprise', name: 'Enterprise', monthly: 997, featured: false,
    prefix: 'A partir de',
    features: [
      'Tudo do Pro',
      'Posts ilimitados',
      'Relatório semanal + mensal',
      'Suporte prioritário',
      'Portal do cliente',
      'Gerente dedicado',
    ],
    ctaLabel: 'Falar com time de vendas', ctaRoute: '/contato',
  },
];

/** Annual = 10x monthly spread across 12 months. */
export function annualPerMonth(monthly: number): number {
  return Math.round((monthly * 10) / 12);
}
```

- [ ] **1.3 — Commit**

```bash
git add src/app/landing/niches.data.ts src/app/landing/plans.data.ts
git commit -m "refactor: extract NICHES and Plan data to dedicated data files"
```

---

## Task 2: Atualizar app.routes.ts

**Files:**
- Modify: `src/app/app.routes.ts`

- [ ] **2.1 — Adicionar as 3 novas rotas ANTES de `{ path: ':niche' }`**

Substituir o conteúdo de `src/app/app.routes.ts` pelo seguinte. Atenção: as novas rotas devem vir **antes** de `{ path: ':niche' }` para evitar que o wildcard as intercepte:

```typescript
import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ClientAuthService } from './core/services/client-auth.service';

const clientAuthGuard = () => {
  const auth = inject(ClientAuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/entrar']);
  return false;
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/spark.component').then(m => m.SparkHomeComponent)
  },
  {
    path: 'como-funciona',
    loadComponent: () => import('./landing/como-funciona.component').then(m => m.ComoFuncionaComponent)
  },
  {
    path: 'recursos',
    loadComponent: () => import('./landing/recursos.component').then(m => m.RecursosComponent)
  },
  {
    path: 'planos',
    loadComponent: () => import('./landing/planos.component').then(m => m.PlanosComponent)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./cadastro/cadastro.component').then(m => m.CadastroComponent)
  },
  {
    path: 'entrar',
    loadComponent: () => import('./entrar/entrar.component').then(m => m.EntrarComponent)
  },
  {
    path: 'app',
    loadComponent: () => import('./app-dashboard/client-app.component').then(m => m.ClientAppComponent),
    canActivate: [clientAuthGuard]
  },
  {
    path: 'portal/:token',
    loadComponent: () => import('./portal/client-portal.component').then(m => m.ClientPortalComponent)
  },
  {
    path: 'oauth-callback',
    loadComponent: () => import('./oauth-callback/oauth-callback.component').then(m => m.OAuthCallbackComponent)
  },
  {
    path: 'contato',
    loadComponent: () => import('./contato/contato.component').then(m => m.ContatoComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  // Niche pages — single-segment wildcard. Named routes above must come first.
  {
    path: ':niche',
    loadComponent: () => import('./landing/spark-niche.component').then(m => m.SparkNicheComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
```

- [ ] **2.2 — Criar stubs mínimos para as 3 novas rotas (compilação não quebrar)**

Antes de fazer o build, os 3 arquivos precisam existir. Criar cada um como stub mínimo válido (será substituído em tasks seguintes):

`src/app/landing/como-funciona.component.ts`:
```typescript
import { Component } from '@angular/core';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';
import { SparkFooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-como-funciona',
  standalone: true,
  imports: [SparkTopbarComponent, SparkFooterComponent],
  template: `<app-spark-topbar></app-spark-topbar><main style="min-height:100vh"></main><app-spark-footer></app-spark-footer>`
})
export class ComoFuncionaComponent {}
```

`src/app/landing/recursos.component.ts`:
```typescript
import { Component } from '@angular/core';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';
import { SparkFooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [SparkTopbarComponent, SparkFooterComponent],
  template: `<app-spark-topbar></app-spark-topbar><main style="min-height:100vh"></main><app-spark-footer></app-spark-footer>`
})
export class RecursosComponent {}
```

`src/app/landing/planos.component.ts`:
```typescript
import { Component } from '@angular/core';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';
import { SparkFooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-planos',
  standalone: true,
  imports: [SparkTopbarComponent, SparkFooterComponent],
  template: `<app-spark-topbar></app-spark-topbar><main style="min-height:100vh"></main><app-spark-footer></app-spark-footer>`
})
export class PlanosComponent {}
```

- [ ] **2.3 — Verificar build**

```bash
cd "C:/desenvolvimento/Akroma/Akroma Site/Spark-Frontend"
npx ng build --configuration=development 2>&1 | tail -20
```

Esperado: build sem erros (pode ter warnings de bundle size — ok).

- [ ] **2.4 — Commit**

```bash
git add src/app/app.routes.ts src/app/landing/como-funciona.component.ts src/app/landing/recursos.component.ts src/app/landing/planos.component.ts
git commit -m "feat: add routes for /como-funciona, /recursos, /planos with stub components"
```

---

## Task 3: Atualizar o Topbar

**Files:**
- Modify: `src/app/shared/components/topbar/topbar.component.ts`

O topbar atual usa âncoras (`href="/#como-funciona"`) e um `IntersectionObserver` para scroll-spy. Tudo isso é removido e substituído por `routerLink` + `routerLinkActive`.

- [ ] **3.1 — Substituir o template e a classe do topbar**

Substituir o arquivo inteiro por:

```typescript
import {
  Component, DestroyRef, ElementRef, Inject,
  AfterViewInit, OnDestroy, PLATFORM_ID, inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-spark-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar" [class.topbar--scrolled]="scrolled">
      <div class="topbar__inner">
        <a routerLink="/" class="topbar__brand" aria-label="Akroma Spark — inicio" (click)="closeDrawer()">
          <img src="assets/icone-akroma.png" alt="" class="topbar__logo" aria-hidden="true">
          <span class="topbar__name">Akroma <span class="topbar__accent">Spark</span></span>
        </a>

        <nav class="topbar__nav" aria-label="Navegacao principal">
          <a routerLink="/"
             routerLinkActive="topbar__link--active"
             [routerLinkActiveOptions]="{exact: true}"
             class="topbar__link">Início</a>
          <a routerLink="/como-funciona"
             routerLinkActive="topbar__link--active"
             class="topbar__link">Como funciona</a>
          <a routerLink="/recursos"
             routerLinkActive="topbar__link--active"
             class="topbar__link">Recursos</a>
          <a routerLink="/planos"
             routerLinkActive="topbar__link--active"
             class="topbar__link">Planos</a>
        </nav>

        <div class="topbar__actions">
          <a routerLink="/entrar" class="topbar__login">Entrar</a>
          <a routerLink="/cadastro" class="topbar__cta">Teste grátis</a>
        </div>

        <button type="button"
                class="topbar__burger"
                [class.topbar__burger--open]="drawerOpen"
                aria-label="Abrir menu"
                [attr.aria-expanded]="drawerOpen"
                (click)="toggleDrawer()">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <!-- Mobile drawer -->
    <div class="drawer"
         [class.drawer--open]="drawerOpen"
         role="dialog"
         aria-modal="true"
         aria-label="Menu"
         (click)="closeDrawer()">
      <div class="drawer__panel" (click)="$event.stopPropagation()">
        <a routerLink="/" routerLinkActive="drawer__link--active" [routerLinkActiveOptions]="{exact: true}"
           class="drawer__link" (click)="closeDrawer()">Início</a>
        <a routerLink="/como-funciona" routerLinkActive="drawer__link--active"
           class="drawer__link" (click)="closeDrawer()">Como funciona</a>
        <a routerLink="/recursos" routerLinkActive="drawer__link--active"
           class="drawer__link" (click)="closeDrawer()">Recursos</a>
        <a routerLink="/planos" routerLinkActive="drawer__link--active"
           class="drawer__link" (click)="closeDrawer()">Planos</a>
        <div class="drawer__divider"></div>
        <a routerLink="/entrar" class="drawer__link drawer__link--muted" (click)="closeDrawer()">Entrar</a>
        <a routerLink="/cadastro" class="drawer__cta" (click)="closeDrawer()">Teste grátis 7 dias &rarr;</a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* ── Top bar ───────────────────────────────────────────────────────── */
    .topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      height: 72px;
      background: rgba(5, 8, 16, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      transition: background 0.2s, border-color 0.2s;
    }
    .topbar--scrolled {
      background: rgba(5, 8, 16, 0.95);
      border-bottom-color: rgba(251,191,36,0.2);
    }
    .topbar__inner {
      max-width: 1200px; height: 100%; margin: 0 auto;
      padding: 0 24px;
      display: flex; align-items: center;
      position: relative;
    }
    .topbar__brand {
      display: inline-flex; align-items: center; gap: 12px;
      text-decoration: none; color: #fff;
      transition: opacity 0.2s;
    }
    .topbar__brand:hover { opacity: 0.85; }
    .topbar__logo {
      height: 40px; width: auto;
      filter: brightness(0) saturate(100%) invert(76%) sepia(43%) saturate(1100%) hue-rotate(358deg) brightness(101%) contrast(99%);
    }
    .topbar__name {
      font-size: 18px; font-weight: 700; letter-spacing: -0.01em;
    }
    .topbar__accent {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .topbar__nav {
      position: absolute; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 28px;
    }
    .topbar__actions {
      margin-left: auto;
      display: flex; align-items: center; gap: 8px;
    }
    .topbar__link {
      position: relative;
      color: #9ca3af; font-size: 14px; font-weight: 500;
      text-decoration: none; padding: 6px 0;
      transition: color 0.15s;
    }
    .topbar__link::after {
      content: ''; position: absolute;
      left: 0; right: 0; bottom: -4px; height: 2px;
      background: #fbbf24;
      transform: scaleX(0); transform-origin: center;
      transition: transform 0.25s;
      border-radius: 2px;
    }
    .topbar__link:hover { color: #fff; }
    .topbar__link--active {
      color: #fbbf24;
    }
    .topbar__link--active::after {
      transform: scaleX(1);
    }
    .topbar__login {
      color: #d1d5db; font-size: 14px; font-weight: 600;
      padding: 8px 14px; border-radius: 8px;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .topbar__login:hover { background: rgba(255,255,255,0.06); color: #fff; }
    .topbar__cta {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #000; font-size: 14px; font-weight: 700;
      padding: 10px 18px; border-radius: 10px;
      text-decoration: none;
      border: 1px solid rgba(251,191,36,0.4);
      box-shadow: 0 4px 14px -4px rgba(245,158,11,0.35);
      transition: filter 0.15s, transform 0.15s;
    }
    .topbar__cta:hover { filter: brightness(1.08); transform: translateY(-1px); }

    /* ── Burger (mobile) ───────────────────────────────────────────────── */
    .topbar__burger {
      display: none;
      width: 40px; height: 40px;
      background: none; border: none;
      flex-direction: column; justify-content: center; align-items: center;
      gap: 5px; cursor: pointer; padding: 0;
    }
    .topbar__burger span {
      display: block; width: 22px; height: 2px;
      background: #fff; border-radius: 2px;
      transition: transform 0.25s, opacity 0.2s;
    }
    .topbar__burger--open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .topbar__burger--open span:nth-child(2) { opacity: 0; }
    .topbar__burger--open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    @media (max-width: 820px) {
      .topbar__nav { display: none; }
      .topbar__actions { display: none; }
      .topbar__burger { display: flex; }
    }

    /* ── Drawer ────────────────────────────────────────────────────────── */
    .drawer {
      position: fixed; inset: 0; z-index: 49;
      background: rgba(5, 6, 12, 0);
      pointer-events: none;
      transition: background 0.25s;
    }
    .drawer--open {
      background: rgba(5, 6, 12, 0.7);
      pointer-events: auto;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    .drawer__panel {
      position: absolute; top: 72px; left: 0; right: 0;
      padding: 24px;
      background: #050810;
      border-bottom: 1px solid rgba(251,191,36,0.15);
      display: flex; flex-direction: column; gap: 4px;
      transform: translateY(-12px);
      opacity: 0;
      transition: transform 0.25s, opacity 0.2s;
    }
    .drawer--open .drawer__panel {
      transform: translateY(0);
      opacity: 1;
    }
    .drawer__link {
      display: block;
      padding: 14px 8px;
      color: #e5e7eb; font-size: 17px; font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      transition: background 0.15s, color 0.15s;
    }
    .drawer__link:hover { background: rgba(255,255,255,0.04); }
    .drawer__link--active { color: #fbbf24; }
    .drawer__link--muted { color: #9ca3af; font-weight: 500; }
    .drawer__divider {
      height: 1px; background: rgba(255,255,255,0.06); margin: 8px 0;
    }
    .drawer__cta {
      margin-top: 8px;
      display: block; text-align: center;
      padding: 14px 18px; border-radius: 10px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #000; font-size: 15px; font-weight: 700;
      text-decoration: none;
      border: 1px solid rgba(251,191,36,0.4);
    }
  `]
})
export class SparkTopbarComponent implements AfterViewInit, OnDestroy {
  scrolled = false;
  drawerOpen = false;

  private onScroll = () => { this.scrolled = window.scrollY > 20; };
  private onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') this.closeDrawer(); };

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private host: ElementRef<HTMLElement>,
    private router: Router,
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.closeDrawer());
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('keydown', this.onKey);
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('keydown', this.onKey);
  }

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
    this.lockBodyScroll(this.drawerOpen);
  }

  closeDrawer(): void {
    if (!this.drawerOpen) return;
    this.drawerOpen = false;
    this.lockBodyScroll(false);
  }

  private lockBodyScroll(locked: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.body.style.overflow = locked ? 'hidden' : '';
  }
}
```

- [ ] **3.2 — Verificar build**

```bash
cd "C:/desenvolvimento/Akroma/Akroma Site/Spark-Frontend"
npx ng build --configuration=development 2>&1 | tail -20
```

Esperado: build sem erros.

- [ ] **3.3 — Commit**

```bash
git add src/app/shared/components/topbar/topbar.component.ts
git commit -m "feat: topbar uses routerLink + routerLinkActive, remove scroll-spy"
```

---

## Task 4: Atualizar SparkComponent (Home)

**Files:**
- Modify: `src/app/landing/spark.component.ts`

Esta é a tarefa mais extensa. Mantenha o visual intacto — só muda estrutura de seções e copy.

Mudanças:
1. Importar `NICHES` e `NicheInfo` de `niches.data.ts` (remover definição inline)
2. Remover seção `<!-- FEATURES -->` do template
3. Remover seção `<!-- NICHES -->` do template
4. Remover seção `<!-- REFERRAL -->` do template
5. Na seção `<!-- COMO FUNCIONA -->`: adicionar botão "Ver como funciona em detalhes →" linkando para `/como-funciona`
6. Adicionar seção `<!-- SPARK BY AKROMA -->` após "Como funciona"
7. Atualizar copy do hero subtitle, trial note e CTA final
8. Remover estilos órfãos das seções removidas

- [ ] **4.1 — Renomear classe SparkComponent → SparkHomeComponent**

Em `spark.component.ts`, alterar a declaração da classe:

```typescript
// antes
export class SparkComponent implements OnInit, AfterViewInit, OnDestroy {

// depois
export class SparkHomeComponent implements OnInit, AfterViewInit, OnDestroy {
```

Em `app.routes.ts`, atualizar o import da rota `/`:

```typescript
// antes
loadComponent: () => import('./landing/spark.component').then(m => m.SparkComponent)

// depois
loadComponent: () => import('./landing/spark.component').then(m => m.SparkHomeComponent)
```

- [ ] **4.2 — Atualizar import de NICHES e remover definição inline**

No topo de `spark.component.ts`, remover a interface `NicheInfo` e o array `NICHES` (linhas 12–158) e substituir pelo import:

```typescript
import { NICHES, NicheInfo } from './niches.data';
```

- [ ] **4.3 — Atualizar o hero subtitle, trial note e subtexto abaixo dos CTAs**

Localizar no template:

```html
<p class="spark-hero__subtitle">
  IA que pesquisa tendências, cria legendas, gera imagens e publica — todo dia, sem esforço.
  Instagram, Facebook e LinkedIn com engajamento real.
</p>
```

Substituir por:

```html
<p class="spark-hero__subtitle">
  Enquanto você trabalha, a IA pesquisa, escreve e publica. Todo dia. No seu nome.
</p>
```

Localizar e substituir o trial note:

```html
<!-- antes -->
<p class="spark-hero__trial-note">Sem cartão de crédito. Cancele quando quiser.</p>

<!-- depois -->
<p class="spark-hero__trial-note">Sem cartão de crédito · Cancele quando quiser · Resultado em 24h</p>
```

Verificar se existe um parágrafo separado para "subtexto abaixo dos CTAs" (mencionado no spec como "Instagram, Facebook e LinkedIn. Sem cartão de crédito." abaixo dos botões do hero). Se existir como elemento separado do `trial-note`, atualizar para esse texto. Se o `trial-note` já cumpre essa função, o passo acima é suficiente.

- [ ] **4.4 — Remover seção FEATURES do template**

Remover o bloco completo da seção FEATURES (de `<!-- FEATURES -->` até o `</section>` que o fecha). É a seção com `.spark-features` e `.features-grid`.

- [ ] **4.5 — Remover seção NICHES do template**

Remover o bloco completo da seção NICHES (de `<!-- NICHES -->` / `id="solucoes"` até seu `</section>`).

- [ ] **4.6 — Remover seção REFERRAL do template**

Remover o bloco completo da seção REFERRAL (de `<!-- REFERRAL -->` até seu `</section>`).

- [ ] **4.7 — Adicionar link "Ver em detalhes" na seção Como funciona**

Na seção `<!-- COMO FUNCIONA -->`, após o `</div>` que fecha `.steps-grid`, adicionar antes do `</div>` do container:

```html
<div class="steps-more">
  <a routerLink="/como-funciona" class="btn btn--outline">
    Ver como funciona em detalhes &rarr;
  </a>
</div>
```

E o estilo correspondente (dentro do `styles` do componente):

```scss
.steps-more {
  text-align: center;
  margin-top: 40px;
}
```

- [ ] **4.8 — Adicionar bloco "Spark by Akroma" após a seção Como funciona**

Inserir antes da seção `<!-- CTA FINAL -->`:

```html
<!-- SPARK BY AKROMA -->
<section class="spark-akroma">
  <div class="container">
    <div class="spark-akroma__card">
      <div class="spark-akroma__logo-wrap">
        <img src="assets/icone-akroma.png" alt="Akroma" class="spark-akroma__logo" aria-hidden="true">
      </div>
      <div class="spark-akroma__content">
        <span class="label">SOBRE O PRODUTO</span>
        <h3 class="spark-akroma__title">Spark é um produto da Akroma</h3>
        <p class="spark-akroma__desc">
          Empresa brasileira de tecnologia para negócios. O Spark nasce da mesma missão:
          dar às PMEs as ferramentas que grandes empresas já têm — agora no social media.
        </p>
        <a href="https://akroma.com.br" target="_blank" rel="noopener" class="btn btn--outline btn--sm">
          Conheça a Akroma &rarr;
        </a>
      </div>
    </div>
  </div>
</section>
```

Estilos a adicionar no `styles` do componente:

```scss
/* Spark by Akroma */
.spark-akroma {
  padding: 60px 0;
  background: #050810;
}
.spark-akroma__card {
  display: flex; align-items: center; gap: 40px;
  padding: 40px 48px; border-radius: 20px;
  background: rgba(251,191,36,0.03);
  border: 1px solid rgba(251,191,36,0.15);
}
@media (max-width: 768px) {
  .spark-akroma__card { flex-direction: column; gap: 24px; padding: 32px 24px; text-align: center; }
}
.spark-akroma__logo-wrap {
  flex-shrink: 0;
  width: 72px; height: 72px; border-radius: 16px;
  background: rgba(251,191,36,0.08);
  border: 1px solid rgba(251,191,36,0.2);
  display: flex; align-items: center; justify-content: center;
}
.spark-akroma__logo {
  width: 44px; height: 44px;
  filter: brightness(0) saturate(100%) invert(76%) sepia(43%) saturate(1100%) hue-rotate(358deg) brightness(101%) contrast(99%);
}
.spark-akroma__title {
  font-size: 20px; font-weight: 700; color: #fff;
  margin: 8px 0 10px;
}
.spark-akroma__desc {
  font-size: 15px; color: #9ca3af; line-height: 1.65;
  margin-bottom: 20px; max-width: 520px;
}
.btn--sm {
  padding: 10px 18px; font-size: 13px;
}
```

- [ ] **4.9 — Atualizar CTA final**

Localizar:

```html
<p class="spark-cta__desc">Trial Starter de 7 dias gratis. Sem cartao. Sem compromisso.</p>
```

Substituir por:

```html
<p class="spark-cta__desc">7 dias grátis. Sem cartão. Se não gostar, cancela com um clique.</p>
```

- [ ] **4.10 — Remover estilos órfãos**

No bloco `styles` do componente, remover os blocos de estilos das seções removidas:
- `.spark-features`, `.features-grid`, `.feature-item`, `.feature-item__icon`, `.feature-item__title`, `.feature-item__desc`
- `.spark-niches`, `.niches-grid`, `.niche-card`, `.niche-detail` e todos os sub-seletores `.niche-detail__*`
- `.spark-referral`, `.spark-referral__card`, `.spark-referral__card-bg`, `.spark-referral__header`, `.spark-referral__title`, `.spark-referral__desc`, `.spark-referral__steps`, `.spark-referral__step`, `.spark-referral__step-arrow`, `.spark-referral__step-num`, `.spark-referral__step-content`

Também remover da classe TypeScript as propriedades e métodos usados apenas pelas seções removidas:
- `expandedNiche: string | null`
- `get activeNiche()`
- `toggleNiche()`
(O array `niches` ainda é usado pela demo interativa — **manter**.)

- [ ] **4.11 — Build e verificar**

```bash
cd "C:/desenvolvimento/Akroma/Akroma Site/Spark-Frontend"
npx ng build --configuration=development 2>&1 | tail -20
```

Esperado: sem erros.

- [ ] **4.12 — Commit**

```bash
git add src/app/landing/spark.component.ts
git commit -m "feat(home): remove niches/features/referral sections, add Akroma block, update copy"
```

---

## Task 5: Implementar ComoFuncionaComponent

**Files:**
- Modify: `src/app/landing/como-funciona.component.ts` (substituir stub)

Conteúdo: mini hero + 4 passos expandidos + soluções por nicho (movida da home) + CTA.

- [ ] **5.1 — Substituir o stub pelo componente completo**

```typescript
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
        <span class="label">COMO FUNCIONA</span>
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
    .niches-section { padding: 80px 0; background: linear-gradient(180deg, #050810 0%, #0d0b1e 100%); }
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
      background: linear-gradient(180deg, #050810 0%, #120b04 60%, #050810 100%);
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
```

- [ ] **5.2 — Build e verificar**

```bash
cd "C:/desenvolvimento/Akroma/Akroma Site/Spark-Frontend"
npx ng build --configuration=development 2>&1 | tail -20
```

- [ ] **5.3 — Commit**

```bash
git add src/app/landing/como-funciona.component.ts
git commit -m "feat: implement /como-funciona page with expanded steps and niche solutions"
```

---

## Task 6: Implementar RecursosComponent

**Files:**
- Modify: `src/app/landing/recursos.component.ts` (substituir stub)

- [ ] **6.1 — Substituir o stub pelo componente completo**

```typescript
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
        <span class="label">RECURSOS</span>
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
      background: linear-gradient(180deg, #050810 0%, #0d0b1e 100%);
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
      background: linear-gradient(180deg, #050810 0%, #120b04 60%, #050810 100%);
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
```

- [ ] **6.2 — Build e verificar**

```bash
cd "C:/desenvolvimento/Akroma/Akroma Site/Spark-Frontend"
npx ng build --configuration=development 2>&1 | tail -20
```

- [ ] **6.3 — Commit**

```bash
git add src/app/landing/recursos.component.ts
git commit -m "feat: implement /recursos page with features grid"
```

---

## Task 7: Implementar PlanosComponent

**Files:**
- Modify: `src/app/landing/planos.component.ts` (substituir stub)

Inclui: mini hero + billing toggle + pricing cards + referral + CTA.
A lógica de preços (Plan[], annual, annualPerMonth, fetch de API) é copiada diretamente do SparkComponent.

- [ ] **7.1 — Substituir o stub pelo componente completo**

```typescript
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
        <span class="label">PLANOS</span>
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
      background: linear-gradient(180deg, #050810 0%, #0d0b1e 100%);
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
      background: linear-gradient(180deg, #050810 0%, #120b04 60%, #050810 100%);
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
```

- [ ] **7.2 — Build final**

```bash
cd "C:/desenvolvimento/Akroma/Akroma Site/Spark-Frontend"
npx ng build --configuration=development 2>&1 | tail -30
```

Esperado: build sem erros. Verificar que não há referências a componentes ou imports faltando.

- [ ] **7.3 — Commit**

```bash
git add src/app/landing/planos.component.ts
git commit -m "feat: implement /planos page with pricing, referral and indication program"
```

---

## Task 8: Verificação final e ajuste do SparkComponent

**Files:**
- Modify: `src/app/landing/spark.component.ts` — remover Plan[] e lógica de planos (agora em PlanosComponent e plans.data.ts)

- [ ] **8.1 — Remover da classe SparkComponent**

Da classe `SparkComponent` em `spark.component.ts`, remover:
- A interface `Plan` (se ainda inline — agora em `plans.data.ts`)
- O array `plans: Plan[]`
- O método `annualPerMonth()`
- O boolean `annual`
- O bloco de fetch HTTP de preços do `ngOnInit`
- O import de `HttpClient` (se não for mais usado por nada)

Verificar que o import de `NICHES` de `niches.data.ts` está presente (task 4.1).

- [ ] **8.2 — Build final de produção**

```bash
cd "C:/desenvolvimento/Akroma/Akroma Site/Spark-Frontend"
npx ng build 2>&1 | tail -30
```

Esperado: build de produção sem erros. Warnings de bundle size são aceitáveis.

- [ ] **8.3 — Commit final**

```bash
git add src/app/landing/spark.component.ts
git commit -m "refactor(home): remove pricing logic now owned by PlanosComponent"
```

---

## Checklist de verificação manual (pós-build)

Abrir `http://localhost:4200` com `ng serve` e verificar:

- [ ] `/` — Hero com novo subtitle, trial note atualizado, seção "Como funciona" com botão "Ver em detalhes", bloco "Spark by Akroma" visível, CTA final com novo texto. Sem seção Recursos, Soluções ou Indicação.
- [ ] `/como-funciona` — Mini hero correto, 4 passos com textos expandidos, grid de nichos funcional (clique expande detail), CTA final.
- [ ] `/recursos` — Mini hero correto, 6 features em grid 3x2, CTA "Ver planos →".
- [ ] `/planos` — Mini hero correto, toggle anual/mensal funcional, 3 cards de preço, bloco de indicação, CTA final.
- [ ] Topbar: "Início" ativo só em `/`, outros links ativam ao navegar para suas respectivas páginas. Mobile drawer funciona.
- [ ] Niche page `/fitness` ainda funciona (não interceptada pelas novas rotas).
- [ ] `/404` e rotas desconhecidas ainda redirecionam para not-found.
