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
