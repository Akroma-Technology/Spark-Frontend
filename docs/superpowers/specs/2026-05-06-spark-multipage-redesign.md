# Spark Site — Redesign Multi-página

**Data:** 2026-05-06
**Status:** Aprovado

---

## Contexto

O site atual do Spark (`spark.akroma.com.br`) é uma landing page única com todas as seções acessíveis via âncoras (`/#como-funciona`, `/#solucoes`, `/#demo`, `/#planos`). O problema: a navegação não reflete páginas reais, não há URL própria por tema (perde SEO por intent), e o conteúdo cresce misturado numa página muito longa.

O objetivo é reestruturar em subpáginas Angular com rotas próprias, reorganizar o conteúdo, melhorar os textos comerciais e adicionar o bloco de credibilidade "Spark by Akroma".

---

## Decisões de Arquitetura

### Abordagem escolhida: Rotas Angular standalone (Opção A)

Cada item do nav vira uma rota com componente próprio. O topbar passa de âncoras com scroll-spy para `routerLink` com `routerLinkActive`.

### Rotas

| Rota | Componente | Arquivo |
|---|---|---|
| `/` | `SparkHomeComponent` | `src/app/landing/home.component.ts` |
| `/como-funciona` | `ComoFuncionaComponent` | `src/app/landing/como-funciona.component.ts` |
| `/recursos` | `RecursosComponent` | `src/app/landing/recursos.component.ts` |
| `/planos` | `PlanosComponent` | `src/app/landing/planos.component.ts` |

O arquivo atual `src/app/landing/spark.component.ts` é renomeado para `home.component.ts`. A rota `/` no `app.routes.ts` é atualizada para apontar para `SparkHomeComponent`.

---

## Topbar

### Mudanças

- Saem: `href="/#como-funciona"` etc. (âncoras)
- Entram: `routerLink="/como-funciona"` etc.
- Sai: scroll-spy com `IntersectionObserver` (fazia sentido apenas com âncoras)
- Entra: `routerLinkActive="topbar__link--active"` para active state por rota
- A lógica de `activeId` e `observer` é removida do `SparkTopbarComponent`

### Links do nav (ordem)

```
Início (/),  Como funciona (/como-funciona),  Recursos (/recursos),  Planos (/planos)
```

Actions (sem mudança): `Entrar` → `/entrar` | `Teste grátis` → `/cadastro`

---

## Páginas

### `/` — Home

Seções (ordem):

1. **Hero** — layout idêntico ao atual, copy atualizada (ver seção Copy abaixo)
2. **Prova social** — sem mudança (4 números: posts, clientes, engajamento, taxa)
3. **Depoimentos** — sem mudança (3 cards)
4. **Demo interativa** — sem mudança (dropdown de nicho + mockup Instagram)
5. **Como funciona (teaser)** — os 4 step-cards compactos do atual, com botão extra "Ver como funciona em detalhes →" linkando para `/como-funciona`
6. **Spark by Akroma** *(novo)* — bloco de credibilidade (ver spec abaixo)
7. **CTA final** — copy atualizada

Seções **removidas** da home (movidas para subpáginas):
- Soluções por nicho → `/como-funciona`
- Programa de indicação → `/planos`
- Features grid (Recursos) → `/recursos`

### `/como-funciona`

Seções (ordem):

1. **Mini hero da página**
   - Label: `COMO FUNCIONA`
   - H1: "Veja como o Spark trabalha por você"
   - Subtítulo: "Da pesquisa de tendências à publicação — tudo automatizado. Entenda cada etapa."
   - Sem canvas 3D, sem CTA de cadastro (não é momento de converter ainda)

2. **Os 4 passos** — mesmos 4 step-cards do atual, mas com descrições expandidas (mais detalhe técnico sobre o que acontece em cada etapa)

3. **Soluções por nicho** — seção movida integralmente da home (niche-grid + niche-detail accordion + CTA por nicho)

4. **CTA final da página**
   - H2: "Pronto para ver na prática?"
   - Subtexto: "7 dias grátis. Sem cartão. Cancela quando quiser."
   - Botão: "Começar agora →" → `/cadastro`

### `/recursos`

Seções (ordem):

1. **Mini hero da página**
   - Label: `RECURSOS`
   - H1: "Tudo que você precisa para crescer no automático"
   - Subtítulo: "Cada funcionalidade do Spark foi pensada para eliminar o trabalho manual do social media."

2. **Features grid** — os 6 feature-items do atual (Posts diários com IA, Analytics, Imagens e carrosseis, Agendamento, Templates de nicho, Renovação automática)

3. **CTA final da página**
   - H2: "Escolha o plano certo para você"
   - Botão: "Ver planos →" → `/planos`

### `/planos`

Seções (ordem):

1. **Mini hero da página**
   - Label: `PLANOS`
   - H1: "Planos simples. Resultado real."
   - Subtítulo: "Comece grátis por 7 dias. Sem cartão de crédito. Cancele quando quiser."

2. **Billing toggle + pricing cards** — idêntico ao atual (mensal/anual, 3 cards: Starter/Pro/Enterprise)

