import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SeoService } from '../core/services/seo.service';

interface NicheData {
  title: string;
  subtitle: string;
  benefits: string[];
  stats: { num: string; label: string }[];
}

const NICHES: Record<string, NicheData> = {
  fitness: {
    title: 'Automacao de Instagram para Academias e Personal Trainers',
    subtitle: 'Posts diarios com IA sobre treino, nutricao e motivacao — sem voce precisar criar nada.',
    benefits: [
      'Conteudo sobre exercicios, nutricao e lifestyle fitness gerado automaticamente',
      'Imagens profissionais de treino adaptadas ao estilo da sua marca',
      'Hashtags otimizadas para o nicho fitness (#treino #gym #saude)',
      'Posts nos melhores horarios para engajamento de alunos'
    ],
    stats: [
      { num: '+180%', label: 'Engajamento medio' },
      { num: '30', label: 'Posts/mes sem esforco' },
      { num: '2h/dia', label: 'De tempo economizado' }
    ]
  },
  tecnologia: {
    title: 'Social Media com IA para Empresas de Tecnologia',
    subtitle: 'A IA pesquisa as ultimas tendencias tech e publica conteudo relevante todos os dias.',
    benefits: [
      'Acompanha tendencias de IA, cloud, dev e startups em tempo real',
      'Legendas tecnicas com linguagem acessivel para seu publico',
      'Carrosseis explicativos sobre conceitos complexos',
      'Hashtags otimizadas para tech (#tecnologia #inovacao #dev)'
    ],
    stats: [
      { num: '+210%', label: 'Alcance organico' },
      { num: '24/7', label: 'Monitoramento de trends' },
      { num: '98%', label: 'Taxa de publicacao' }
    ]
  },
  gastronomia: {
    title: 'Automacao de Instagram para Restaurantes e Chefs',
    subtitle: 'Conteudo gourmet publicado diariamente — receitas, dicas e trends culinarias.',
    benefits: [
      'Posts sobre receitas, ingredientes da estacao e tecnicas culinarias',
      'Imagens apetitosas geradas por IA no estilo food photography',
      'Conteudo adaptado para delivery, restaurante ou chef pessoal',
      'Hashtags de gastronomia otimizadas por regiao'
    ],
    stats: [
      { num: '+165%', label: 'Engajamento em 60 dias' },
      { num: '12', label: 'Temas por semana' },
      { num: '3x', label: 'Mais salvamentos' }
    ]
  },
  moda: {
    title: 'Instagram no Piloto Automatico para Marcas de Moda',
    subtitle: 'Tendencias de moda, looks e styling publicados diariamente com IA.',
    benefits: [
      'Conteudo sobre tendencias, cores da temporada e styling tips',
      'Imagens de moda geradas com estetica profissional',
      'Carrosseis de looks e combinacoes automaticos',
      'Hashtags segmentadas por nicho (#moda #fashion #estilo)'
    ],
    stats: [
      { num: '+190%', label: 'Crescimento de seguidores' },
      { num: '7/7', label: 'Posts por semana' },
      { num: '4x', label: 'Mais interacoes' }
    ]
  },
  juridico: {
    title: 'Marketing Juridico com IA — Posts Diarios para Advogados',
    subtitle: 'Conteudo informativo sobre direito publicado todo dia, respeitando a etica da OAB.',
    benefits: [
      'Posts sobre direitos do consumidor, trabalhista, tributario e mais',
      'Tom educativo e informativo (sem captacao direta)',
      'Carrosseis explicativos sobre leis e direitos',
      'Linguagem acessivel para leigos'
    ],
    stats: [
      { num: '+140%', label: 'Engajamento organico' },
      { num: '100%', label: 'Compliance OAB' },
      { num: '5x', label: 'Mais consultas via DM' }
    ]
  },
  imobiliario: {
    title: 'Automacao de Instagram para Corretores de Imoveis',
    subtitle: 'Posts sobre mercado imobiliario, dicas de compra e investimento — todo dia, automatico.',
    benefits: [
      'Conteudo sobre mercado, financiamento, decoracao e investimento',
      'Imagens de imoveis e ambientes geradas por IA',
      'Posts educativos que atraem leads qualificados',
      'Hashtags geolocalizadas por cidade e bairro'
    ],
    stats: [
      { num: '2.3', label: 'Leads/semana em media' },
      { num: '+175%', label: 'Alcance organico' },
      { num: '40 dias', label: 'Para primeiro lead' }
    ]
  },
  educacao: {
    title: 'Social Media com IA para Escolas e Cursos',
    subtitle: 'Conteudo educacional publicado diariamente — dicas de estudo, curiosidades e motivacao.',
    benefits: [
      'Posts sobre aprendizado, produtividade e curiosidades educacionais',
      'Carrosseis didaticos que simplificam conceitos complexos',
      'Conteudo adaptado para escola, faculdade ou curso online',
      'Hashtags de educacao otimizadas'
    ],
    stats: [
      { num: '+155%', label: 'Engajamento de alunos' },
      { num: '30', label: 'Posts educativos/mes' },
      { num: '2x', label: 'Mais matriculas' }
    ]
  },
  saude: {
    title: 'Automacao de Instagram para Clinicas e Profissionais de Saude',
    subtitle: 'Conteudo informativo sobre saude e bem-estar publicado todo dia com IA.',
    benefits: [
      'Posts sobre prevencao, saude mental, nutricao e qualidade de vida',
      'Tom profissional e acolhedor, sem promessas medicas',
      'Carrosseis educativos sobre condicoes e tratamentos',
      'Hashtags de saude segmentadas por especialidade'
    ],
    stats: [
      { num: '+160%', label: 'Engajamento em 90 dias' },
      { num: '3x', label: 'Mais agendamentos' },
      { num: '98%', label: 'Conteudo aprovado' }
    ]
  }
};

