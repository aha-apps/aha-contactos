// license.js — Verificador de licencias AHA offline
window.APP_ID = 'aha-contactos';

window.APP_CONFIG = {
  app: {
    id: 'aha-contactos',
    nombre: 'AHA Contactos',
    version: '1.0.0',
    tipo: 'contactos',
    descripcion: 'CRM manual companion para vendedores'
  },
  plan: 'lite',
  perfil: 'lite',
  iaJutia: { perfil: false },
  maxRecords: 30,
  canExport: false,
  iaTier: 'lite',
  canWhiteLabel: false,
  customer: null,
  modulosActivos: ['dashboard', 'contactos', 'historial', 'plantillas', 'recordatorios'],
  tema: {
    modo: 'light',
    colores: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      neutral: '#1f2937'
    },
    tipografia: 'Inter, system-ui, sans-serif'
  },
  cifrado: {
    camposSensibles: ['notas'],
    storageKey: 'aha_crypto_key'
  },
  modulos: {
    dashboard: { titulo: 'Dashboard', icono: 'bi-speedometer2', activo: true },
    contactos: { titulo: 'Contactos', icono: 'bi-people', activo: true },
    historial: { titulo: 'Historial', icono: 'bi-clock-history', activo: true },
    plantillas: { titulo: 'Plantillas', icono: 'bi-files', activo: true },
    recordatorios: { titulo: 'Recordatorios', icono: 'bi-bell', activo: true }
  },
  data: {
    dir: 'data/',
    maxFileSize: 10485760,
    tipos: ['avatar', 'foto', 'doc', 'logo', 'backup'],
    avatars: { default: 'data/defaults/avatar.svg', size: 200, calidad: 0.8 }
  },
  sync: {
    primaryFormat: 'json',
    secondaryFormats: [],
    includeFiles: true,
    encrypt: true,
    maxExportSize: 52428800
  },
  ui: {
    formsMode: 'modal',
    alerts: 'toast',
    confirmDelete: true,
    avatars: false,
    avatarDefault: 'data/defaults/avatar.svg'
  }
};

// Check license
window.checkLicense = function () {
  if (ENV === 'development') {
    console.log('[license] Development mode — todo desbloqueado');
    return true;
  }
  // En producción, buscaría archivo .aha
  var ahaFile = localStorage.getItem('aha_license_' + window.APP_ID);
  if (ahaFile) {
    try {
      var parsed = JSON.parse(ahaFile);
      if (parsed.plan) {
        for (var key in parsed) {
          if (parsed.hasOwnProperty(key)) {
            window.APP_CONFIG[key] = parsed[key];
          }
        }
        console.log('[license] Licencia aplicada:', parsed.plan);
        return true;
      }
    } catch (e) {
      console.error('[license] Error al cargar licencia:', e);
    }
  }
  console.log('[license] Sin licencia — modo Lite con límites');
  return false;
};

window.cargarLicencia = function () {
  return new Promise(function (resolve, reject) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.aha';
    input.onchange = function (e) {
      var file = e.target.files[0];
      if (!file) { reject(new Error('No se seleccionó archivo')); return; }
      var reader = new FileReader();
      reader.onload = function (ev) {
        try {
          var data = JSON.parse(ev.target.result);
          localStorage.setItem('aha_license_' + window.APP_ID, ev.target.result);
          if (data.plan) {
            for (var key in data) {
              if (data.hasOwnProperty(key)) {
                window.APP_CONFIG[key] = data[key];
              }
            }
          }
          UI.toast('Licencia cargada: ' + (data.plan || 'lite'), 'success');
          resolve(data);
        } catch (err) {
          reject(new Error('Archivo de licencia inválido'));
        }
      };
      reader.onerror = function () { reject(new Error('Error al leer archivo')); };
      reader.readAsText(file);
    };
    input.click();
  });
};
