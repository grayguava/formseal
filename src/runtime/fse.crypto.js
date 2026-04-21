// fse.crypto.js
// Depends on: window.sodium (libsodium-wrappers, must be ready)

var FSECrypto = (function () {

  // -- Encoding helpers --
  function bytesToBase64url(bytes) {
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  
  function base64urlToBytes(b64url) {
    b64url = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64url.length % 4;
    if (pad) b64url += "=".repeat(4 - pad);
    const binary = atob(b64url);
    return Uint8Array.from(binary, function (c) { return c.charCodeAt(0); });
  }

  
  // -- Encryption --
  async function sealJSON(obj, publicKey) {
    if (!publicKey) {
      throw new Error(
        "[fse/crypto] publicKey is not set in fse.config.js."
      );
    }

    await sodium.ready;

    const pubKey = base64urlToBytes(publicKey);
    if (pubKey.length !== 32) {
      throw new Error(
        "[fse/crypto] publicKey must decode to exactly 32 bytes."
      );
    }

    const plaintext  = new TextEncoder().encode(JSON.stringify(obj));
    const ciphertext = sodium.crypto_box_seal(plaintext, pubKey);

    return "formseal." + bytesToBase64url(ciphertext);
  }

  
  // -- Public API --
  return {
    sealJSON,
    bytesToBase64url,
    base64urlToBytes,
  };

})();