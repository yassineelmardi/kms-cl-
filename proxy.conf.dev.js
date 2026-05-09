/**
 * proxy.conf.dev.js — Proxy Angular pour l'environnement DEV
 * Backend  : https://kwp-api.dev3.applis.renault.fr
 * Corp proxy: cosmos-vip.intra.renault.fr:3128
 *
 * Ce fichier route les appels /v1/* vers l'API DEV Renault,
 * en passant par le proxy corporate si nécessaire.
 *
 * Usage : ng serve --proxy-config proxy.conf.dev.js --configuration dev
 */

const BACKEND_DEV = 'https://kwp-api.dev3.applis.renault.fr';

// Proxy corporate Renault — requis pour accéder à kwp-api.dev3 depuis le réseau interne
// Les credentials sont lus depuis la variable d'environnement CORP_PROXY (ne jamais committer de mot de passe)
const { HttpsProxyAgent } = require('https-proxy-agent');
const CORP_PROXY = process.env.CORP_PROXY || 'http://cosmos-vip.intra.renault.fr:3128';
const agent = new HttpsProxyAgent(CORP_PROXY);

module.exports = {
  '/v1': {
    target: BACKEND_DEV,
    secure: false,          // Désactive la vérif SSL (certificats internes Renault)
    changeOrigin: true,     // Masque l'origine localhost → nécessaire CORS
    logLevel: 'info',

    // Proxy corporate Renault pour joindre le backend depuis le réseau interne
    agent,

    onProxyReq(proxyReq, req) {
      console.log(`[PROXY:DEV] ${req.method} ${req.url} → ${BACKEND_DEV}${req.url}`);
    },

    onError(err, req, res) {
      console.error(`[PROXY:DEV] ❌ Erreur de connexion au backend DEV :`, err.message);
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'BACKEND_UNAVAILABLE',
        message: `Impossible de joindre ${BACKEND_DEV}. Vérifiez le VPN ou le proxy corporate.`,
        upstream: err.message,
      }));
    },
  },
};
