// app.js — Router hash-based con Alpine stores
(function () {
  var rutaInicial = function () {
    var hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  };

  window.appRouter = {
    current: rutaInicial(),
    previous: null,

    init: function () {
      var self = this;
      window.addEventListener('hashchange', function () {
        var nuevaRuta = window.location.hash.replace('#', '') || 'dashboard';
        self.navigate(nuevaRuta);
      });
      // Escuchar eventos de navegación desde Alpine
      document.addEventListener('navigate', function (e) {
        if (e.detail && e.detail.route) {
          self.navigate(e.detail.route);
        }
      });
      // Cargar ruta inicial después de que Alpine esté listo
      if (typeof Alpine !== 'undefined') {
        Alpine.store('router', {
          current: this.current,
          previous: null,
          module: null
        });
      }
      this.loadModule(this.current);
    },

    navigate: function (ruta) {
      if (ruta === this.current) return;
      this.previous = this.current;
      this.current = ruta;
      window.location.hash = ruta;
      if (typeof Alpine !== 'undefined') {
        Alpine.store('router', {
          current: ruta,
          previous: this.previous,
          module: null
        });
      }
      this.loadModule(ruta);
    },

    loadModule: function (ruta) {
      var container = document.getElementById('module-container');
      if (!container) return;

      var self = this;

      // Destroy módulo anterior
      if (this.previous && window.MODULES && window.MODULES[this.previous]) {
        try {
          if (typeof window.MODULES[this.previous].destroy === 'function') {
            window.MODULES[this.previous].destroy();
          }
        } catch (e) {
          console.warn('[app] Error destroying module ' + this.previous + ':', e);
        }
      }

      // Mostrar skeleton
      container.innerHTML = '<div class="space-y-4 p-4"><div class="skeleton h-8 w-64 mb-4"></div><div class="skeleton h-48 w-full mb-2"></div><div class="skeleton h-48 w-full mb-2"></div><div class="skeleton h-48 w-full"></div></div>';

      // Cargar HTML del módulo
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'modules/' + ruta + '/module.html', true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          container.innerHTML = xhr.responseText;

          // Cargar JS del módulo
          var script = document.createElement('script');
          script.src = 'modules/' + ruta + '/module.js';
          script.onload = function () {
            if (window.MODULES && window.MODULES[ruta]) {
              try {
                window.MODULES[ruta].init();
                if (typeof Alpine !== 'undefined') {
                  Alpine.store('router', {
                    current: ruta,
                    previous: self.previous,
                    module: ruta
                  });
                }
              } catch (e) {
                console.error('[app] Error initializing module ' + ruta + ':', e);
                container.innerHTML = '<div class="flex flex-col items-center justify-center py-16 text-error"><i class="bi bi-exclamation-triangle text-6xl mb-4"></i><p class="text-lg">Error al cargar el módulo</p></div>';
              }
            } else {
              console.warn('[app] Module ' + ruta + ' no registró window.MODULES');
            }
          };
          script.onerror = function () {
            container.innerHTML = '<div class="flex flex-col items-center justify-center py-16 text-error"><i class="bi bi-exclamation-triangle text-6xl mb-4"></i><p class="text-lg">Error al cargar ' + ruta + '</p></div>';
          };
          document.body.appendChild(script);
        } else {
          container.innerHTML = '<div class="flex flex-col items-center justify-center py-16 text-base-content/50"><i class="bi bi-question-circle text-6xl mb-4"></i><p class="text-lg">Módulo no encontrado: ' + ruta + '</p></div>';
        }
      };
      xhr.onerror = function () {
        container.innerHTML = '<div class="flex flex-col items-center justify-center py-16 text-error"><i class="bi bi-wifi-off text-6xl mb-4"></i><p class="text-lg">Error de conexión</p></div>';
      };
      xhr.send();
    }
  };

  // Inicializar stores de Alpine
  document.addEventListener('alpine:init', function () {
    if (typeof Alpine === 'undefined') return;

    Alpine.store('router', {
      current: rutaInicial(),
      previous: null,
      module: null
    });

    Alpine.store('network', {
      online: navigator.onLine
    });

    Alpine.store('loading', {
      phase: 'ready',
      visible: false
    });
  });
})();
