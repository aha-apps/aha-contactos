// modules/recordatorios/module.js
var AHRecordatorios = {
  id: 'recordatorios',
  titulo: 'Recordatorios',
  icono: 'bi-bell',
  cargando: true,
  items: [],
  contactos: [],
  filtroPeriodo: 'hoy',

  init: function () {
    console.log('[recordatorios] Inicializado');
    this.cargarDatos();
  },

  destroy: function () {},

  cargarDatos: function () {
    var self = this;
    self.cargando = true;

    Promise.all([
      db.recordatorios.orderBy('fecha').toArray(),
      db.contactos.toArray()
    ]).then(function (results) {
      self.items = results[0];
      self.contactos = results[1];
      self.cargando = false;
      self.renderLista();
    }).catch(function (err) {
      console.error('[recordatorios] Error:', err);
      self.cargando = false;
    });
  },

  getNombreContacto: function (contactoId) {
    if (!contactoId) return '';
    for (var i = 0; i < this.contactos.length; i++) {
      if (this.contactos[i].id === contactoId) return this.contactos[i].nombre || 'Sin nombre';
    }
    return '';
  },

  getFiltrados: function () {
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    var manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    var finSemana = new Date(hoy);
    finSemana.setDate(finSemana.getDate() + 7);

    var items = this.items;

    if (this.filtroPeriodo === 'hoy') {
      items = items.filter(function (r) {
        var d = new Date(r.fecha);
        return d >= hoy && d < manana;
      });
    } else if (this.filtroPeriodo === 'semana') {
      items = items.filter(function (r) {
        var d = new Date(r.fecha);
        return d >= hoy && d < finSemana;
      });
    }
    // 'todos' no filtra

    // Ordenar: no completados primero, luego por fecha
    items = items.sort(function (a, b) {
      if (a.completado !== b.completado) return a.completado ? 1 : -1;
      return new Date(a.fecha) - new Date(b.fecha);
    });

    return items;
  },

  renderLista: function () {
    var container = document.getElementById('recordatorios-lista');
    if (!container) return;

    // Actualizar botones de filtro
    var btns = document.querySelectorAll('.filtro-periodo-btn');
    if (btns.length) {
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('btn-active');
        if (btns[i].dataset.periodo === this.filtroPeriodo) {
          btns[i].classList.add('btn-active');
        }
      }
    }

    var filtrados = this.getFiltrados();

    if (this.cargando) {
      container.innerHTML = '<div class="space-y-3"><div class="skeleton h-16 w-full"></div><div class="skeleton h-16 w-full"></div><div class="skeleton h-16 w-full"></div></div>';
      return;
    }

    if (filtrados.length === 0) {
      var msgs = {
        hoy: 'No tienes recordatorios para hoy',
        semana: 'No tienes recordatorios para esta semana',
        todos: 'No hay recordatorios aún'
      };
      container.innerHTML = '<div class="flex flex-col items-center justify-center py-16 text-base-content/50">\
        <i class="bi bi-bell-slash text-6xl mb-4"></i>\
        <p class="text-lg mb-4">' + (msgs[this.filtroPeriodo] || msgs.todos) + '</p>\
        <button class="btn btn-primary" onclick="AHRecordatorios.abrirForm()"><i class="bi bi-plus-lg"></i> Crear recordatorio</button>\
      </div>';
      return;
    }

    var self = this;

    container.innerHTML = '<div class="space-y-2">' +
      filtrados.map(function (r) {
        var fechaStr = r.fecha ? UI.formatDate(r.fecha) : '--';
        var esHoy = false;
        if (r.fecha) {
          var d = new Date(r.fecha);
          var hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          esHoy = d >= hoy && d < new Date(hoy.getTime() + 86400000);
        }
        var vencido = r.fecha && !r.completado && new Date(r.fecha) < new Date();

        return '<div class="flex items-start gap-3 p-4 bg-base-100 rounded-xl border ' +
          (r.completado ? 'border-success/30 opacity-60' : vencido ? 'border-error/30' : 'border-base-200') + ' hover:shadow-sm transition-shadow">\
          <input type="checkbox" ' + (r.completado ? 'checked' : '') + ' onchange="AHRecordatorios.toggleCompletado(\'' + r.id + '\', this.checked)" \
            class="checkbox ' + (r.completado ? 'checkbox-success' : 'checkbox-primary') + ' mt-1">\
          <div class="flex-1 min-w-0">\
            <div class="flex items-center gap-2 flex-wrap">\
              <span class="font-medium ' + (r.completado ? 'line-through' : '') + '">' + (r.nota || 'Sin nota') + '</span>\
              <span class="badge badge-sm ' + (vencido && !r.completado ? 'badge-error' : esHoy ? 'badge-info' : 'badge-ghost') + '">' +
                (vencido && !r.completado ? '<i class="bi bi-exclamation-triangle mr-1"></i>Vencido' : fechaStr) + '</span>\
            </div>\
            <div class="text-sm text-base-content/50 mt-1" x-show="' + (r.contactoId ? 'true' : 'false') + '">\
              <i class="bi bi-person mr-1"></i>' + self.getNombreContacto(r.contactoId) + '\
            </div>\
          </div>\
          <div class="flex gap-1 shrink-0">\
            <button class="btn btn-xs btn-ghost" onclick="AHRecordatorios.abrirForm(\'' + r.id + '\')"><i class="bi bi-pencil"></i></button>\
            <button class="btn btn-xs btn-ghost text-error" onclick="AHRecordatorios.eliminar(\'' + r.id + '\')"><i class="bi bi-trash"></i></button>\
          </div>\
        </div>';
      }).join('') +
      '</div>';
  },

  toggleCompletado: function (id, completado) {
    var self = this;
    db.recordatorios.get(id).then(function (r) {
      if (!r) return;
      r.completado = completado;
      r.updatedAt = new Date();
      return db.recordatorios.put(r);
    }).then(function () {
      UI.toast(completado ? 'Recordatorio completado' : 'Recordatorio reactivado', 'success');
      self.renderLista();
    }).catch(function (err) {
      UI.toast('Error: ' + err.message, 'error');
    });
  },

  abrirForm: function (id) {
    var self = this;
    var editando = !!id;

    if (editando) {
      db.recordatorios.get(id).then(function (item) {
        if (!item) { UI.toast('Recordatorio no encontrado', 'error'); return; }
        self._mostrarForm(item, true);
      });
    } else {
      self._mostrarForm(null, false);
    }
  },

  _mostrarForm: function (item, editando) {
    var self = this;
    var titulo = editando ? 'Editar Recordatorio' : 'Nuevo Recordatorio';

    var nota = item ? item.nota : '';
    var fecha = item ? (item.fecha ? item.fecha.slice(0, 16) : '') : '';
    var contactoId = item ? (item.contactoId || '') : '';

    var contactosOptions = '<option value="">Sin contacto</option>' +
      this.contactos.map(function (c) {
        var sel = c.id === contactoId ? ' selected' : '';
        return '<option value="' + c.id + '"' + sel + '>' + (c.nombre || 'Sin nombre') + '</option>';
      }).join('');

    if (!editando) {
      fecha = new Date().toISOString().slice(0, 16);
    }

    var html = '<div class="space-y-4">\
      <label class="form-control w-full"><span class="label-text">Nota</span>\
        <input type="text" name="nota" value="' + nota + '" class="input input-bordered w-full" required /></label>\
      <label class="form-control w-full"><span class="label-text">Fecha</span>\
        <input type="datetime-local" name="fecha" value="' + fecha + '" class="input input-bordered w-full" /></label>\
      <label class="form-control w-full"><span class="label-text">Contacto relacionado</span>\
        <select name="contactoId" class="select select-bordered w-full">' + contactosOptions + '</select></label>\
    </div>';

    UI.modalForm(titulo, html, function (data) {
      if (editando) return self.actualizar(item.id, data);
      else return self.guardar(data);
    });
  },

  guardar: function (datos) {
    var registro = {
      id: uuid(),
      nota: datos.nota || '',
      fecha: datos.fecha || new Date().toISOString(),
      contactoId: datos.contactoId || '',
      completado: false,
      createdBy: APP_CONFIG?.usuarioActual || 'anon',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    var self = this;
    return db.recordatorios.put(registro).then(function () {
      UI.toast('Recordatorio guardado', 'success');
      self.cargarDatos();
    });
  },

  actualizar: function (id, datos) {
    var self = this;
    return db.recordatorios.get(id).then(function (existente) {
      if (!existente) throw new Error('Recordatorio no encontrado');
      var actualizado = {
        id: id,
        nota: datos.nota || '',
        fecha: datos.fecha || existente.fecha,
        contactoId: datos.contactoId || '',
        completado: existente.completado,
        createdBy: existente.createdBy,
        createdAt: existente.createdAt,
        updatedAt: new Date()
      };
      return db.recordatorios.put(actualizado).then(function () {
        UI.toast('Recordatorio actualizado', 'success');
        self.cargarDatos();
      });
    });
  },

  eliminar: function (id) {
    var self = this;
    UI.confirm('¿Eliminar este recordatorio?').then(function (ok) {
      if (!ok) return;
      db.recordatorios.delete(id).then(function () {
        UI.toast('Recordatorio eliminado', 'success');
        self.cargarDatos();
      }).catch(function (err) {
        UI.toast('Error: ' + err.message, 'error');
      });
    });
  },

  filtrar: function (periodo) {
    this.filtroPeriodo = periodo;
    this.renderLista();
  }
};

window.MODULES = window.MODULES || {};
window.MODULES.recordatorios = AHRecordatorios;
