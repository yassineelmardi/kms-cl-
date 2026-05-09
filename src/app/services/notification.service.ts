import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ApiErrorSnackbarComponent } from '../components/api-error-snackbar/api-error-snackbar.component';

export interface ApiErrorBody {
  errors?: Array<{
    errorCode: number;
    errorMessage: string;
    errorLevel: string;
    errorType: string;
    documentationUrl: string | null;
    tips: string | null;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly baseConfig: MatSnackBarConfig = {
    horizontalPosition: 'left',
    verticalPosition: 'bottom',
    duration: 6000,
  };

  /**
   * Parse backend ApiErrorBody and show a snackbar.
   * Falls back to generic message for network/unknown errors.
   */
  showApiError(err: unknown, fallback = 'Une erreur inattendue est survenue.'): void {
    const message = this.extractMessage(err, fallback);
    this.showError(message);
  }

  showError(message: string): void {
    this.snackBar.openFromComponent(ApiErrorSnackbarComponent, {
      ...this.baseConfig,
      data: { message, type: 'error' },
      panelClass: ['kms-snackbar-error'],
    });
  }

  showSuccess(message: string): void {
    this.snackBar.openFromComponent(ApiErrorSnackbarComponent, {
      ...this.baseConfig,
      duration: 4000,
      data: { message, type: 'success' },
      panelClass: ['kms-snackbar-success'],
    });
  }

  showWarning(message: string): void {
    this.snackBar.openFromComponent(ApiErrorSnackbarComponent, {
      ...this.baseConfig,
      data: { message, type: 'warning' },
      panelClass: ['kms-snackbar-warning'],
    });
  }

  private extractMessage(err: unknown, fallback: string): string {
    const httpError = err as { status?: number; error?: ApiErrorBody; message?: string };

    // Handle network-level errors (status 0)
    if (httpError?.status === 0) {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    }

    // Handle 401 / 403
    if (httpError?.status === 401) {
      return 'Session expirée ou non authentifié. Veuillez vous reconnecter.';
    }
    if (httpError?.status === 403) {
      return 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
    }

    // Parse backend ApiErrorBody
    const body = httpError?.error;
    if (body?.errors?.length) {
      return body.errors
        .map(e => e.errorMessage?.trim())
        .filter(Boolean)
        .join(' • ') || fallback;
    }

    return httpError?.message || fallback;
  }
}
