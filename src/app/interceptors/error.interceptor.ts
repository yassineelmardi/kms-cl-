import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { SKIP_ERROR_NOTIFICATION } from '../tokens/http-context.tokens';

/**
 * Global HTTP error interceptor.
 * Les requêtes qui portent SKIP_ERROR_NOTIFICATION=true gèrent leurs
 * propres erreurs — ce snackbar global est alors supprimé pour elles.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notif = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!req.context.get(SKIP_ERROR_NOTIFICATION)) {
        notif.showApiError(error);
      }
      return throwError(() => error);
    })
  );
};
