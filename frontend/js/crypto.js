// crypto.js

export function base64urlToBytes(b64url) {
  b64url = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64url.length % 4;
  if (pad) b64url += "=".repeat(4 - pad);
  const binary = atob(b64url);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

export function bytesToBase64url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sealJSONToPublicKey(obj, publicKeyB64) {
  if (!publicKeyB64) {
    throw new Error(
      "FormSeal misconfigured: x25519 public key is not set"
    );
  }

  await sodium.ready;

  const plaintext =
    new TextEncoder().encode(JSON.stringify(obj));

  const pubKey = base64urlToBytes(publicKeyB64);
  const cipher = sodium.crypto_box_seal(plaintext, pubKey);

  return bytesToBase64url(cipher);
}

