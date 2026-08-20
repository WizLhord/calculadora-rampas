// js/app.js
// Ponto de entrada do app. Só faz duas coisas: inicia a interface e
// registra o service worker (para funcionar offline / ser instalável).

import { initUI } from './ui.js';

initUI();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Falha de registro não deve travar o app — ele segue funcionando
      // normalmente online, só sem o modo offline.
    });
  });
}
