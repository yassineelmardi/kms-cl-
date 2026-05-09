import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/**
 * Global HTTP error interceptor.
 * Catches all non-2xx responses and displays a snackbar notification.
 * Components that need custom error handling can still catch errors
 * via their own catchError — this interceptor re-throws the error.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notif = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip 401 coming from the auth token endpoint (handled by auth interceptor)
      // or any URL you want to silence globally — add exclusions here if needed.
      notif.showApiError(error);
      return throwError(() => error);
    })
  );
};
