import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlingService } from '../services/error-handling.service';

/**
 * HTTP interceptor that catches errors and routes them through
 * the centralized ErrorHandlingService.
 * No direct console usage -- the service handles logging based on environment.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorHandlingService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Error desconocido';
      if (error.status === 0) {
        message = 'No se pudo conectar con el servidor';
      } else if (error.status === 429) {
        message = 'Demasiadas solicitudes. Intente de nuevo en un momento';
      } else if (error.status >= 500) {
        message = 'Error interno del servidor';
      }

      errorService.handleError(error.status, message, error.url ?? undefined);

      return throwError(() => ({ status: error.status, message, url: error.url }));
    })
  );
};
