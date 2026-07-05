// ui.js — API estándar de UI expuesta en window.UI
window.UI = {
  toast: function (msg, tipo, duracion) {
    tipo = tipo || 'info';
    duracion = duracion || 4000;

    var icons = {
      success: 'bi-check-circle-fill text-success',
      error: 'bi-exclamation-circle-fill text-error',
      warning: 'bi-exclamation-triangle-fill text-warning',
      info: 'bi-info-circle-fill text-info'
    };

    var colors = {
      success: 'alert-success',
      error: 'alert-error',
      warning: 'alert-warning',
      info: 'alert-info'
    };

    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast toast-top toast-end z-[100]';
      document.body.appendChild(container);
    }

    var el = document.createElement('div');
    el.className = 'alert ' + (colors[tipo] || 'alert-info') + ' shadow-lg animate__animated animate__fadeInRight mb-2 max-w-sm';
    el.innerHTML = '<div><i class="bi ' + (icons[tipo] || icons.info) + ' mr-2"></i><span>' + msg + '</span></div>';

    container.appendChild(el);

    setTimeout(function () {
      if (el.parentNode) {
        el.style.transition = 'opacity 0.3s';
        el.style.opacity = '0';
        setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 300);
      }
    }, duracion);
  },

  confirm: function (msg, titulo) {
    titulo = titulo || 'Confirmar';
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-[60] flex items-center justify-center bg-base-300/60 backdrop-blur-sm animate__animated animate__fadeIn';
      overlay.innerHTML = '<div class="modal-box max-w-sm">\
        <h3 class="font-bold text-lg mb-2">' + titulo + '</h3>\
        <p class="py-2 text-base-content/70">' + msg + '</p>\
        <div class="modal-action">\
          <button class="btn btn-ghost cancel-btn">Cancelar</button>\
          <button class="btn btn-primary confirm-btn">Aceptar</button>\
        </div>\
      </div>';
      document.body.appendChild(overlay);

      var cleanup = function (result) {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        resolve(result);
      };

      overlay.querySelector('.confirm-btn').addEventListener('click', function () { cleanup(true); });
      overlay.querySelector('.cancel-btn').addEventListener('click', function () { cleanup(false); });
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) cleanup(false);
      });
    });
  },

  modalForm: function (titulo, html, onSave) {
    var id = 'modal-' + uuid().slice(0, 8);
    var overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'fixed inset-0 z-[60] flex items-center justify-center bg-base-300/60 backdrop-blur-sm animate__animated animate__fadeIn';
    overlay.innerHTML = '<div class="modal-box max-w-lg">\
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">\
        <i class="bi bi-pencil-square"></i> ' + titulo + '\
      </h3>\
      <form @submit.prevent="handleSubmit">\
        <div id="form-body-' + id + '" class="space-y-4">' + html + '</div>\
        <div class="modal-action">\
          <button type="button" class="btn btn-ghost cancel-btn">Cancelar</button>\
          <button type="submit" class="btn btn-primary">\
            <i class="bi bi-check-lg"></i> Guardar\
          </button>\
        </div>\
      </form>\
    </div>';

    document.body.appendChild(overlay);

    var form = overlay.querySelector('form');
    var inputs = overlay.querySelectorAll('input, select, textarea');

    var collectData = function () {
      var data = {};
      inputs.forEach(function (input) {
        if (input.type === 'checkbox') {
          data[input.name || input.id] = input.checked;
        } else if (input.type === 'radio') {
          if (input.checked) data[input.name || input.id] = input.value;
        } else {
          data[input.name || input.id] = input.value;
        }
      });
      return data;
    };

    var cleanup = function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = collectData();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Guardando...';
      }
      Promise.resolve(onSave(data)).then(function () {
        cleanup();
      }).catch(function (err) {
        UI.toast(err.message || 'Error al guardar', 'error');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-check-lg"></i> Guardar';
        }
      });
    });

    overlay.querySelector('.cancel-btn').addEventListener('click', cleanup);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) cleanup();
    });
  },

  loading: function (show) {
    var el = document.getElementById('loading-overlay');
    if (show) {
      if (!el) {
        el = document.createElement('div');
        el.id = 'loading-overlay';
        el.className = 'fixed inset-0 z-[70] flex items-center justify-center bg-base-300/50 backdrop-blur-sm';
        el.innerHTML = '<span class="loading loading-spinner loading-lg text-primary"></span>';
        document.body.appendChild(el);
      }
      el.style.display = 'flex';
    } else {
      if (el) el.style.display = 'none';
    }
  },

  formatDate: function (date) {
    if (!date) return '';
    var d = new Date(date);
    if (isNaN(d.getTime())) return '';
    var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
  },

  formatCurrency: function (n) {
    if (n === null || n === undefined) return '$0.00';
    return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  formatBytes: function (bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatRelative: function (date) {
    if (!date) return '';
    var d = new Date(date);
    if (isNaN(d.getTime())) return '';
    var ahora = new Date();
    var diff = Math.floor((ahora - d) / 1000);
    if (diff < 60) return 'hace ' + diff + ' segundos';
    if (diff < 3600) return 'hace ' + Math.floor(diff / 60) + ' minutos';
    if (diff < 86400) return 'hace ' + Math.floor(diff / 3600) + ' horas';
    if (diff < 604800) return 'hace ' + Math.floor(diff / 86400) + ' días';
    return this.formatDate(date);
  }
};