3. **Programa de Indicação** — bloco movido integralmente da home ("Indique 4 amigos, ganhe 1 mês grátis")

4. **CTA final da página**
   - H2: "Comece hoje, veja resultado essa semana"
   - Botão: "Teste grátis 7 dias →" → `/cadastro`

---

## Bloco "Spark by Akroma" (novo — na home)

### Objetivo
Reforçar credibilidade: Spark não é um produto anônimo de startup desconhecida, é um produto de uma empresa brasileira estabelecida.

### Layout
Layout de duas colunas: ícone/logo da Akroma à esquerda, texto à direita. Fundo com borda dourada sutil (mesmo padrão visual do bloco de indicação atual). Posicionado após a seção "Como funciona (teaser)" e antes do CTA final.

### Conteúdo

```
[ícone Akroma — filtro amarelo, mesmo do topbar]
Spark é um produto da Akroma
Empresa brasileira de tecnologia para negócios.
O Spark nasce da mesma missão: dar às PMEs as ferramentas
que grandes empresas já têm — agora no social media.

[→ Conheça a Akroma]  (href="https://akroma.com.br" target="_blank" rel="noopener")
```

### CSS
- `background: rgba(251,191,36,0.03)` + `border: 1px solid rgba(251,191,36,0.15)`
- Logo: `filter: brightness(0) saturate(100%) invert(76%) sepia(43%) saturate(1100%) hue-rotate(358deg) brightness(101%) contrast(99%)` (mesmo filtro do topbar)
- Link "Conheça a Akroma": `btn--outline` pequeno

---

## Copy

### Hero — subtitle

**Antes:**
> "IA que pesquisa tendências, cria legendas, gera imagens e publica — todo dia, sem esforço. Instagram, Facebook e LinkedIn com engajamento real."

**Depois:**
> "Enquanto você trabalha, a IA pesquisa, escreve e publica. Todo dia. No seu nome."

Subtexto menor (abaixo dos CTAs):
> "Instagram, Facebook e LinkedIn. Sem cartão de crédito."

*(A frase anterior listava funcionalidades. A nova vende o benefício emocional — liberdade de tempo — direto.)*

### CTA Final — home

**Antes:**
> "Trial Starter de 7 dias gratis. Sem cartao. Sem compromisso."

**Depois:**
> "7 dias grátis. Sem cartão. Se não gostar, cancela com um clique."

*(Adiciona a saída fácil explícita — reduz medo de comprometimento.)*

### Hero note (abaixo dos botões)

**Antes:**
> "Sem cartão de crédito. Cancele quando quiser."

**Depois:**
> "Sem cartão de crédito · Cancele quando quiser · Resultado em 24h"

*(Adiciona "Resultado em 24h" como prova de velocidade — diferencial do produto.)*

---

## SEO por página

Cada componente chama `seo.setPage()` com título e description próprios:

| Rota | Title | Description |
|---|---|---|
| `/` | `Akroma Spark — Social media no piloto automático` | `IA que pesquisa, cria e publica no Instagram, Facebook e LinkedIn todo dia. Teste grátis 7 dias.` |
| `/como-funciona` | `Como funciona o Spark — Automação de social media com IA` | `Entenda como o Spark pesquisa tendências, gera conteúdo e publica automaticamente. Veja por nicho.` |
| `/recursos` | `Recursos do Spark — Tudo que você precisa para crescer` | `Posts diários com IA, analytics, carrosseis, agendamento e muito mais. Conheça todos os recursos.` |
| `/planos` | `Planos Spark — Simples e transparentes` | `Starter, Pro e Enterprise. Comece grátis por 7 dias. Programa de indicação incluso.` |

---

## Componentes compartilhados

Nenhum componente novo shared é necessário nesta fase. O CTA final de cada página é simples o suficiente para ficar inline em cada componente. Se o site crescer (mais páginas), extrair `SparkCtaComponent` e `SparkPageHeroComponent` como próximos passos.

---

## O que NÃO muda

- Visual design completo (cores, tipografia, cards, animações)
- Lógica da demo interativa (DEMO_POSTS, FALLBACK_DEMOS, geração de post)
- Lógica de preços (fetch de API, toggle anual/mensal)
- Programa de indicação (move de lugar, não muda conteúdo)
- Footer
- Rotas de autenticação (`/entrar`, `/cadastro`, `/oauth-callback`)
- Portal (`/portal/:token`) e app (`/app-dashboard`)

---

## Arquivos a criar / modificar

### Criar
- `src/app/landing/como-funciona.component.ts`
- `src/app/landing/recursos.component.ts`
- `src/app/landing/planos.component.ts`
- `docs/superpowers/specs/2026-05-06-spark-multipage-redesign.md` *(este arquivo)*

### Modificar
- `src/app/landing/spark.component.ts` → renomear classe para `SparkHomeComponent`, ajustar template (remover niches, features, referral; adicionar teaser + bloco Akroma; atualizar copy)
- `src/app/shared/components/topbar/topbar.component.ts` → trocar âncoras por routerLink, remover scroll-spy
- `src/app/app.routes.ts` → adicionar rotas `/como-funciona`, `/recursos`, `/planos`
