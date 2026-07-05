// project.config.js — Configuración de AHA Contactos
window.APP_CONFIG = window.APP_CONFIG || {};

// Extender configuración si no está definida por license.js
if (!window.APP_CONFIG.app) {
  window.APP_CONFIG.app = {
    id: 'aha-contactos',
    nombre: 'AHA Contactos',
    version: '1.0.0',
    tipo: 'contactos',
    descripcion: 'CRM manual companion para vendedores'
  };
}

if (!window.APP_CONFIG.perfil) {
  window.APP_CONFIG.perfil = 'lite';
}

if (!window.APP_CONFIG.iaJutia) {
  window.APP_CONFIG.iaJutia = { perfil: false };
}

if (!window.APP_CONFIG.modulosActivos) {
  window.APP_CONFIG.modulosActivos = ['dashboard', 'contactos', 'historial', 'plantillas', 'recordatorios'];
}

if (!window.APP_CONFIG.tema) {
  window.APP_CONFIG.tema = {
    modo: 'light',
    colores: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      neutral: '#1f2937'
    },
    tipografia: 'Inter, system-ui, sans-serif'
  };
}

if (!window.APP_CONFIG.cifrado) {
  window.APP_CONFIG.cifrado = {
    camposSensibles: ['notas'],
    storageKey: 'aha_crypto_key'
  };
}

if (!window.APP_CONFIG.modulos) {
  window.APP_CONFIG.modulos = {
    dashboard: { titulo: 'Dashboard', icono: 'bi-speedometer2', activo: true },
    contactos: { titulo: 'Contactos', icono: 'bi-people', activo: true },
    historial: { titulo: 'Historial', icono: 'bi-clock-history', activo: true },
    plantillas: { titulo: 'Plantillas', icono: 'bi-files', activo: true },
    recordatorios: { titulo: 'Recordatorios', icono: 'bi-bell', activo: true }
  };
}

if (!window.APP_CONFIG.data) {
  window.APP_CONFIG.data = {
    dir: 'data/',
    maxFileSize: 10485760,
    tipos: ['avatar', 'foto', 'doc', 'logo', 'backup'],
    avatars: { default: 'data/defaults/avatar.svg', size: 200, calidad: 0.8 }
  };
}

if (!window.APP_CONFIG.sync) {
  window.APP_CONFIG.sync = {
    primaryFormat: 'json',
    secondaryFormats: [],
    includeFiles: true,
    encrypt: true,
    maxExportSize: 52428800
  };
}

if (!window.APP_CONFIG.ui) {
  window.APP_CONFIG.ui = {
    formsMode: 'modal',
    alerts: 'toast',
    confirmDelete: true,
    avatars: false,
    avatarDefault: 'data/defaults/avatar.svg'
  };
}
