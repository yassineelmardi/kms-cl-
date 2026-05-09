import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

export type HealthStatus = 'ok' | 'degraded' | 'unreachable' | 'skipped';

export interface HealthCheckResult {
  status: HealthStatus;
  env: string;
  apiUrl: string;
  latencyMs?: number;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class HealthCheckService {
  private readonly http  = inject(HttpClient);
  private readonly notif = inject(NotificationService);

  private readonly TIMEOUT_MS = 8_000;
  // Endpoint de santé — /v1/applications est le seul endpoint connu opérationnel
  private readonly HEALTH_PATH = '/v1/applications?page=0&size=1';

  /**
   * Appelé par APP_INITIALIZER au démarrage.
   * En environnement local, ne fait rien (pas de backend requis).
   */
  checkOnStartup(): Promise<HealthCheckResult> {
    if (environment.name === 'local') {
      return Promise.resolve({
        status: 'skipped',
        env: 'local',
        apiUrl: environment.apiUrl,
      });
    }
    return this.ping().toPromise() as Promise<HealthCheckResult>;
  }

  private ping() {
    const start = Date.now();

    return this.http
      .get(this.HEALTH_PATH, { observe: 'response' })
      .pipe(
        timeout(this.TIMEOUT_MS),
        map(response => {
          const latencyMs = Date.now() - start;
          const result: HealthCheckResult = {
            status: response.status === 200 ? 'ok' : 'degraded',
            env: environment.name,
            apiUrl: environment.apiUrl,
            latencyMs,
          };
          if (environment.debug) {
            console.info(
              `%c[HealthCheck] ✅ ${environment.name.toUpperCase()} API reachable — ${latencyMs}ms`,
              'color: #15803d; font-weight: bold',
            );
          }
          return result;
        }),
        catchError(err => {
          const result: HealthCheckResult = {
            status: 'unreachable',
            env: environment.name,
            apiUrl: environment.apiUrl,
            error: err?.message ?? 'Unknown error',
          };

          const isTimeout = err?.name === 'TimeoutError';
          const msg = isTimeout
            ? `⏱ L'API ${environment.name.toUpperCase()} ne répond pas (timeout ${this.TIMEOUT_MS / 1000}s). Vérifiez le VPN.`
            : `🔌 API ${environment.name.toUpperCase()} inaccessible. Vérifiez le VPN ou le proxy.`;

          console.warn(`[HealthCheck] ❌ ${msg}`, err);
          this.notif.showWarning(msg);

          return of(result);
        }),
      );
  }
}
