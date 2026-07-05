// sync.js — Export/Import de datos offline-first con formato .ateje-backup
// JSON → pako.deflate → CryptoJS.AES
window.SyncEngine = {
  _password: '',
  _excludeTables: ['modelos_cache', '_ia_sqlite'],

  setPassword: function (pwd) {
    this._password = pwd || '';
  },

  exportar: function (password) {
    var self = this;
    var pwd = password || this._password;
    return new Promise(function (resolve, reject) {
      try {
        UI.toast('Preparando respaldo...', 'info');
        var tables = {};
        var files, blobs;
        var appName = APP_CONFIG?.app?.nombre || 'AHA Contactos';

        // Recolectar tablas de negocio
        var collectPromises = [];
        for (var i = 0; i < db.tables.length; i++) {
          var table = db.tables[i];
          if (self._excludeTables.indexOf(table.name) !== -1) continue;
          if (table.name === '_files' || table.name === '_file_blobs') continue;
          collectPromises.push(
            table.toArray().then(function (records) {
              if (records.length) tables[this.name] = records;
            }.bind(table))
          );
        }

        // Recolectar archivos
        if (db._files) {
          collectPromises.push(
            db._files.toArray().then(function (r) { files = r; })
          );
        }
        if (db._file_blobs && APP_CONFIG.perfil === 'lite') {
          collectPromises.push(
            db._file_blobs.toArray().then(function (r) { blobs = r; })
          );
        }

        Promise.all(collectPromises).then(function () {
          if (!Object.keys(tables).length && !files?.length) {
            UI.toast('No hay datos para exportar', 'warning');
            resolve();
            return;
          }

          var payload = JSON.stringify({
            version: 2,
            app: appName,
            exportedAt: new Date().toISOString(),
            tables: tables,
            files: files,
            blobs: blobs
          });

          // Comprimir con pako
          var compressed = pako.deflate(payload, { level: 9 });
          var blob;

          if (pwd) {
            var wordArray = CryptoJS.lib.WordArray.create(compressed);
            var encrypted = CryptoJS.AES.encrypt(wordArray, pwd).toString();
            blob = new Blob([encrypted], { type: 'application/octet-stream' });
          } else {
            blob = new Blob([compressed], { type: 'application/octet-stream' });
          }

          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = appName + '-' + new Date().toISOString().slice(0, 10) + '.ateje-backup';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          var fileInfo = files?.length ? ' + ' + files.length + ' archivos' : '';
          UI.toast('Respaldo exportado (' + (blob.size / 1024).toFixed(1) + ' KB' + fileInfo + ')', 'success');
          resolve();
        }).catch(function (err) {
          reject(err);
        });
      } catch (err) {
        UI.toast('Error al exportar: ' + err.message, 'error');
        reject(err);
      }
    });
  },

  importar: function (file, password) {
    var self = this;
    var pwd = password || this._password;
    return new Promise(function (resolve, reject) {
      try {
        UI.toast('Leyendo respaldo...', 'info');

        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            var data = e.target.result;
            var decompressed;

            if (pwd) {
              var decrypted = CryptoJS.AES.decrypt(data, pwd);
              var bytes = [];
              var words = decrypted.words;
              for (var i = 0; i < words.length; i++) {
                var word = words[i];
                bytes.push((word >> 24) & 0xff);
                bytes.push((word >> 16) & 0xff);
                bytes.push((word >> 8) & 0xff);
                bytes.push(word & 0xff);
              }
              // Remove padding
              var len = decrypted.sigBytes || bytes.length;
              bytes = bytes.slice(0, len);
              var uint8 = new Uint8Array(bytes);
              decompressed = pako.inflate(uint8, { to: 'string' });
            } else {
              var uint8data = new Uint8Array(data);
              decompressed = pako.inflate(uint8data, { to: 'string' });
            }

            var parsed = JSON.parse(decompressed);
            var tables = parsed.tables || {};
            var tableNames = Object.keys(tables);

            if (!tableNames.length) {
              UI.toast('El respaldo no contiene datos', 'warning');
              resolve();
              return;
            }

            UI.loading(true);

            var importPromises = [];

            // Importar archivos primero
            if (parsed.files && db._files) {
              importPromises.push(
                db._files.clear().then(function () {
                  if (parsed.files.length) return db._files.bulkAdd(parsed.files);
                })
              );
            }
            if (parsed.blobs && db._file_blobs) {
              importPromises.push(
                db._file_blobs.clear().then(function () {
                  if (parsed.blobs.length) return db._file_blobs.bulkAdd(parsed.blobs);
                })
              );
            }

            // Importar tablas de negocio
            for (var t = 0; t < tableNames.length; t++) {
              var name = tableNames[t];
              var records = tables[name];
              if (!records || !records.length) continue;
              importPromises.push(
                db[name].clear().then(function () {
                  var recs = this.records;
                  if (recs.length) return db[this.name].bulkAdd(recs);
                }.bind({ name: name, records: records }))
              );
            }

            Promise.all(importPromises).then(function () {
              UI.loading(false);
              UI.toast('Respaldo importado correctamente (' + tableNames.length + ' tablas)', 'success');
              resolve();
            }).catch(function (err) {
              UI.loading(false);
              reject(err);
            });
          } catch (err) {
            UI.loading(false);
            reject(new Error('Error al procesar respaldo: ' + err.message));
          }
        };

        reader.onerror = function () {
          reject(new Error('Error al leer archivo'));
        };

        if (pwd) {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      } catch (err) {
        UI.toast('Error al importar: ' + err.message, 'error');
        reject(err);
      }
    });
  }
};
