/**
 * proxy.conf.local.js — Proxy Angular pour l'environnement LOCAL
 * Backend : http://localhost:8083
 * Usage   : ng serve --proxy-config proxy.conf.local.js
 */
module.exports = {
  '/v1': {
    target: 'http://localhost:8083',
    secure: false,
    changeOrigin: true,
    logLevel: 'info',
    onProxyReq(proxyReq, req) {
      console.log(`[PROXY:LOCAL] ${req.method} ${req.url} → http://localhost:8083${req.url}`);
    },
  },
};
