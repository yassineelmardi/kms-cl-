/** Interface partagée par tous les environnements */
export interface Environment {
  /** Nom lisible de l'environnement (local | dev | qa | uat | prod) */
  name: 'local' | 'dev' | 'qa' | 'uat' | 'prod';
  /** Passe en true uniquement pour le build production */
  production: boolean;
  /** Active les logs détaillés dans la console */
  debug: boolean;
  /** URL de base de l'API backend (sans trailing slash) */
  apiUrl: string;
  /** Indique si un proxy Angular est utilisé             */
  proxyEnabled: boolean;
  /** Nom de l'application affiché dans l'UI             */
  appName: string;
  /** Token Bearer utilisé par AuthInterceptor            */
  bearerToken: string;
}
