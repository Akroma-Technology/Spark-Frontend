import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ClientAuthService } from '../services/client-auth.service';

/**
 * Catches 403 EMAIL_NOT_VERIFIED responses from the Spark API and redirects
 * the user to /verificar-email. Backend enforces this on every authenticated
 * endpoint, so this interceptor centralizes the UX-side handling.
 *
 * Skip when already on /verificar-email to avoid redirect loops.
 */
export const verifyEmailInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(ClientAuthService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const detail = (err.error && err.error.detail) || '';
      if (err.status === 403 && detail === 'EMAIL_NOT_VERIFIED') {
        if (!router.url.startsWith('/verificar-email')) {
          // Pull email from the JWT access_token claims (decoded by service).
          const claims = auth.getClaims();
          const email = (claims && typeof claims['email'] === 'string') ? claims['email'] : '';
          router.navigate(['/verificar-email'], { queryParams: { email } });
        }
      }
      return throwError(() => err);
    }),
  );
};
