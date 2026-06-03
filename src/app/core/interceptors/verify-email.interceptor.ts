import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ClientAuthService } from '../services/client-auth.service';

/**
 * Catches 403 EMAIL_NOT_VERIFIED do Spark API. Spark agora opera com
 * cadastro manual via /admin (a Akroma valida o e-mail no momento da
 * criação do tenant), então esse cenário só acontece pra contas legadas
 * que ainda não tiveram o e-mail confirmado. Deslogamos e enviamos pro
 * login pra forçar contato com o suporte.
 */
export const verifyEmailInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(ClientAuthService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const detail = (err.error && err.error.detail) || '';
      if (err.status === 403 && detail === 'EMAIL_NOT_VERIFIED') {
        auth.logout();
        router.navigate(['/entrar'], {
          queryParams: { reason: 'email_not_verified' },
        });
      }
      return throwError(() => err);
    }),
  );
};
