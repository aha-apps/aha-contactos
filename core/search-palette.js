// search-palette.js — Command Palette (Ctrl+K) global
(function () {
  var paletteOpen = false;
  var selectedIdx = 0;
  var keyboardNav = false;
  var query = '';

  var modules = [
    { id: 'dashboard', title: 'Dashboard', icon: 'bi-speedometer2', type: 'module' },
    { id: 'contactos', title: 'Contactos', icon: 'bi-people', type: 'module' },
    { id: 'historial', title: 'Historial', icon: 'bi-clock-history', type: 'module' },
    { id: 'plantillas', title: 'Plantillas', icon: 'bi-files', type: 'module' },
    { id: 'recordatorios', title: 'Recordatorios', icon: 'bi-bell', type: 'module' }
  ];

  function filterItems(q) {
    if (!q || q.length < 2) return modules;
    var lower = q.toLowerCase();
    var results = [];
    // Módulos
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].title.toLowerCase().indexOf(lower) !== -1) {
        results.push(modules[i]);
      }
    }
    // Registros (si IA disponible)
    if (window.ia && typeof window.ia.search === 'function') {
      // Los resultados IA se agregarían aquí
    }
    return results;
  }

  function buildPaletteHTML() {
    return '<div id="search-palette" class="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh]" style="display:none" @click.away="closePalette">\
      <div class="absolute inset-0 bg-base-300/60 backdrop-blur-sm" id="sp-overlay"></div>\
      <div class="relative w-full max-w-xl">\
        <div class="bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden">\
          <div class="flex items-center gap-3 px-5 py-4 border-b border-base-200">\
            <svg class="w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">\
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>\
            </svg>\
            <input id="sp-input" type="text" class="flex-1 bg-transparent border-0 outline-none text-base placeholder:text-base-content/30" placeholder="Buscar módulos...">\
            <kbd class="hidden sm:inline-flex px-2 py-0.5 text-xs rounded bg-base-200 text-base-content/50">ESC</kbd>\
          </div>\
          <div id="sp-results" class="max-h-80 overflow-y-auto p-2"></div>\
          <div class="flex items-center gap-4 px-5 py-2.5 border-t border-base-200 text-xs text-base-content/40">\
            <span class="flex items-center gap-1"><kbd class="kbd kbd-xs">↑↓</kbd> Navegar</span>\
            <span class="flex items-center gap-1"><kbd class="kbd kbd-xs">↵</kbd> Abrir</span>\
            <span class="flex items-center gap-1"><kbd class="kbd kbd-xs">Esc</kbd> Cerrar</span>\
          </div>\
        </div>\
      </div>\
    </div>';
  }

  function renderResults(items) {
    var container = document.getElementById('sp-results');
    if (!container) return;

    if (!query || query.length < 2) {
      container.innerHTML = '<div class="px-3 py-2 text-xs font-semibold text-base-content/40 uppercase tracking-wider">Módulos</div>' +
        items.map(function (item, i) {
          return '<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors sp-item" data-idx="' + i + '" data-id="' + item.id + '" data-type="' + item.type + '">\
            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-base-200 text-base-content/60 shrink-0"><i class="bi ' + item.icon + ' text-sm"></i></div>\
            <div class="flex-1 min-w-0"><div class="text-sm font-medium truncate">' + item.title + '</div></div>\
            <span class="badge badge-ghost badge-sm">módulo</span>\
          </div>';
        }).join('');
      return;
    }

    if (items.length === 0) {
      container.innerHTML = '<div class="px-3 py-8 text-center text-sm text-base-content/40">\
        <svg class="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">\
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>\
        </svg>\
        Sin resultados para "<span class="font-medium">' + query + '</span>"\
      </div>';
      return;
    }

    container.innerHTML = '<div class="px-3 py-2 text-xs font-semibold text-base-content/40 uppercase tracking-wider">Módulos</div>' +
      items.map(function (item, i) {
        return '<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors sp-item" data-idx="' + i + '" data-id="' + item.id + '" data-type="' + item.type + '">\
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-base-200 text-base-content/60 shrink-0"><i class="bi ' + item.icon + ' text-sm"></i></div>\
          <div class="flex-1 min-w-0"><div class="text-sm font-medium truncate">' + item.title + '</div></div>\
          <span class="badge badge-ghost badge-sm">módulo</span>\
        </div>';
      }).join('');
  }

  function selectItem(id) {
    closePalette();
    if (window.appRouter) {
      window.appRouter.navigate(id);
    }
  }

  function openPalette() {
    if (paletteOpen) return;
    paletteOpen = true;
    selectedIdx = 0;
    keyboardNav = true;
    query = '';

    var existing = document.getElementById('search-palette');
    if (existing) existing.parentNode.removeChild(existing);

    var div = document.createElement('div');
    div.id = 'search-palette-container';
    div.innerHTML = buildPaletteHTML();
    document.body.appendChild(div);

    var palette = document.getElementById('search-palette');
    palette.style.display = 'flex';

    var input = document.getElementById('sp-input');
    input.focus();

    var items = filterItems('');
    renderResults(items);

    // Overlay click
    document.getElementById('sp-overlay').addEventListener('click', closePalette);

    // Input handler
    input.addEventListener('input', function () {
      query = this.value;
      selectedIdx = 0;
      keyboardNav = true;
      var results = filterItems(query);
      renderResults(results);
    });

    // Item click delegation
    document.getElementById('sp-results').addEventListener('click', function (e) {
      var item = e.target.closest('.sp-item');
      if (item) {
        selectItem(item.dataset.id);
      }
    });

    // Keyboard
    input.addEventListener('keydown', function (e) {
      var items = document.querySelectorAll('.sp-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
        updateHighlight(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIdx = Math.max(selectedIdx - 1, 0);
        updateHighlight(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIdx]) {
          selectItem(items[selectedIdx].dataset.id);
        }
      } else if (e.key === 'Escape') {
        closePalette();
      }
    });
  }

  function updateHighlight(items) {
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove('bg-primary/10', 'text-primary');
      if (i === selectedIdx) {
        items[i].classList.add('bg-primary/10', 'text-primary');
        items[i].scrollIntoView({ block: 'nearest' });
      }
    }
  }

  function closePalette() {
    paletteOpen = false;
    var container = document.getElementById('search-palette-container');
    if (container) {
      container.parentNode.removeChild(container);
    }
  }

  // Global keyboard shortcut
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      // No abrir si está enfocado en input
      var tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      openPalette();
    }
    if (e.key === 'Escape' && paletteOpen) {
      closePalette();
    }
  });

  // Exponer para Alpine
  window.searchPalette = {
    open: function () { openPalette(); },
    close: function () { closePalette(); }
  };
})();
