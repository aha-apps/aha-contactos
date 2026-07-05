// modules/dashboard/module.js
var AHDashboard = {
  id: 'dashboard',
  titulo: 'Dashboard',
  icono: 'bi-speedometer2',
  _chart: null,
  _interval: null,

  init: function () {
    console.log('[dashboard] Inicializado');
    this.cargarDatos();
    // Refrescar cada 30 segundos
    var self = this;
    this._interval = setInterval(function () { self.cargarDatos(); }, 30000);
  },

  destroy: function () {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }
  },

  cargarDatos: function () {
    var self = this;
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    var manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    Promise.all([
      db.contactos.count(),
      db.contactos.filter(function (c) {
        var d = new Date(c.createdAt);
        return d >= hoy && d < manana;
      }).count(),
      db.recordatorios.filter(function (r) {
        return !r.completado;
      }).count(),
      db.recordatorios.filter(function (r) {
        if (r.completado) return false;
        var d = new Date(r.fecha);
        return d >= hoy && d < manana;
      }).count(),
      db.contactos.filter(function (c) { return c.etiqueta === 'cliente'; }).count(),
      db.contactos.filter(function (c) { return c.etiqueta === 'prospecto'; }).count(),
      db.contactos.filter(function (c) { return c.etiqueta === 'VIP'; }).count(),
      db.contactos.filter(function (c) { return c.etiqueta === 'inactivo'; }).count(),
      db.contactos.orderBy('createdAt').reverse().limit(5).toArray(),
      db.contactos.filter(function (c) { return c.etiqueta; }).count()
    ]).then(function (results) {
      self.actualizarUI({
        total: results[0],
        nuevosHoy: results[1],
        pendientesTotal: results[2],
        pendientesHoy: results[3],
        clientes: results[4],
        prospectos: results[5],
        vips: results[6],
        inactivos: results[7],
        ultimos: results[8],
        etiquetados: results[9]
      });
    }).catch(function (err) {
      console.error('[dashboard] Error:', err);
    });
  },

  actualizarUI: function (data) {
    // Stats cards
    var setText = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setText('stat-total', data.total);
    setText('stat-hoy', data.nuevosHoy);
    setText('stat-pendientes', data.pendientesTotal);
    setText('stat-pendientes-hoy', data.pendientesHoy);

    // Últimos contactos
    var listaEl = document.getElementById('ultimos-contactos');
    if (listaEl) {
      if (data.ultimos.length) {
        listaEl.innerHTML = data.ultimos.map(function (c) {
          var badgeColor = { prospecto: 'badge-warning', cliente: 'badge-success', VIP: 'badge-warning text-warning-content', inactivo: '' };
          var bc = badgeColor[c.etiqueta] || 'badge-ghost';
          return '<div class="flex items-center justify-between p-3 hover:bg-base-200 rounded-lg transition-colors cursor-pointer" @click="$dispatch(\'navigate\', {route: \'contactos\'})">\
            <div><div class="font-medium">' + (c.nombre || 'Sin nombre') + '</div>\
            <div class="text-sm text-base-content/50">' + (c.empresa || '') + '</div></div>\
            <span class="badge ' + bc + ' badge-sm">' + (c.etiqueta || '--') + '</span>\
          </div>';
        }).join('');
      } else {
        listaEl.innerHTML = '<div class="text-center py-6 text-base-content/40">No hay contactos aún</div>';
      }
    }

    // Donut chart
    this.renderDonut(data);
  },

  renderDonut: function (data) {
    var canvas = document.getElementById('chart-donut');
    if (!canvas) return;

    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var labels = ['Prospectos', 'Clientes', 'VIP', 'Inactivos'];
    var values = [data.prospectos || 0, data.clientes || 0, data.vips || 0, data.inactivos || 0];
    var colors = ['#f59e0b', '#22c55e', '#eab308', '#6b7280'];

    // Filtrar solo los que tienen valor
    var filteredLabels = [];
    var filteredValues = [];
    var filteredColors = [];
    for (var i = 0; i < values.length; i++) {
      if (values[i] > 0) {
        filteredLabels.push(labels[i]);
        filteredValues.push(values[i]);
        filteredColors.push(colors[i]);
      }
    }

    if (filteredValues.length === 0) {
      canvas.style.display = 'none';
      var parent = canvas.parentNode;
      var emptyMsg = parent.querySelector('.chart-empty');
      if (!emptyMsg) {
        emptyMsg = document.createElement('div');
        emptyMsg.className = 'chart-empty text-center py-8 text-base-content/40';
        emptyMsg.textContent = 'No hay datos para mostrar';
        parent.appendChild(emptyMsg);
      }
      return;
    }

    canvas.style.display = 'block';

    this._chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: filteredLabels,
        datasets: [{
          data: filteredValues,
          backgroundColor: filteredColors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 12, usePointStyle: true, font: { size: 12 } }
          }
        },
        cutout: '65%'
      }
    });
  }
};

window.MODULES = window.MODULES || {};
window.MODULES.dashboard = AHDashboard;
