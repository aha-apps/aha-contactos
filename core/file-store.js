// file-store.js — Gestión unificada de archivos
window.FileStore = {
  APP_DATA_DIR: 'data/',

  save: function (tipo, nombre, blob) {
    return new Promise(function (resolve, reject) {
      try {
        var path = tipo + '/' + uuid() + '-' + nombre;
        var reader = new FileReader();
        reader.onload = function () {
          var arrayBuffer = reader.result;
          var hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(arrayBuffer)).toString(CryptoJS.enc.Hex);

          // Guardar metadata en _files
          var fileMeta = {
            path: path,
            tipo: tipo,
            nombre: nombre,
            mime: blob.type || 'application/octet-stream',
            size: blob.size,
            hash: hash,
            refCount: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          db._files.put(fileMeta).then(function () {
            // Guardar blob en _file_blobs (Lite perfil)
            return db._file_blobs.put({ path: path, data: arrayBuffer });
          }).then(function () {
            var url = URL.createObjectURL(blob);
            resolve({ path: path, hash: hash, url: url });
          }).catch(function (err) {
            reject(err);
          });
        };
        reader.onerror = function () { reject(new Error('Error al leer archivo')); };
        reader.readAsArrayBuffer(blob);
      } catch (err) {
        reject(err);
      }
    });
  },

  getURL: function (path) {
    if (!path) return Promise.resolve(APP_CONFIG.ui.avatarDefault || 'data/defaults/avatar.svg');
    var self = this;
    return new Promise(function (resolve) {
      db._file_blobs.get(path).then(function (entry) {
        if (entry && entry.data) {
          var blob = new Blob([entry.data]);
          var url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          resolve(self.avatarDefault());
        }
      }).catch(function () {
        resolve(self.avatarDefault());
      });
    });
  },

  read: function (path) {
    return new Promise(function (resolve, reject) {
      db._file_blobs.get(path).then(function (entry) {
        if (entry && entry.data) {
          resolve(new Blob([entry.data]));
        } else {
          reject(new Error('Archivo no encontrado: ' + path));
        }
      }).catch(function (err) {
        reject(err);
      });
    });
  },

  delete: function (path) {
    var self = this;
    return new Promise(function (resolve, reject) {
      db.transaction('rw', db._files, db._file_blobs, function () {
        return db._files.get(path).then(function (meta) {
          if (meta) {
            meta.refCount = (meta.refCount || 1) - 1;
            if (meta.refCount <= 0) {
              return db._files.delete(path).then(function () {
                return db._file_blobs.delete(path);
              });
            } else {
              return db._files.put(meta);
            }
          } else {
            return db._file_blobs.delete(path);
          }
        });
      }).then(function () {
        resolve();
      }).catch(function (err) {
        reject(err);
      });
    });
  },

  cleanOrphans: function () {
    return new Promise(function (resolve, reject) {
      db._files.filter(function (f) { return f.refCount <= 0; }).toArray().then(function (orphans) {
        var promises = orphans.map(function (o) {
          return db._files.delete(o.path).then(function () {
            return db._file_blobs.delete(o.path);
          });
        });
        return Promise.all(promises);
      }).then(function () {
        resolve();
      }).catch(function (err) {
        reject(err);
      });
    });
  },

  meta: function (path) {
    return db._files.get(path);
  },

  avatarDefault: function () {
    return APP_CONFIG.ui.avatarDefault || 'data/defaults/avatar.svg';
  }
};
