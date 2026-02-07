# Vendored Dependencies

This repository includes locally vendored third-party code required for
client-side cryptographic operations.

---

## formseal-sodium.js

- Purpose: Browser-side public-key encryption (sealed boxes)
- Origin: libsodium JavaScript/WASM build (browser)
- Inclusion method: Local vendoring (no CDN)
- Load model: Classic `<script>` (non-module)

### Provenance

The exact upstream build version is unknown due to historical local inclusion.
The file is treated as immutable and pinned by cryptographic hash.

- SHA-256: `1a4c470aee2dd1bf2569411292ffd3f8e25d1ce602c65ec08861c13bdeaa7a22`

### Cryptographic Usage

Only the following API surface is relied upon:

- `sodium.ready`
- `crypto_box_seal()`

The underlying primitive is libsodium’s sealed box construction
(X25519 + XSalsa20-Poly1305).

No custom cryptographic primitives are implemented.

### Trust Boundary

Client-side cryptography is not part of the trusted computing base.
Correctness is defined by successful server-side decryption using libsodium.

Any modification of this file invalidates the security model.
