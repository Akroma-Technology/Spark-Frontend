import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../core/services/seo.service';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';
import { SparkFooterComponent } from '../shared/components/footer/footer.component';
import { DEMO_POSTS } from './demo-posts.data';
import { NICHES, NicheInfo } from './niches.data';

/**
 * Fallback mock posts — used ONLY when demo-posts.data.ts is still empty
 * (i.e. the seed script hasn't been run yet). Once DEMO_POSTS is populated,
 * the real backend-generated posts take over and these are ignored.
 */
interface DemoPost {
  handle: string;          // @username shown in header + caption
  displayName: string;     // brand/person name below handle
  image: string;           // Unsplash URL (free, no-auth CDN)
  caption: string;         // PT-BR caption with @mention prefix
  commentsPool: string[];  // pool of random comments (2 picked each click)
}

const FALLBACK_DEMOS: Record<string, DemoPost> = {
  fitness: {
    handle: 'gympower.oficial',
    displayName: 'GymPower Academia',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
    caption: 'Dia de leg — e sim, voce vai sentir amanha.\n\nTres verdades sobre treino de pernas que ninguem te conta:\n\n1. Nao precisa fazer 12 exercicios. Agachamento + leg press + stiff ja matam.\n2. Progredir peso > cansar no aparelho. Anota. Bate a marca da semana passada.\n3. Se nao doeu amanha, voce pegou leve demais.\n\nSua perna vai agradecer em 3 meses. Salva esse post.\n\n#treinodeperna #leg #gym #academia #fitness #treino #workout',
    commentsPool: [
      'Anotado mestre 🔥',
      'Caiu como uma luva, acabei de voltar do leg day 😅',
      'Salvo!',
      'Stiff é o melhor exercicio, concordo',
      'Preciso voltar pra academia',
      'Amanhã não ando kkkk',
      'Conteudo bom demais',
    ],
  },
  tecnologia: {
    handle: 'devpro.br',
    displayName: 'DevPro',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    caption: 'A OpenAI soltou GPT-5. E ninguem percebeu que mudou o jogo.\n\nNao e sobre ser mais rapido. E sobre agentes que executam tarefas de dias em minutos.\n\n3 coisas que ja funcionam HOJE:\n- Code review automatico em PRs\n- Analise de CSV de 500k linhas sem abrir excel\n- Pesquisa de mercado com fontes citadas\n\nQuem nao automatizar em 2026 vai ficar pra tras. Nao e ameaca, e matematica.\n\n#tecnologia #ia #gpt5 #openai #dev #programacao #automacao',
    commentsPool: [
      'Verdade, a gente subestima',
      'Comecei a usar pra code review, game changer',
      'Preciso estudar isso urgente',
      'Salvo pra ler depois 🔖',
      'Conteudo top',
      'Bom demais 👏',
    ],
  },
  gastronomia: {
    handle: 'chefana.cozinha',
    displayName: 'Chef Ana Ribeiro',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
    caption: 'Risoto de cogumelos em 25 minutos. Sem mentira.\n\nO segredo que restaurante italiano nao quer que voce saiba: nao precisa ficar mexendo 40 minutos. A cada concha de caldo, mexer 3 vezes e deixar quieto. Ponto.\n\nIngredientes (serve 4):\n- 2 xicaras arroz arborio\n- 300g cogumelos variados\n- 1L caldo de legumes quente\n- 1/2 xicara vinho branco\n- 50g parmesao\n- Manteiga gelada no final (truque!)\n\nSalva pra fazer no fim de semana 🍄\n\n#risoto #receita #gastronomia #cozinha #italiana #chef #foodie',
    commentsPool: [
      'Que delicia 🤤',
      'Vou fazer domingo, obrigada!',
      'Manteiga gelada no final muda tudo mesmo',
      'Salvo! 🔖',
      'Receita top, ja quero provar',
      'A fome que deu agora...',
    ],
  },
  moda: {
    handle: 'lolastyle.br',
    displayName: 'Lola Martins',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    caption: '3 pecas que nunca saem de moda (e todo armario precisa):\n\n1. Camisa branca bem cortada — serve pra trabalho, jantar, viagem\n2. Calca preta reta — 10x mais elegante que skinny\n3. Blazer oversized neutro — eleva qualquer look basico\n\nMinimalismo nao e ter pouco. E ter certo.\n\nSalva esse carrossel pra montar o guarda-roupa do outono 🍂\n\n#moda #estilo #looks #minimalismo #fashion #outfit #styling',
    commentsPool: [
      'Amei as dicas 😍',
      'Blazer oversized é tudo mesmo',
      'Preciso de um blazer assim',
      'Salvo ✨',
      'Conteudo lindo',
      'Cada dia que passa gosto mais do seu feed',
    ],
  },
  juridico: {
    handle: 'dra.patricia.costa',
    displayName: 'Dra. Patricia Costa — OAB/SP',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80',
    caption: 'Voce sabia? Atraso de voo de mais de 4h da direito a indenizacao.\n\nO que a companhia nao te conta:\n\n✅ 4h ou mais = dano moral (media R$ 5.000 a R$ 15.000)\n✅ Bagagem extraviada = restituicao + danos\n✅ Reacomodacao so em classe igual ou superior — nunca inferior\n\nGuarde: cartao de embarque, protocolo da reclamacao e comprovantes de gastos extras.\n\nConteudo informativo. Cada caso deve ser analisado individualmente.\n\n#direito #advogado #consumidor #voo #indenizacao #oab',
    commentsPool: [
      'Nossa, nao sabia disso',
      'Salvei! 🔖',
      'Obrigada pela informacao',
      'Vou acionar a companhia',
      'Conteudo utilissimo',
      'Aconteceu comigo ano passado, perdi o prazo 😭',
    ],
  },
  imobiliario: {
    handle: 'rafael.imoveis',
    displayName: 'Rafael Mendes — Corretor CRECI 54321',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
    caption: 'Comprar ou alugar em 2026? A conta real (sem achismo).\n\nImovel de R$ 500k:\n- Financiamento 30 anos, entrada 20% = parcela ~R$ 4.200/mes\n- Aluguel equivalente = R$ 2.500/mes\n- Diferenca de R$ 1.700 investida no Tesouro Selic = R$ 1.2MM em 30 anos\n\nMoral: comprar nao e sempre a melhor opcao. Depende do seu plano de 10 anos.\n\nChame no direct pra simular o seu caso especifico 📲\n\n#imovel #comprar #alugar #investimento #financiamento #mercadoimobiliario',
    commentsPool: [
      'Conta bem feita 👏',
      'Salvei pra mostrar pra minha esposa',
      'Conteudo raro, a maioria so vende',
      'Quero simular o meu caso',
      'Chamando no direct',
      'Info valiosa, obrigado',
    ],
  },
  educacao: {
    handle: 'profmarcos.estudos',
    displayName: 'Prof. Marcos — Metodo de Estudos',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
    caption: 'Tecnica Feynman: como aprender QUALQUER coisa em metade do tempo.\n\n4 passos (cientificamente comprovados):\n\n1. Escolha um topico\n2. Explique como se fosse pra uma crianca de 10 anos\n3. Identifique onde voce travou (= lacuna de conhecimento)\n4. Simplifique ainda mais\n\nSe voce nao consegue explicar simples, voce nao entendeu direito.\n\nFuncao exponencial, calculo integral, macroeconomia — funciona pra tudo.\n\nSalva e aplica hoje 📚\n\n#estudos #aprendizado #feynman #metodo #vestibular #concurso #produtividade',
    commentsPool: [
      'Testei e funciona mesmo',
      'Salvei!',
      'Preciso aplicar urgente, obrigada prof',
      'Conteudo de ouro 🥇',
      'Passei no enem usando isso',
      'Compartilhando com minha turma',
    ],
  },
  saude: {
    handle: 'dra.juliana.saude',
    displayName: 'Dra. Juliana Alves — Nutrologa',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
    caption: '5 sinais de que seu intestino esta pedindo socorro:\n\n1. Cansaco apos refeicoes (nao deveria acontecer)\n2. Gases frequentes / estufamento\n3. Pele com acne ou dermatite sem motivo\n4. Vontade de doce o dia inteiro\n5. Dorme mal mesmo cansado\n\n70% da imunidade esta no intestino. Cuidar dele e cuidar de TUDO: energia, pele, sono, humor.\n\nConteudo educativo. Procure um nutrologo ou gastro pra avaliacao individualizada.\n\n#saude #intestino #nutricao #bemestar #imunidade #medicina #probioticos',
    commentsPool: [
      'Me identifiquei nos 5 😭',
      'Preciso de uma consulta urgente',
      'Conteudo tao importante, obrigada dra',
      'Salvo!',
      'Intestino e tudo mesmo',
      'Vou procurar um profissional',
    ],
  },
};

