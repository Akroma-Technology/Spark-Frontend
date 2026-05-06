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