@Component({
  selector: 'app-spark-niche',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="niche-hero" *ngIf="data">
      <div class="container">
        <a routerLink="/spark" class="niche-back">&larr; Voltar para Spark</a>
        <span class="label">AKROMA SPARK PARA {{ slug.toUpperCase() }}</span>
        <h1 class="niche-hero__title">{{ data.title }}</h1>
        <p class="niche-hero__subtitle">{{ data.subtitle }}</p>

        <div class="niche-stats">
          <div class="niche-stat" *ngFor="let s of data.stats">
            <span class="niche-stat__num">{{ s.num }}</span>
            <span class="niche-stat__label">{{ s.label }}</span>
          </div>
        </div>

        <div class="niche-benefits">
          <h3>O que voce ganha:</h3>
          <ul>
            <li *ngFor="let b of data.benefits">{{ b }}</li>
          </ul>
        </div>

        <div class="niche-ctas">
          <a routerLink="/contato" class="btn btn--spark btn--lg">Teste gratis 7 dias &rarr;</a>
          <p class="niche-ctas__note">Sem cartao de credito. Cancele quando quiser.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .container { max-width: 800px; margin: 0 auto; padding: 0 24px; }
    .label {
      font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #fbbf24;
      display: block; margin-bottom: 16px;
    }
    .niche-hero { padding: 140px 0 100px; background: #0a0a12; }
    .niche-back {
      display: inline-block; color: #6b7280; font-size: 13px; text-decoration: none;
      margin-bottom: 24px; transition: color 0.2s;
    }
    .niche-back:hover { color: #fbbf24; }
    .niche-hero__title {
      font-size: clamp(28px, 4vw, 44px); font-weight: 900; color: #fff;
      line-height: 1.1; margin-bottom: 20px;
    }
    .niche-hero__subtitle {
      font-size: 18px; color: #9ca3af; line-height: 1.7; margin-bottom: 48px;
    }
    .niche-stats { display: flex; gap: 32px; margin-bottom: 48px; flex-wrap: wrap; }
    .niche-stat { text-align: center; }
    .niche-stat__num { display: block; font-size: 32px; font-weight: 900; color: #fbbf24; }
    .niche-stat__label { font-size: 13px; color: #6b7280; }
    .niche-benefits {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px; padding: 28px; margin-bottom: 48px;
    }
    .niche-benefits h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 16px; }
    .niche-benefits ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .niche-benefits li {
      font-size: 14px; color: #d1d5db; padding-left: 20px; position: relative; line-height: 1.6;
    }
    .niche-benefits li::before {
      content: '\\2713'; position: absolute; left: 0; color: #fbbf24; font-weight: 700;
    }
    .niche-ctas { text-align: center; }
    .niche-ctas__note { margin-top: 12px; font-size: 13px; color: #6b7280; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px;
      text-decoration: none; transition: all 0.2s; border: none; cursor: pointer;
    }
    .btn--spark { background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; }
    .btn--spark:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn--lg { padding: 18px 36px; font-size: 17px; }
  `]
})
export class SparkNicheComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seo = inject(SeoService);
  slug = '';
  data: NicheData | null = null;

  ngOnInit() {
    this.slug = this.route.snapshot.params['niche'] || '';
    this.data = NICHES[this.slug] || null;

    if (this.data) {
      // Real niche page — emit full SEO metadata (title, description, canonical).
      this.seo.setPage({
        title: `${this.data.title} — Akroma Spark`,
        description: this.data.subtitle,
      });
    } else {
      // Unknown slug — treat as 404.
      this.router.navigateByUrl('/404', { skipLocationChange: true });
    }
  }
}
