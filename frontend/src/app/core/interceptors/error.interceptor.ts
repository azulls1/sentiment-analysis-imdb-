import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
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
      console.error(`[API Error] ${error.status}: ${message}`, error.url);
      return throwError(() => ({ status: error.status, message, url: error.url }));
    })
  );
};
