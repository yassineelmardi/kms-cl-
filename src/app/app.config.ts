import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { ThemeService } from './services/theme.service';
import { HealthCheckService } from './services/health-check.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),

    // Initialise le thème depuis localStorage avant le premier rendu
    {
      provide: APP_INITIALIZER,
      useFactory: (themeService: ThemeService) => () => themeService,
      deps: [ThemeService],
      multi: true,
    },

    // Vérifie la disponibilité de l'API backend au démarrage (sauf LOCAL)
    {
      provide: APP_INITIALIZER,
      useFactory: (healthCheck: HealthCheckService) => () => healthCheck.checkOnStartup(),
      deps: [HealthCheckService],
      multi: true,
    },
  ]
};

