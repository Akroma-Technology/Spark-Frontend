import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ClientAuthService } from '../services/client-auth.service';

/**
 * Catches 403 gating responses do Spark API / IDP e força logout + redirect
 * pra /entrar com `reason` no query string (a tela /entrar mostra mensagem
 * legível pra cada caso).
 *
 * Cenários cobertos:
 * - EMAIL_NOT_VERIFIED (legacy, e-mail nunca confirmado)
 * - client_not_provisioned (IDP user existe mas Spark.Client foi deletado
 *   ou nunca criado → admin precisa cadastrar via /admin/spark)
 * - "Not registered for Spark." / "Spark subscription is not active." —
 *   gates do get_current_client (sem PR no IDP ou status != active/trial)
 * - no_product_access (vem do exchange_token quando o IDP detecta que o
 *   refresh_token é válido mas o user perdeu PR pra spark — ex: admin
 *   cascateou revoke_product_access depois de deletar o Client)
 *
 * Sem esse trap, o /me 403 era engolido pelo `error: () => {}` no
 * loadProfile e o user via dashboard zerado com "STARTER Ativo".
 */

type DetailObj = { reason?: string; message?: string } | string | undefined;

function reasonFromError(err: HttpErrorResponse): string | null {
  if (err.status !== 403) return null;
  const detail: DetailObj = err.error?.detail;

  if (typeof detail === 'string') {
    if (detail === 'EMAIL_NOT_VERIFIED') return 'email_not_verified';
    if (detail.includes('Not registered for Spark')) return 'no_product_access';
    if (detail.includes('subscription is not active')) return 'subscription_inactive';
    if (detail.includes('Client inactive')) return 'client_inactive';
    return null;
  }
  if (detail && typeof detail === 'object') {
    const r = (detail.reason || '').toString();
    if (r === 'client_not_provisioned') return 'client_not_provisioned';
    if (r === 'no_product_access') return 'no_product_access';
    if (r === 'account_suspended') return 'account_suspended';
    return r || null;
  }
  return null;
}

export const verifyEmailInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(ClientAuthService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const reason = reasonFromError(err);
      if (reason) {
        try { auth.logout(); } catch {}
        router.navigate(['/entrar'], { queryParams: { reason } });
      }
      return throwError(() => err);
    }),
  );
};
