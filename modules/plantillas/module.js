// modules/plantillas/module.js
var AHPlantillas = {
  id: 'plantillas',
  titulo: 'Plantillas',
  icono: 'bi-files',
  cargando: true,
  items: [],

  categorias: ['saludo', 'seguimiento', 'oferta', 'cobro', 'cierre'],

  init: function () {
    console.log('[plantillas] Inicializado');
    this.cargarDatos();
  },

  destroy: function () {},

  cargarDatos: function () {
    var self = this;
    self.cargando = true;

    db.plantillas.toArray().then(function (data) {
      self.items = data;
      self.cargando = false;
      self.renderGrid();
    }).catch(function (err) {
      console.error('[plantillas] Error:', err);
      self.cargando = false;
    });
  },

  getPorCategoria: function (categoria) {
    return this.items.filter(function (p) { return p.categoria === categoria; });
  },

  getIconoCategoria: function (cat) {
    var icons = {
      saludo: 'bi-hand-wave text-primary',
      seguimiento: 'bi-arrow-repeat text-info',
      oferta: 'bi-gift text-accent',
      cobro: 'bi-credit-card text-warning',
      cierre: 'bi-check-circle text-success'
    };
    return icons[cat] || 'bi-folder';
  },

  getNombreCategoria: function (cat) {
    var nom = {
      saludo: 'Saludo',
      seguimiento: 'Seguimiento',
      oferta: 'Oferta',
      cobro: 'Cobro',
      cierre: 'Cierre'
    };
    return nom[cat] || cat;
  },

  renderGrid: function () {
    var container = document.getElementById('plantillas-grid');
    if (!container) return;

    if (this.cargando) {
      container.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\
        <div class="skeleton h-40"></div><div class="skeleton h-40"></div><div class="skeleton h-40"></div></div>';
      return;
    }

    if (this.items.length === 0) {
      container.innerHTML = '<div class="flex flex-col items-center justify-center py-16 text-base-content/50">\
        <i class="bi bi-files text-6xl mb-4"></i>\
        <p class="text-lg mb-4">No hay plantillas aún</p>\
        <button class="btn btn-primary" onclick="AHPlantillas.abrirForm()"><i class="bi bi-plus-lg"></i> Crear plantilla</button>\
      </div>';
      return;
    }

    var self = this;
    var html = '';

    for (var c = 0; c < this.categorias.length; c++) {
      var cat = this.categorias[c];
      var plantillas = this.getPorCategoria(cat);
      if (plantillas.length === 0) continue;

      html += '<div class="mb-6">\
        <h3 class="font-semibold text-lg mb-3 flex items-center gap-2">\
          <i class="bi ' + this.getIconoCategoria(cat) + '"></i> ' + this.getNombreCategoria(cat) + '\
          <span class="badge badge-ghost badge-sm">' + plantillas.length + '</span>\
        </h3>\
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">';

      for (var p = 0; p < plantillas.length; p++) {
        var plant = plantillas[p];
        html += '<div class="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow">\
          <div class="card-body p-4">\
            <div class="flex items-start justify-between mb-2">\
              <h4 class="font-medium text-sm">' + (plant.nombre || 'Sin nombre') + '</h4>\
              <div class="flex gap-1">\
                <button class="btn btn-xs btn-ghost" onclick="AHPlantillas.copiar(\'' + plant.id + '\')" title="Copiar">\
                  <i class="bi bi-clipboard"></i></button>\
                <button class="btn btn-xs btn-ghost" onclick="AHPlantillas.abrirForm(\'' + plant.id + '\')" title="Editar">\
                  <i class="bi bi-pencil"></i></button>\
                <button class="btn btn-xs btn-ghost text-error" onclick="AHPlantillas.eliminar(\'' + plant.id + '\')" title="Eliminar">\
                  <i class="bi bi-trash"></i></button>\
              </div>\
            </div>\
            <p class="text-sm text-base-content/70 line-clamp-3">' + (plant.contenido || '') + '</p>\
          </div>\
        </div>';
      }

      html += '</div></div>';
    }

    container.innerHTML = html || '<div class="flex flex-col items-center justify-center py-16 text-base-content/50">\
      <i class="bi bi-files text-6xl mb-4"></i><p class="text-lg mb-4">No hay plantillas aún</p>\
      <button class="btn btn-primary" onclick="AHPlantillas.abrirForm()"><i class="bi bi-plus-lg"></i> Crear plantilla</button></div>';
  },

  copiar: function (id) {
    var self = this;
    db.plantillas.get(id).then(function (plantilla) {
      if (!plantilla) { UI.toast('Plantilla no encontrada', 'error'); return; }
      var contenido = plantilla.contenido || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(contenido).then(function () {
          UI.toast('Plantilla copiada al portapapeles', 'success');
        }).catch(function () {
          self._copiarFallback(contenido);
        });
      } else {
        self._copiarFallback(contenido);
      }
    });
  },

  _copiarFallback: function (texto) {
    var ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      UI.toast('Plantilla copiada al portapapeles', 'success');
    } catch (e) {
      UI.toast('Error al copiar', 'error');
    }
    document.body.removeChild(ta);
  },

  abrirForm: function (id) {
    var self = this;
    var editando = !!id;

    if (editando) {
      db.plantillas.get(id).then(function (item) {
        if (!item) { UI.toast('Plantilla no encontrada', 'error'); return; }
        self._mostrarForm(item, true);
      });
    } else {
      self._mostrarForm(null, false);
    }
  },

  _mostrarForm: function (item, editando) {
    var self = this;
    var titulo = editando ? 'Editar Plantilla' : 'Nueva Plantilla';
    var nombre = item ? item.nombre : '';
    var contenido = item ? (item.contenido || '') : '';
    var categoria = item ? (item.categoria || 'saludo') : 'saludo';

    var html = '<div class="space-y-4">\
      <label class="form-control w-full"><span class="label-text">Nombre</span>\
        <input type="text" name="nombre" value="' + nombre + '" class="input input-bordered w-full" required /></label>\
      <label class="form-control w-full"><span class="label-text">Categoría</span>\
        <select name="categoria" class="select select-bordered w-full">\
          <option value="saludo"' + (categoria === 'saludo' ? ' selected' : '') + '>Saludo</option>\
          <option value="seguimiento"' + (categoria === 'seguimiento' ? ' selected' : '') + '>Seguimiento</option>\
          <option value="oferta"' + (categoria === 'oferta' ? ' selected' : '') + '>Oferta</option>\
          <option value="cobro"' + (categoria === 'cobro' ? ' selected' : '') + '>Cobro</option>\
          <option value="cierre"' + (categoria === 'cierre' ? ' selected' : '') + '>Cierre</option>\
        </select></label>\
      <label class="form-control w-full"><span class="label-text">Contenido</span>\
        <textarea name="contenido" class="textarea textarea-bordered w-full" rows="6" required>' + contenido + '</textarea></label>\
      <p class="text-xs text-base-content/40">Usa [nombre], [empresa], [usuario] como placeholders</p>\
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
      contenido: datos.contenido || '',
      categoria: datos.categoria || 'saludo',
      createdBy: APP_CONFIG?.usuarioActual || 'anon',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    var self = this;
    return db.plantillas.put(registro).then(function () {
      UI.toast('Plantilla guardada', 'success');
      self.cargarDatos();
    });
  },

  actualizar: function (id, datos) {
    var self = this;
    return db.plantillas.get(id).then(function (existente) {
      if (!existente) throw new Error('Plantilla no encontrada');
      var actualizado = {
        id: id,
        nombre: datos.nombre,
        contenido: datos.contenido || '',
        categoria: datos.categoria || 'saludo',
        createdBy: existente.createdBy,
        createdAt: existente.createdAt,
        updatedAt: new Date()
      };
      return db.plantillas.put(actualizado).then(function () {
        UI.toast('Plantilla actualizada', 'success');
        self.cargarDatos();
      });
    });
  },

  eliminar: function (id) {
    var self = this;
    UI.confirm('¿Eliminar esta plantilla?').then(function (ok) {
      if (!ok) return;
      db.plantillas.delete(id).then(function () {
        UI.toast('Plantilla eliminada', 'success');
        self.cargarDatos();
      }).catch(function (err) {
        UI.toast('Error: ' + err.message, 'error');
      });
    });
  }
};

window.MODULES = window.MODULES || {};
window.MODULES.plantillas = AHPlantillas;
