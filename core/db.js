// db.js — Inicialización Dexie para AHA Contactos
var db = new Dexie('AHA_Contactos');

db.version(1).stores({
  _sync_log: 'id, *tabla, *operacion, *idRegistro, *estado, *fecha, *createdBy, createdAt',
  _ia_chats: 'id, *titulo, *modelo, *createdBy, createdAt, updatedAt',
  _ia_messages: 'id, *chatId, *rol, contenido, *createdBy, createdAt',
  _files: '&path, tipo, nombre, mime, size, hash, refCount, createdAt, updatedAt',
  _file_blobs: '&path'
});

db.version(2).stores({
  contactos: 'id, nombre, *telefono, *email, *empresa, *etiqueta, *notas, *ultimoContacto, *createdBy, createdAt, updatedAt',
  historial: 'id, *contactoId, *tipo, *descripcion, *fecha, createdAt',
  plantillas: 'id, nombre, *contenido, *categoria, *createdBy, createdAt, updatedAt',
  recordatorios: 'id, *contactoId, *fecha, *nota, completado, *createdBy, createdAt, updatedAt',
  _sync_log: 'id, *tabla, *operacion, *idRegistro, *estado, *fecha, *createdBy, createdAt',
  _ia_chats: 'id, *titulo, *modelo, *createdBy, createdAt, updatedAt',
  _ia_messages: 'id, *chatId, *rol, contenido, *createdBy, createdAt',
  _files: '&path, tipo, nombre, mime, size, hash, refCount, createdAt, updatedAt',
  _file_blobs: '&path'
});

window.db = db;
