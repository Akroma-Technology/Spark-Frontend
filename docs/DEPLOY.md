# Deploy — Akroma Spark

Angular 19 SSR app hosted on **Cloudflare Pages** via wrangler direct upload.

## Build

    npm run build
    # output: dist/akroma-spark/browser/

Prerenders the 4 static routes (/, /cadastro, /entrar, /app). SSR bundle
also generated under dist/akroma-spark/server/ but unused on Pages.

## Local preview

    npm run preview
    # http://localhost:4201

Serves `dist/akroma-spark/browser/` with SPA fallback — mirrors Cloudflare
Pages routing exactly.

## Deploy to Cloudflare Pages

    npm run deploy

This runs `npm run build` then uploads the browser artifact via
`wrangler pages deploy`. Preview URL is printed at the end
(e.g. https://<hash>.akroma-spark.pages.dev); the production URL is
`https://akroma-spark.pages.dev/` and eventually `https://spark.akroma.com.br/`
once DNS cutover completes (Phase C).

**Pre-requisites:**

Node.js 20 (Angular 19 requires >= 18.19; the Cloudflare build env pins to Node 20).

Be logged in to wrangler under an account with
`pages (write)` on the `Leonardo.guedes@akroma.com.br's Account`:

    npx wrangler whoami
    # if not logged in: npx wrangler login

## Cloudflare Pages project

- Project name: `akroma-spark`
- Production branch: `master`
- Build output: `dist/akroma-spark/browser`
- No GitHub integration wired — deploys happen via `npm run deploy`
  from a local machine. (Future: connect GitHub via dashboard if
  git-push auto-deploy becomes desired; would need NODE_AUTH_TOKEN
  env var set in CF for @akroma-technology/ui install.)
- Custom domain: `spark.akroma.com.br` (DNS cutover in Phase C)

## Backend

API: `https://jhwyck4q2p.us-east-1.awsapprunner.com` (AWS App Runner).
Note: this is a provisional AWS App Runner endpoint — it will be replaced by a stable domain in Phase C (backend CORS + DNS cutover).
CORS must allow `https://spark.akroma.com.br` — configured in Phase C.

## Rollback

    # option 1: dashboard
    Cloudflare Pages → akroma-spark → Deployments → pick version → Rollback

    # option 2: redeploy a prior git SHA locally
    git checkout <sha>
    npm run deploy
    git checkout master
