// modules/historial/module.js
var AHHistorial = {
  id: 'historial',
  titulo: 'Historial',
  icono: 'bi-clock-history',
  cargando: true,
  items: [],
  contactoFiltro: '',
  contactos: [],

  init: function () {
    console.log('[historial] Inicializado');
    this.cargarDatos();
  },

  destroy: function () {},

  cargarDatos: function () {
    var self = this;
    self.cargando = true;

    Promise.all([
      db.historial.orderBy('fecha').reverse().toArray(),
      db.contactos.toArray()
    ]).then(function (results) {
      self.items = results[0];
      self.contactos = results[1];
      self.cargando = false;
      self.renderLista();
    }).catch(function (err) {
      console.error('[historial] Error:', err);
      self.cargando = false;
    });
  },

  getNombreContacto: function (contactoId) {
    if (!contactoId) return '--';
    for (var i = 0; i < this.contactos.length; i++) {
      if (this.contactos[i].id === contactoId) return this.contactos[i].nombre || 'Sin nombre';
    }
    return 'Contacto eliminado';
  },

  getFiltrados: function () {
    var items = this.items;
    if (this.contactoFiltro) {
      items = items.filter(function (h) { return h.contactoId === this; }.bind(this.contactoFiltro));
    }
    return items;
  },

  renderLista: function () {
    var container = document.getElementById('historial-lista');
    if (!container) return;

    // Selector de contacto
    var selectContainer = document.getElementById('historial-filtro-contacto');
    if (selectContainer) {
      var allOption = '<option value="">Todos los contactos</option>';
      var options = this.contactos.map(function (c) {
        var sel = c.id === this.contactoFiltro ? ' selected' : '';
        return '<option value="' + c.id + '"' + sel + '>' + (c.nombre || 'Sin nombre') + '</option>';
      }.bind(this));
      selectContainer.innerHTML = '<select class="select select-bordered w-full max-w-xs" onchange="AHHistorial.filtrarPorContacto(this.value)">' +
        allOption + options.join('') + '</select>';
    }

    var filtrados = this.getFiltrados();

    if (this.cargando) {
      container.innerHTML = '<div class="space-y-4"><div class="skeleton h-16 w-full"></div><div class="skeleton h-16 w-full"></div><div class="skeleton h-16 w-full"></div></div>';
      return;
    }

    if (filtrados.length === 0) {
      container.innerHTML = '<div class="flex flex-col items-center justify-center py-16 text-base-content/50">\
        <i class="bi bi-clock-history text-6xl mb-4"></i>\
        <p class="text-lg mb-4">' + (this.contactoFiltro ? 'Sin historial para este contacto' : 'No hay historial aún') + '</p>\
        <button class="btn btn-primary" onclick="AHHistorial.abrirForm()"><i class="bi bi-plus-lg"></i> Registrar interacción</button>\
      </div>';
      return;
    }

    var tipoIcon = {
      llamada: 'bi-telephone text-success',
      mensaje: 'bi-chat-dots text-info',
      reunion: 'bi-calendar-event text-warning',
      nota: 'bi-stickies text-base-content/60'
    };

    var tipoColor = {
      llamada: 'border-l-success',
      mensaje: 'border-l-info',
      reunion: 'border-l-warning',
      nota: 'border-l-base-content/30'
    };

    container.innerHTML = '<div class="relative pl-8 space-y-0">' +
      '<div class="absolute left-4 top-0 bottom-0 w-0.5 bg-base-200"></div>' +
      filtrados.map(function (h) {
        var icon = tipoIcon[h.tipo] || 'bi-question-circle';
        var border = tipoColor[h.tipo] || 'border-l-base-content/30';
        var fecha = h.fecha ? UI.formatDate(h.fecha) + ' ' + (h.fecha.length > 10 ? h.fecha.slice(11, 16) : '') : '--';
        return '<div class="relative pb-6 pl-4 border-l-2 ' + border + ' ml-[-1.5rem]">\
          <div class="absolute -left-3 top-0 w-6 h-6 rounded-full bg-base-100 border-2 border-base-200 flex items-center justify-center">\
            <i class="bi ' + icon + ' text-xs"></i>\
          </div>\
          <div class="ml-2">\
            <div class="flex items-center gap-2 flex-wrap">\
              <span class="font-medium">' + (h.descripcion || 'Sin descripción') + '</span>\
              <span class="badge badge-ghost badge-sm">' + (h.tipo || '--') + '</span>\
            </div>\
            <div class="text-sm text-base-content/50 mt-1">\
              <span>' + this.getNombreContacto(h.contactoId) + '</span>\
              <span class="mx-1">·</span>\
              <span>' + fecha + '</span>\
            </div>\
          </div>\
        </div>';
      }.bind(this)).join('') +
      '</div>';
  },

  abrirForm: function () {
    var self = this;
    var contactosOptions = '<option value="">Seleccionar contacto (opcional)</option>' +
      this.contactos.map(function (c) {
        return '<option value="' + c.id + '">' + (c.nombre || 'Sin nombre') + '</option>';
      }).join('');

    var html = '<div class="space-y-4">\
      <label class="form-control w-full"><span class="label-text">Contacto</span>\
        <select name="contactoId" class="select select-bordered w-full">' + contactosOptions + '</select></label>\
      <label class="form-control w-full"><span class="label-text">Tipo</span>\
        <select name="tipo" class="select select-bordered w-full">\
          <option value="llamada">Llamada</option>\
          <option value="mensaje">Mensaje</option>\
          <option value="reunion">Reunión</option>\
          <option value="nota">Nota</option>\
        </select></label>\
      <label class="form-control w-full"><span class="label-text">Descripción</span>\
        <textarea name="descripcion" class="textarea textarea-bordered w-full" rows="3" required></textarea></label>\
      <label class="form-control w-full"><span class="label-text">Fecha</span>\
        <input type="datetime-local" name="fecha" class="input input-bordered w-full" /></label>\
    </div>';

    UI.modalForm('Registrar Interacción', html, function (data) {
      return self.guardar(data);
    });
  },

  guardar: function (datos) {
    var fecha = datos.fecha || new Date().toISOString().slice(0, 16);
    var registro = {
      id: uuid(),
      contactoId: datos.contactoId || '',
      tipo: datos.tipo || 'nota',
      descripcion: datos.descripcion || '',
      fecha: fecha,
      createdAt: new Date()
    };
    var self = this;

    return db.historial.put(registro).then(function () {
      // Actualizar ultimoContacto del contacto si aplica
      if (registro.contactoId) {
        db.contactos.get(registro.contactoId).then(function (c) {
          if (c) {
            c.ultimoContacto = fecha;
            c.updatedAt = new Date();
            db.contactos.put(c);
          }
        });
      }
      UI.toast('Interacción registrada', 'success');
      self.cargarDatos();
    });
  },

  eliminar: function (id) {
    var self = this;
    UI.confirm('¿Eliminar este registro del historial?').then(function (ok) {
      if (!ok) return;
      db.historial.delete(id).then(function () {
        UI.toast('Registro eliminado', 'success');
        self.cargarDatos();
      }).catch(function (err) {
        UI.toast('Error: ' + err.message, 'error');
      });
    });
  },

  filtrarPorContacto: function (contactoId) {
    this.contactoFiltro = contactoId;
    this.renderLista();
  }
};

window.MODULES = window.MODULES || {};
window.MODULES.historial = AHHistorial;
