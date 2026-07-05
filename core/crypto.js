// crypto.js — Cifrado AES con CryptoJS + generador UUID
window.cryptoHelpers = {
  _key: null,

  _getKey() {
    if (this._key) return this._key;
    var stored = localStorage.getItem('aha_crypto_key');
    if (stored) {
      this._key = stored;
    } else {
      this._key = this._generateKey();
      localStorage.setItem('aha_crypto_key', this._key);
    }
    return this._key;
  },

  _generateKey() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  encrypt: function (text) {
    if (!text) return text;
    try {
      var key = this._getKey();
      return CryptoJS.AES.encrypt(text, key).toString();
    } catch (e) {
      console.error('[crypto] Error encrypting:', e);
      return text;
    }
  },

  decrypt: function (ciphertext) {
    if (!ciphertext) return ciphertext;
    try {
      var key = this._getKey();
      var bytes = CryptoJS.AES.decrypt(ciphertext, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error('[crypto] Error decrypting:', e);
      return ciphertext;
    }
  },

  hash: function (text) {
    if (!text) return '';
    return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
  }
};

// Generador UUID v4 (compatible con file://)
window.uuid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};
