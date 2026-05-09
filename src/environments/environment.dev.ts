import { Environment } from './environment.interface';

// ── Environnement DEV ─────────────────────────────────────────
// Démarrage : npm run start:dev
// Backend   : https://kwp-api.dev3.applis.renault.fr
// Proxy     : via proxy.conf.dev.js (proxy corporate cosmos-vip)
// ⚠️  Mettre à jour bearerToken si expiré
export const environment: Environment = {
  name: 'dev',
  production: false,
  debug: true,
  apiUrl: 'https://kwp-api.dev3.applis.renault.fr',
  proxyEnabled: true,
  appName: 'KMS — Crypto Key Manager [DEV]',
  bearerToken: '',
};
