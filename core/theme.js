// theme.js — Inyección de CSS variables y tema
(function () {
  var themeConfig = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    neutral: '#1f2937',
    'base-100': '#ffffff',
    'base-200': '#f3f4f6',
    'base-300': '#d1d5db',
    info: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  };

  var root = document.documentElement;

  function applyTheme(colors) {
    for (var key in colors) {
      if (colors.hasOwnProperty(key)) {
        root.style.setProperty('--p', colors[key]);
      }
    }
  }

  // Alpine store para tema
  document.addEventListener('alpine:init', function () {
    if (typeof Alpine !== 'undefined') {
      Alpine.store('theme', {
        mode: localStorage.getItem('aha_theme_mode') || 'light',
        colors: themeConfig,

        toggle() {
          this.mode = this.mode === 'light' ? 'dark' : 'light';
          localStorage.setItem('aha_theme_mode', this.mode);
          this.apply();
        },

        apply() {
          if (this.mode === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
          } else {
            document.documentElement.setAttribute('data-theme', 'light');
          }
          document.documentElement.setAttribute('data-mode', this.mode);
        }
      });
    }
  });

  // Aplicar tema inicial inmediatamente
  var savedMode = localStorage.getItem('aha_theme_mode') || 'light';
  if (savedMode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  document.documentElement.setAttribute('data-mode', savedMode);
})();
