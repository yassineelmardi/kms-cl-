import { HttpContextToken } from '@angular/common/http';

/**
 * Quand mis à true sur une requête HTTP, l'errorInterceptor global
 * ne montrera PAS de snackbar — le composant/service gère lui-même l'erreur.
 *
 * Usage :
 *   this.http.get('/v1/keys', {
 *     context: new HttpContext().set(SKIP_ERROR_NOTIFICATION, true)
 *   })
 */
export const SKIP_ERROR_NOTIFICATION = new HttpContextToken<boolean>(() => false);
