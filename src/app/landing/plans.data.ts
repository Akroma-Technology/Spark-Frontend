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
