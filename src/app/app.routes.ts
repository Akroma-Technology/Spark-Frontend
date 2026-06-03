import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ClientAuthService } from './core/services/client-auth.service';
import { AdminAuthService } from './core/services/admin-auth.service';

const clientAuthGuard = () => {
  const auth = inject(ClientAuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/entrar']);
  return false;
};

/**
 * Guards `/admin/*` — requires a non-expired IDP JWT with akroma_level of
 * `akroma_staff` or `akroma_super_admin` (or the legacy `is_admin === true`
 * fallback during the unified-roles transition).
 *
 * Non-admin users are bounced to `/entrar` instead of `/admin/...` so a
 * customer who lands on `/admin/nichos` doesn't see a half-rendered admin
 * shell asking for credentials they can't satisfy.
 */
const adminAuthGuard = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.isAdmin()) return true;
  // Allow the unauthenticated state to reach the admin login form on the page
  // itself — only bounce users who are clearly customers (have a valid token
  // but are not admin).
  if (auth.getToken() && !auth.isAdmin()) {
    router.navigate(['/entrar']);
    return false;
  }
  return true;
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
  // Cadastro removido — Spark agora opera com cobrança centralizada
  // (contrato + cadastro manual via /admin). Auto-signup desligado.
  // Rotas /cadastro, /verificar-email e /verificar caem no NotFound abaixo,
  // e o app.routes garante que ninguém entre via URL direta.
  {
    path: 'entrar',
    loadComponent: () => import('./entrar/entrar.component').then(m => m.EntrarComponent)
  },
  {
    path: 'esqueci-senha',
    loadComponent: () => import('./esqueci-senha/esqueci-senha.component').then(m => m.EsqueciSenhaComponent)
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
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    canActivateChild: [adminAuthGuard],
    children: [
      {
        path: 'nichos',
        loadComponent: () => import('./admin/nichos/admin-nichos.component').then(m => m.AdminNichosComponent)
      }
    ]
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
