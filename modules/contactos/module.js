// modules/contactos/module.js
var AHContactos = {
  id: 'contactos',
  titulo: 'Contactos',
  icono: 'bi-people',
  busqueda: '',
  items: [],
  cargando: true,
  filtroEtiqueta: '',

  init: function () {
    console.log('[contactos] Inicializado');
    this.cargarLista();
  },

  destroy: function () {
    // No cleanup needed
  },

  cargarLista: function () {
    var self = this;
    self.cargando = true;

    var coleccion = db.contactos.orderBy('createdAt').reverse();

    coleccion.toArray().then(function (data) {
      self.items = data;
      self.cargando = false;
      self.renderLista();
    }).catch(function (err) {
      console.error('[contactos] Error:', err);
      self.cargando = false;
    });
  },

  getFiltrados: function () {
    var items = this.items;
    var busq = (this.busqueda || '').toLowerCase();
    var etiq = this.filtroEtiqueta || '';

    if (busq) {
      items = items.filter(function (c) {
        return (c.nombre && c.nombre.toLowerCase().indexOf(busq) !== -1) ||
               (c.telefono && c.telefono.indexOf(busq) !== -1) ||
               (c.email && c.email.toLowerCase().indexOf(busq) !== -1) ||
               (c.empresa && c.empresa.toLowerCase().indexOf(busq) !== -1);
      });
    }
    if (etiq) {
      items = items.filter(function (c) { return c.etiqueta === etiq; });
    }
    return items;
  },

  renderLista: function () {
    var container = document.getElementById('contactos-lista');
    if (!container) return;

    var filtrados = this.getFiltrados();

    if (this.cargando) {
      container.innerHTML = '<div class="space-y-3"><div class="skeleton h-12 w-full"></div><div class="skeleton h-12 w-full"></div><div class="skeleton h-12 w-full"></div></div>';
      return;
    }

    if (filtrados.length === 0) {
      container.innerHTML = '<div class="flex flex-col items-center justify-center py-16 text-base-content/50">\
        <i class="bi bi-people text-6xl mb-4"></i>\
        <p class="text-lg mb-4">' + (this.busqueda ? 'Sin resultados para "' + this.busqueda + '"' : 'No hay contactos aún') + '</p>\
        <button class="btn btn-primary" onclick="AHContactos.abrirForm()"><i class="bi bi-plus-lg"></i> Agregar primero</button>\
      </div>';
      return;
    }

    var self = this;
    var badgeColor = { prospecto: 'badge-warning', cliente: 'badge-success', VIP: 'badge-warning text-warning-content', inactivo: 'badge-ghost' };

    container.innerHTML = '<div class="overflow-x-auto">\
      <table class="table table-zebra">\
        <thead><tr><th>Nombre</th><th class="hidden md:table-cell">Teléfono</th><th class="hidden lg:table-cell">Email</th><th class="hidden md:table-cell">Empresa</th><th>Etiqueta</th><th>Acciones</th></tr></thead>\
        <tbody>' +
        filtrados.map(function (c) {
          var bc = badgeColor[c.etiqueta] || 'badge-ghost';
          return '<tr>\
            <td><div class="font-medium">' + (c.nombre || 'Sin nombre') + '</div></td>\
            <td class="hidden md:table-cell">' + (c.telefono || '--') + '</td>\
            <td class="hidden lg:table-cell">' + (c.email || '--') + '</td>\
            <td class="hidden md:table-cell">' + (c.empresa || '--') + '</td>\
            <td><span class="badge ' + bc + ' badge-sm">' + (c.etiqueta || '--') + '</span></td>\
            <td><div class="flex gap-1">\
              <button class="btn btn-xs btn-ghost" onclick="AHContactos.abrirForm(\'' + c.id + '\')"><i class="bi bi-pencil"></i></button>\
              <button class="btn btn-xs btn-ghost text-error" onclick="AHContactos.eliminar(\'' + c.id + '\')"><i class="bi bi-trash"></i></button>\
            </div></td>\
          </tr>';
        }).join('') +
        '</tbody></table></div>';
  },

  abrirForm: function (id) {
    var self = this;
    var editando = !!id;

    if (editando) {
      db.contactos.get(id).then(function (item) {
        if (!item) { UI.toast('Contacto no encontrado', 'error'); return; }
        self._mostrarForm(item, true);
      });
    } else {
      self._mostrarForm(null, false);
    }
  },

  _mostrarForm: function (item, editando) {
    var self = this;
    var titulo = editando ? 'Editar Contacto' : 'Nuevo Contacto';

    var nombre = item ? item.nombre : '';
    var telefono = item ? item.telefono : '';
    var email = item ? item.email : '';
    var empresa = item ? item.empresa : '';
    var notas = item ? (item.notas ? cryptoHelpers.decrypt(item.notas) : '') : '';
    var etiqueta = item ? (item.etiqueta || 'prospecto') : 'prospecto';

    var html = '<div class="space-y-4">\
      <label class="form-control w-full"><span class="label-text">Nombre</span>\
        <input type="text" name="nombre" value="' + nombre + '" class="input input-bordered w-full" required /></label>\
      <label class="form-control w-full"><span class="label-text">Teléfono</span>\
        <input type="tel" name="telefono" value="' + telefono + '" class="input input-bordered w-full" /></label>\
      <label class="form-control w-full"><span class="label-text">Email</span>\
        <input type="email" name="email" value="' + email + '" class="input input-bordered w-full" /></label>\
      <label class="form-control w-full"><span class="label-text">Empresa</span>\
        <input type="text" name="empresa" value="' + empresa + '" class="input input-bordered w-full" /></label>\
      <label class="form-control w-full"><span class="label-text">Etiqueta</span>\
        <select name="etiqueta" class="select select-bordered w-full">\
          <option value="prospecto"' + (etiqueta === 'prospecto' ? ' selected' : '') + '>Prospecto</option>\
          <option value="cliente"' + (etiqueta === 'cliente' ? ' selected' : '') + '>Cliente</option>\
          <option value="VIP"' + (etiqueta === 'VIP' ? ' selected' : '') + '>VIP</option>\
          <option value="inactivo"' + (etiqueta === 'inactivo' ? ' selected' : '') + '>Inactivo</option>\
        </select></label>\
      <label class="form-control w-full"><span class="label-text">Notas</span>\
        <textarea name="notas" class="textarea textarea-bordered w-full" rows="3">' + notas + '</textarea></label>\
    </div>';

    UI.modalForm(titulo, html, function (data) {
      if (editando) return self.actualizar(item.id, data);
      else return self.guardar(data);
    });
  },

  guardar: function (datos) {
    var registro = {
      id: uuid(),
      nombre: datos.nombre,
      telefono: datos.telefono || '',
      email: datos.email || '',
      empresa: datos.empresa || '',
      etiqueta: datos.etiqueta || 'prospecto',
      notas: datos.notas ? cryptoHelpers.encrypt(datos.notas) : '',
      ultimoContacto: null,
      createdBy: APP_CONFIG?.usuarioActual || 'anon',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return db.contactos.put(registro).then(function () {
      UI.toast('Contacto guardado', 'success');
      AHContactos.cargarLista();
    });
  },

  actualizar: function (id, datos) {
    var self = this;
    return db.contactos.get(id).then(function (existente) {
      if (!existente) throw new Error('Contacto no encontrado');
      var actualizado = {
        id: id,
        nombre: datos.nombre,
        telefono: datos.telefono || '',
        email: datos.email || '',
        empresa: datos.empresa || '',
        etiqueta: datos.etiqueta || 'prospecto',
        notas: datos.notas ? cryptoHelpers.encrypt(datos.notas) : '',
        ultimoContacto: existente.ultimoContacto,
        createdBy: existente.createdBy,
        createdAt: existente.createdAt,
        updatedAt: new Date()
      };
      return db.contactos.put(actualizado).then(function () {
        UI.toast('Contacto actualizado', 'success');
        self.cargarLista();
      });
    });
  },

  eliminar: function (id) {
    var self = this;
    UI.confirm('¿Eliminar este contacto? Se eliminará también su historial y recordatorios.').then(function (ok) {
      if (!ok) return;
      var p1 = db.contactos.delete(id);
      var p2 = db.historial.where('contactoId').equals(id).delete();
      var p3 = db.recordatorios.where('contactoId').equals(id).delete();
      Promise.all([p1, p2, p3]).then(function () {
        UI.toast('Contacto eliminado', 'success');
        self.cargarLista();
      }).catch(function (err) {
        UI.toast('Error: ' + err.message, 'error');
      });
    });
  },

  exportCSV: function () {
    var filtrados = this.getFiltrados();
    if (!filtrados.length) { UI.toast('No hay contactos para exportar', 'warning'); return; }

    var headers = ['Nombre', 'Teléfono', 'Email', 'Empresa', 'Etiqueta', 'Notas'];
    var rows = filtrados.map(function (c) {
      return [
        self.csvEscape(c.nombre || ''),
        self.csvEscape(c.telefono || ''),
        self.csvEscape(c.email || ''),
        self.csvEscape(c.empresa || ''),
        self.csvEscape(c.etiqueta || ''),
        self.csvEscape(c.notas ? cryptoHelpers.decrypt(c.notas) : '')
      ].join(',');
    });
    var self = this;
    var csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'contactos-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    UI.toast('CSV exportado (' + filtrados.length + ' contactos)', 'success');
  },

  csvEscape: function (str) {
    if (!str) return '""';
    return '"' + str.replace(/"/g, '""') + '"';
  },

  filtrar: function (busqueda) {
    this.busqueda = busqueda;
    this.renderLista();
  },

  filtrarPorEtiqueta: function (etiqueta) {
    this.filtroEtiqueta = this.filtroEtiqueta === etiqueta ? '' : etiqueta;
    this.renderLista();
  }
};

window.MODULES = window.MODULES || {};
window.MODULES.contactos = AHContactos;