@Component({
  selector: 'app-spark',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SparkTopbarComponent, SparkFooterComponent],
  template: `
    <app-spark-topbar></app-spark-topbar>

    <!-- HERO -->
    <section class="spark-hero">
      <canvas #heroCanvas class="spark-hero__canvas" aria-hidden="true"></canvas>
      <div class="spark-hero__glow" aria-hidden="true"></div>
      <div class="container spark-hero__inner">
        <h1 class="spark-hero__title">
          Social media no<br>
          <span class="spark-hero__title--accent">piloto automático.</span>
        </h1>
        <p class="spark-hero__subtitle">
          Enquanto você trabalha, a IA pesquisa, escreve e publica. Todo dia. No seu nome.
        </p>
        <div class="spark-hero__ctas">
          <a routerLink="/cadastro" class="btn btn--spark">Teste grátis 7 dias &rarr;</a>
          <button type="button" class="btn btn--outline" (click)="scrollToDemo()">Ver demonstração</button>
        </div>
        <p class="spark-hero__trial-note">Sem cartão de crédito · Cancele quando quiser · Resultado em 24h</p>
      </div>
    </section>

    <!-- SOCIAL PROOF -->
    <section class="spark-proof">
      <div class="container">
        <div class="proof-grid">
          <div class="proof-item">
            <span class="proof-item__num">4.800+</span>
            <span class="proof-item__label">Posts publicados por IA</span>
          </div>
          <div class="proof-item">
            <span class="proof-item__num">32</span>
            <span class="proof-item__label">Clientes ativos</span>
          </div>
          <div class="proof-item">
            <span class="proof-item__num">+147%</span>
            <span class="proof-item__label">Engajamento médio</span>
          </div>
          <div class="proof-item">
            <span class="proof-item__num">98.2%</span>
            <span class="proof-item__label">Taxa de sucesso</span>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="spark-testimonials">
      <div class="container">
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div>
              <div class="testimonial-card__stars">
                <span class="testimonial-card__star">★</span><span class="testimonial-card__star">★</span>
                <span class="testimonial-card__star">★</span><span class="testimonial-card__star">★</span>
                <span class="testimonial-card__star">★</span>
              </div>
              <p class="testimonial-card__text">Antes eu gastava 2h por dia criando posts. Com o Spark, acordo e já está publicado. Meu engajamento triplicou em 3 meses.</p>
            </div>
            <div class="testimonial-card__author">
              <div class="testimonial-card__avatar">C</div>
              <div class="testimonial-card__author-info">
                <strong>Dra. Camila Rocha</strong>
                <span>Dermatologista — SP</span>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div>
              <div class="testimonial-card__stars">
                <span class="testimonial-card__star">★</span><span class="testimonial-card__star">★</span>
                <span class="testimonial-card__star">★</span><span class="testimonial-card__star">★</span>
                <span class="testimonial-card__star">★</span>
              </div>
              <p class="testimonial-card__text">Contratei o Spark pra 3 imóveis e em 40 dias recebi 2 leads qualificados direto pelo Instagram. ROI absurdo.</p>
            </div>
            <div class="testimonial-card__author">
              <div class="testimonial-card__avatar">R</div>
              <div class="testimonial-card__author-info">
                <strong>Rafael Mendes</strong>
                <span>Corretor de Imóveis — RJ</span>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div>
              <div class="testimonial-card__stars">
                <span class="testimonial-card__star">★</span><span class="testimonial-card__star">★</span>
                <span class="testimonial-card__star">★</span><span class="testimonial-card__star">★</span>
                <span class="testimonial-card__star">★</span>
              </div>
              <p class="testimonial-card__text">O carrossel que a IA criou sobre leg press viralizou — 12k de alcance num perfil com 800 seguidores. Inacreditável.</p>
            </div>
            <div class="testimonial-card__author">
              <div class="testimonial-card__avatar">L</div>
              <div class="testimonial-card__author-info">
                <strong>Lucas Ferreira</strong>
                <span>Personal Trainer — BH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DEMO -->
    <section id="demo" class="spark-demo">
      <div class="container">
        <span class="label">EXPERIMENTE AGORA</span>
        <h2 class="section-title">Veja o que o Spark criaria para você</h2>
        <div class="demo-box">
          <div class="demo-box__input-row">
            <div class="demo-dropdown" [class.demo-dropdown--open]="demoDropdownOpen">
              <button type="button" class="demo-dropdown__trigger" (click)="demoDropdownOpen = !demoDropdownOpen">
                <span>{{ selectedNicheLabel }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <ul class="demo-dropdown__menu" *ngIf="demoDropdownOpen">
                <li *ngFor="let n of niches" (click)="selectNiche(n.value)"
                    [class.demo-dropdown__item--active]="demoNiche === n.value">
                  {{ n.label }}
                </li>
              </ul>
            </div>
            <button class="btn btn--spark" (click)="generateDemo()" [disabled]="demoLoading">
              {{ demoLoading ? 'Gerando...' : 'Gerar post de exemplo' }}
            </button>
          </div>

          <!-- Instagram-style post mockup (fixed per niche, random likes/comments) -->
          <div class="ig-post" *ngIf="demoPost" [class.ig-post--loading]="demoLoading">
            <header class="ig-post__head">
              <div class="ig-post__avatar">
                <span>{{ demoPost.handle.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="ig-post__who">
                <span class="ig-post__handle">{{ demoPost.handle }}</span>
                <span class="ig-post__name">{{ demoPost.displayName }}</span>
              </div>
              <svg class="ig-post__more" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>
              </svg>
            </header>

            <img class="ig-post__image" [src]="demoPost.image" alt="" loading="lazy">

            <div class="ig-post__actions">
              <div class="ig-post__actions-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </div>
              <svg class="ig-post__save" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            </div>

            <div class="ig-post__likes">
              Curtido por <strong>{{ demoPost.firstLiker }}</strong> e outras <strong>{{ demoPost.likes | number:'1.0-0':'pt-BR' }} pessoas</strong>
            </div>

            <p class="ig-post__caption">
              <strong>{{ demoPost.handle }}</strong>
              <span class="ig-post__caption-text">{{ demoPost.caption }}</span>
            </p>

            <div class="ig-post__comments">
              <div class="ig-post__comment" *ngFor="let c of demoPost.comments">
                <strong>{{ c.handle }}</strong> {{ c.text }}
              </div>
              <div class="ig-post__all-comments">Ver todos os {{ demoPost.commentCount }} comentários</div>
            </div>

            <div class="ig-post__time">HA {{ demoPost.hoursAgo }} HORAS</div>
          </div>

          <div class="ig-post-empty" *ngIf="!demoPost && !demoLoading">
            Clique em <strong>Gerar post de exemplo</strong> pra ver como ficaria um post seu.
          </div>
        </div>
      </div>
    </section>

    <!-- COMO FUNCIONA -->
    <section class="spark-steps">
      <div class="container">
        <span class="label">COMO FUNCIONA</span>
        <h2 class="section-title">4 etapas. Zero esforço.</h2>
        <div class="steps-grid">
          <div class="step-card">
            <span class="step-card__num">01</span>
            <h3 class="step-card__title">Pesquisa de tendências</h3>
            <p class="step-card__desc">A IA busca as notícias e trends mais relevantes do seu nicho nas últimas 24-48h usando Google Search em tempo real.</p>
          </div>
          <div class="step-card">
            <span class="step-card__num">02</span>
            <h3 class="step-card__title">Geração de conteúdo</h3>
            <p class="step-card__desc">Com base nas tendências, gera legendas provocativas com hooks de scroll-stop, hashtags otimizadas e CTA.</p>
          </div>
          <div class="step-card">
            <span class="step-card__num">03</span>
            <h3 class="step-card__title">Criação visual</h3>
            <p class="step-card__desc">Gera imagens ou carrosseis completos com design profissional, adaptados ao estilo da sua marca.</p>
          </div>
          <div class="step-card">
            <span class="step-card__num">04</span>
            <h3 class="step-card__title">Publicação automática</h3>
            <p class="step-card__desc">Publica automaticamente no Instagram, Facebook e LinkedIn nos horários ideais para engajamento.</p>
          </div>
        </div>
        <div class="steps-more">
          <a routerLink="/como-funciona" class="btn btn--outline-accent">
            Ver como funciona em detalhes &rarr;
          </a>
        </div>
      </div>
    </section>

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

    <!-- CTA FINAL -->
    <section class="spark-cta">
      <div class="container spark-cta__inner">
        <h2 class="spark-cta__title">Pronto para automatizar seu social media?</h2>
        <p class="spark-cta__desc">7 dias grátis. Sem cartão. Se não gostar, cancela com um clique.</p>
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

    /* Hero */
    .spark-hero {
      position: relative; padding: 96px 0 48px; overflow: hidden;
      min-height: calc(100vh - 72px);
      background: linear-gradient(180deg, #080c1a 0%, #050810 50%, #050810 100%);
      display: flex; align-items: center;
    }
    @media (max-width: 768px) {
      .spark-hero { padding: 88px 0 40px; min-height: auto; }
    }
    /* Particles live in the RIGHT half on desktop — mirroring akroma.com.br hero. */
    .spark-hero__canvas {
      position: absolute; top: 0; right: 0;
      width: 50%; height: 100%;
      pointer-events: none; z-index: 0;
      @media (max-width: 768px) {
        width: 100%; opacity: 0.35;
      }
    }
    .spark-hero__glow {
      position: absolute; top: -200px; right: 0;
      width: 800px; height: 800px; border-radius: 50%;
      background: radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%);
      pointer-events: none; z-index: 0;
    }
    .spark-hero__glow::after {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(circle, rgba(77,124,255,0.04) 0%, transparent 60%);
    }
    .spark-hero__inner {
      position: relative; z-index: 1;
      max-width: 600px;
      text-align: left;
    }
    @media (min-width: 769px) {
      .spark-hero__inner {
        /* Keep text in the left half so the sphere fills the right half. */
        margin-left: max(24px, calc((100vw - 1200px) / 2));
        margin-right: auto;
      }
    }
    @media (max-width: 768px) {
      .spark-hero__inner { text-align: center; margin: 0 auto; }
    }
    .spark-hero__label { margin-bottom: 14px; }
    .spark-hero__title {
      font-size: clamp(32px, 4.2vw, 54px); font-weight: 900; color: #fff;
      line-height: 1.08; margin-bottom: 18px;
    }
    .spark-hero__title--accent {
      background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .spark-hero__subtitle {
      font-size: 17px; color: #9ca3af; line-height: 1.6; margin-bottom: 24px;
      max-width: 520px;
    }
    .spark-hero__ctas { display: flex; gap: 16px; flex-wrap: wrap; }
    @media (max-width: 768px) {
      .spark-hero__subtitle { margin-left: auto; margin-right: auto; }
      .spark-hero__ctas { justify-content: center; }
    }
    .spark-hero__trial-note {
      margin-top: 12px; font-size: 12px; color: #6b7280;
    }

    /* Buttons */
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
    .btn--spark:hover {
      filter: brightness(1.08); transform: translateY(-1px);
      box-shadow: 0 8px 24px -6px rgba(245,158,11,0.4);
    }
    .btn--spark:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn--outline {
      background: transparent; color: #d1d5db;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .btn--outline:hover { border-color: rgba(255,255,255,0.3); color: #fff; }
    .btn--outline-accent {
      background: transparent; color: #fbbf24;
      border: 1px solid rgba(251,191,36,0.45);
    }
    .btn--outline-accent:hover {
      border-color: rgba(251,191,36,0.8); color: #fcd34d;
      background: rgba(251,191,36,0.07); transform: translateY(-1px);
    }
    .btn--full { width: 100%; box-sizing: border-box; }
    .btn--lg { padding: 18px 36px; font-size: 17px; }

    /* Social Proof */
    .spark-proof {
      padding: 56px 0;
      background: linear-gradient(180deg, #050810 0%, #07091a 50%, #050810 100%);
      border-top: 1px solid rgba(251,191,36,0.08);
      border-bottom: 1px solid rgba(251,191,36,0.08);
    }
    .proof-grid { display: flex; justify-content: center; gap: 48px; flex-wrap: wrap; }
    .proof-item { text-align: center; }
    .proof-item__num {
      display: block; font-size: 36px; font-weight: 900; color: #fbbf24;
      text-shadow: 0 0 20px rgba(251,191,36,0.45), 0 0 40px rgba(245,158,11,0.2);
    }
    .proof-item__label { font-size: 13px; color: #6b7280; }

    /* Testimonials */
    .spark-testimonials { padding: 80px 0; background: #050810; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .testimonial-card {
      padding: 28px; border-radius: 16px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
      transition: border-color 0.2s, transform 0.2s;
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .testimonial-card:hover {
      border-color: rgba(251,191,36,0.2); transform: translateY(-2px);
    }
    .testimonial-card__stars {
      display: flex; gap: 3px; margin-bottom: 14px;
    }
    .testimonial-card__star {
      color: #fbbf24; font-size: 14px;
    }
    .testimonial-card__text {
      font-size: 14px; color: #d1d5db; line-height: 1.75; font-style: italic;
      margin-bottom: 20px; flex-grow: 1;
    }
    .testimonial-card__text::before { content: '“'; color: #fbbf24; font-size: 18px; font-style: normal; }
    .testimonial-card__author { display: flex; align-items: center; gap: 10px; }
    .testimonial-card__avatar {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: #000;
    }
    .testimonial-card__author-info strong { display: block; color: #fff; font-size: 14px; font-weight: 600; }
    .testimonial-card__author-info span { font-size: 12px; color: #6b7280; }

    /* Demo */
    .spark-demo {
      padding: 100px 0;
      background: linear-gradient(180deg, #050810 0%, #0d0b1e 50%, #050810 100%);
    }
    .demo-box {
      max-width: 680px; margin: 0 auto; padding: 32px; border-radius: 20px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    }
    .demo-box__input-row { display: flex; gap: 12px; margin-bottom: 20px; position: relative; align-items: stretch; }

    /* Custom dropdown — dark theme, no native select quirks */
    .demo-dropdown { flex: 1; position: relative; }
    .demo-dropdown__trigger {
      width: 100%; height: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-radius: 10px; font-size: 15px; font-weight: 500;
      background: rgba(255,255,255,0.06); color: #fff;
      border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .demo-dropdown__trigger:hover { border-color: rgba(251,191,36,0.4); background: rgba(255,255,255,0.08); }
    .demo-dropdown__trigger svg {
      width: 16px; height: 16px; color: #9ca3af;
      transition: transform 0.2s;
    }
    .demo-dropdown--open .demo-dropdown__trigger svg { transform: rotate(180deg); }
    .demo-dropdown__menu {
      position: absolute; top: calc(100% + 6px); left: 0; right: 0;
      list-style: none; padding: 6px; margin: 0;
      background: #111422; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; z-index: 20;
      max-height: 300px; overflow-y: auto;
      box-shadow: 0 12px 32px -8px rgba(0,0,0,0.6);
    }
    .demo-dropdown__menu li {
      padding: 10px 14px; border-radius: 8px; font-size: 14px; color: #d1d5db;
      cursor: pointer; transition: background 0.12s, color 0.12s;
    }
    .demo-dropdown__menu li:hover { background: rgba(251,191,36,0.12); color: #fbbf24; }
    .demo-dropdown__item--active { background: rgba(251,191,36,0.08); color: #fbbf24; font-weight: 600; }
    .demo-box__result { margin-top: 16px; }
    .demo-box__topic {
      font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #fbbf24;
      text-transform: uppercase; margin-bottom: 12px;
    }
    .demo-box__caption {
      font-size: 15px; color: #d1d5db; line-height: 1.7; white-space: pre-wrap;
    }
    .demo-box__meta { display: flex; gap: 8px; margin-top: 16px; }
    .demo-box__tag {
      font-size: 11px; color: #9ca3af; background: rgba(255,255,255,0.05);
      padding: 4px 10px; border-radius: 6px;
    }

    /* ── Instagram post mockup ───────────────────────────────────────────── */
    .ig-post-empty {
      margin-top: 20px; padding: 28px; border-radius: 14px;
      background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.08);
      color: #6b7280; text-align: center; font-size: 14px;
    }
    .ig-post-empty strong { color: #fbbf24; font-weight: 600; }
    .ig-post {
      margin: 20px auto 0; max-width: 480px;
      background: #ffffff; color: #262626;
      border-radius: 12px; overflow: hidden;
      border: 1px solid #dbdbdb;
      box-shadow: 0 12px 40px -12px rgba(0,0,0,0.6);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      transition: opacity 0.2s;
    }
    .ig-post--loading { opacity: 0.5; }
    .ig-post__head {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px;
    }
    .ig-post__avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #f09433, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 14px;
      padding: 2px;
    }
    .ig-post__avatar span {
      width: 100%; height: 100%; border-radius: 50%;
      background: #fff; color: #262626;
      display: flex; align-items: center; justify-content: center;
    }
    .ig-post__who { flex: 1; display: flex; flex-direction: column; line-height: 1.2; }
    .ig-post__handle { font-size: 14px; font-weight: 600; color: #262626; }
    .ig-post__name { font-size: 12px; color: #8e8e8e; }
    .ig-post__more { width: 20px; height: 20px; color: #262626; cursor: pointer; }
    .ig-post__image {
      display: block; width: 100%; aspect-ratio: 4 / 5;
      object-fit: contain; background: #efefef;
    }
    .ig-post__actions {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 14px 4px;
    }
    .ig-post__actions svg { width: 24px; height: 24px; color: #262626; cursor: pointer; }
    .ig-post__actions-left { display: flex; gap: 14px; }
    .ig-post__likes {
      padding: 4px 14px; font-size: 14px; color: #262626;
    }
    .ig-post__likes strong { font-weight: 600; }
    .ig-post__caption {
      padding: 4px 14px; font-size: 14px; color: #262626; line-height: 1.4;
      margin: 0; white-space: pre-line;
    }
    .ig-post__caption strong { font-weight: 600; margin-right: 6px; }
    .ig-post__caption-text { color: #262626; }
    .ig-post__comments { padding: 6px 14px 4px; }
    .ig-post__comment { font-size: 14px; color: #262626; line-height: 1.4; margin-bottom: 2px; }
    .ig-post__comment strong { font-weight: 600; margin-right: 6px; }
    .ig-post__all-comments {
      font-size: 14px; color: #8e8e8e; margin: 4px 0; cursor: pointer;
    }
    .ig-post__time {
      padding: 6px 14px 14px;
      font-size: 10px; color: #8e8e8e; letter-spacing: 0.2px;
      text-transform: uppercase;
    }

    /* Steps */
    .spark-steps { padding: 100px 0; background: #050810; }
    .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    .step-card {
      padding: 32px 24px; border-radius: 16px;
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
      text-shadow:
        0 0 8px rgba(251,191,36,0.55),
        0 0 20px rgba(251,191,36,0.35),
        0 0 40px rgba(245,158,11,0.25);
      letter-spacing: 0.02em;
    }
    .step-card__title { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 10px; }
    .step-card__desc { font-size: 14px; color: #9ca3af; line-height: 1.6; }

    /* CTA Final */
    .spark-cta {
      padding: 100px 0;
      position: relative; overflow: hidden;
      background: linear-gradient(180deg, #050810 0%, #120b04 60%, #050810 100%);
    }
    .spark-cta::before {
      content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent);
      pointer-events: none;
    }
    .spark-cta::after {
      content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
      width: 500px; height: 250px; border-radius: 50%;
      background: radial-gradient(circle, rgba(251,191,36,0.06), transparent 70%);
      pointer-events: none;
    }
    .spark-cta__inner { text-align: center; }
    .spark-cta__title {
      font-size: clamp(28px, 4vw, 40px); font-weight: 800; color: #fff; margin-bottom: 16px;
    }
    .spark-cta__desc { font-size: 18px; color: #9ca3af; margin-bottom: 32px; }

    /* Steps-more link */
    .steps-more {
      text-align: center;
      margin-top: 40px;
    }

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

    /* Responsive */
    @media (max-width: 768px) {
      .steps-grid { grid-template-columns: 1fr 1fr; }
      .spark-hero { padding: 120px 0 80px; }
      .testimonials-grid { grid-template-columns: 1fr; gap: 16px; }
      .demo-box__input-row { flex-direction: column; }
      .proof-grid { gap: 24px; }
    }
    @media (max-width: 480px) {
      .steps-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SparkHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas') heroCanvas?: ElementRef<HTMLCanvasElement>;
  private heroScene: { dispose: () => void } | null = null;

  private host = inject(ElementRef);
  private seo = inject(SeoService);

  readonly niches = NICHES;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  scrollToDemo(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.heroCanvas?.nativeElement) return;
    try {
      const { SparkHeroScene } = await import('../three/spark-hero-scene');
      if (this.heroScene === null) {
        this.heroScene = new SparkHeroScene(this.heroCanvas.nativeElement);
      }
    } catch (err) {
      console.error('[SparkComponent] hero scene error', err);
    }
  }

  ngOnDestroy(): void {
    if (this.heroScene) {
      this.heroScene.dispose();
      this.heroScene = null;
    }
  }

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Akroma Spark — Geração de conteúdo com IA para Instagram',
      description:
        'Akroma Spark cria legendas, ideias e roteiros para seu Instagram em segundos. IA treinada para o seu nicho, em português.',
    });

    // SoftwareApplication schema — unlocks rich results (price, rating, category)
    // in Google Search for product queries.
    this.seo.setSchema({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Akroma Spark',
      description:
        'Plataforma de geração de conteúdo com IA para Instagram, treinada em português e especializada por nicho.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://spark.akroma.com.br/',
      inLanguage: 'pt-BR',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'BRL',
        price: '97',
        availability: 'https://schema.org/InStock',
      },
      provider: {
        '@type': 'Organization',
        name: 'Akroma',
        url: 'https://akroma.com.br',
      },
    });

  }

  demoNiche = 'fitness';
  demoDropdownOpen = false;
  demoLoading = false;

  /** Rendered Instagram mockup. Fixed image/caption per niche; likes & comments randomized. */
  demoPost: {
    handle: string;
    displayName: string;
    image: string;
    caption: string;
    likes: number;
    firstLiker: string;
    comments: { handle: string; text: string }[];
    commentCount: number;
    hoursAgo: number;
  } | null = null;

  /** Pool of handles used as "first liker" + random commenters. */
  private readonly LIKER_POOL = [
    'andreey.dev', 'mariana.souza', 'joao_costa', 'lu.fernandes',
    'pedrohenrique', 'bea.alves', 'carolinasilva', 'tiago.mr',
    'rafaela.ok', 'leo.m', 'ana.paula_', 'gabizinha.bc',
  ];

  get selectedNicheLabel(): string {
    return this.niches.find(n => n.value === this.demoNiche)?.label ?? 'Escolha um nicho';
  }

  selectNiche(value: string) {
    this.demoNiche = value;
    this.demoDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.demoDropdownOpen && !this.host.nativeElement.contains(event.target as Node)) {
      this.demoDropdownOpen = false;
    }
  }

  /** Pick N unique random items from a pool. */
  private pickRandom<T>(pool: T[], n: number): T[] {
    const copy = [...pool];
    const out: T[] = [];
    for (let i = 0; i < n && copy.length; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  }

  /** Random integer in [min, max] inclusive. */
  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Build the mock Instagram post. Image + caption are fixed per niche;
   * likes, first liker, comments and "hours ago" are randomized each click
   * to feel alive without making any API calls.
   *
   * Priority: DEMO_POSTS (real backend-generated posts from seed script)
   * falls back to FALLBACK_DEMOS (Unsplash stock + hand-written captions)
   * when the seed script hasn't been run yet.
   */
  generateDemo() {
    const real = DEMO_POSTS.find(p => p.niche === this.demoNiche);
    const fallback = FALLBACK_DEMOS[this.demoNiche];

    const data: DemoPost | null = real
      ? {
          handle: real.handle,
          displayName: real.displayName,
          image: real.image,
          caption: real.caption,
          commentsPool: (fallback?.commentsPool ?? [
            'Salvei!', 'Conteudo top 👏', 'Muito bom', 'Top demais',
            'Otimo ponto', 'Concordo 100%', 'Preciso pensar nisso',
          ]),
        }
      : (fallback ?? null);

    if (!data) return;

    this.demoLoading = true;
    // Brief loading state (~400ms) so the button feels responsive.
    setTimeout(() => {
      const likers = this.pickRandom(this.LIKER_POOL, 3);
      const commentTexts = this.pickRandom(data.commentsPool, 2);
      const commenters = this.pickRandom(
        this.LIKER_POOL.filter(h => !likers.includes(h)),
        2,
      );

      this.demoPost = {
        handle: data.handle,
        displayName: data.displayName,
        image: data.image,
        caption: data.caption,
        likes: this.randInt(1240, 9870),
        firstLiker: likers[0],
        comments: commenters.map((h, i) => ({ handle: h, text: commentTexts[i] })),
        commentCount: this.randInt(42, 318),
        hoursAgo: this.randInt(2, 22),
      };
      this.demoLoading = false;
    }, 400);
  }
}
