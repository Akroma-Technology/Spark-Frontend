# Akroma Spark — Frontend

Interface web do [Akroma Spark](https://spark.akroma.com.br), plataforma SaaS de automação de redes sociais (Instagram, Facebook e LinkedIn), desenvolvida com Angular 19 e hospedada no Cloudflare Pages.

## Visão Geral

| Item | Detalhe |
|------|---------|
| Framework | Angular 19 (standalone components) |
| Hospedagem | Cloudflare Pages |
| Estilização | SCSS com design system próprio |
| Produto | Akroma Spark — automação de social media |

## Funcionalidades Principais

- Dashboard de automações e agendamentos
- Gestão de clientes e contas conectadas
- Configuração de posts e campanhas
- Relatórios de performance
- Portal do cliente e planos de assinatura
- Cobranças e financeiro
- Calendário de publicações

## Integração

Consome a API do **Spark-Lambda-Backend** para todas as operações de dados.

## Pré-requisitos

- Node.js 20+
- npm 10+

## Instalação

```bash
npm install
```

## Comandos

| Comando | Descrição |
|---------|-----------|
| `npm start` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Executa testes unitários com Karma |

## Deploy

O deploy é feito automaticamente via **Cloudflare Pages** integrado ao repositório GitHub.

## Licença

Software proprietário de uso exclusivo da Akroma. Veja [LICENSE](LICENSE).
