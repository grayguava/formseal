// _function/fs.crypto.js

var FormSealCrypto = (function () {

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

  async function sealJSON(obj, recipientPublicKey) {
    if (!recipientPublicKey) {
      throw new Error(
        "[formseal/crypto] recipientPublicKey is not set in formseal.config.js."
      );
    }

    await sodium.ready;

    const pubKey = base64urlToBytes(recipientPublicKey);
    if (pubKey.length !== 32) {
      throw new Error(
        "[formseal/crypto] recipientPublicKey must decode to exactly 32 bytes."
      );
    }

    const plaintext  = new TextEncoder().encode(JSON.stringify(obj));
    const ciphertext = sodium.crypto_box_seal(plaintext, pubKey);

    return bytesToBase64url(ciphertext);
  }

  return {
    sealJSON,
    bytesToBase64url,
    base64urlToBytes,
  };

})();