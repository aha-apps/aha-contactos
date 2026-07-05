// main.js — Entry point AHA Contactos
(function () {
  console.log('🔷 AHA Contactos v1.0.0');

  function init() {
    try {
      // Verificar licencia
      if (window.checkLicense) {
        window.checkLicense();
      }

      // Inicializar network monitor
      if (window.network && window.network.init) {
        window.network.init();
      }

      // Sembrar datos semilla
      if (window.SeedEngine) {
        window.SeedEngine.sembrar().then(function () {
          console.log('[seed] Datos semilla listos');
        }).catch(function (err) {
          console.warn('[seed] Error:', err);
        });
      }

      // Iniciar router
      if (window.appRouter) {
        window.appRouter.init();
      }

      // Registrar service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(function () {
          console.log('[sw] Service Worker registrado');
        }).catch(function (err) {
          console.warn('[sw] Error registrando SW:', err);
        });
      }

      console.log('✅ AHA Contactos inicializado');
    } catch (e) {
      console.error('[main] Error de inicialización:', e);
    }
  }

  // Esperar que Alpine y Dexie estén listos
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
