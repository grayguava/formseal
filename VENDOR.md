# VENDOR.md

Third-party files shipped in `src/vendor/`.

---

## sodium.js

libsodium compiled to webassembly : used for `crypto_box_seal` (curve25519 + xsalsa20-poly1305) to encrypt form payloads client-side before submission.

| Field    | Value                                                                        |
|----------|------------------------------------------------------------------------------|
| source   | jedisct1/libsodium.js                                                        |
| version  | 0.8.2                                                                        |
| build    | dist/browsers/sodium.js                                                      |
| upstream | https://github.com/jedisct1/libsodium.js/blob/0.8.2/dist/browsers/sodium.js  |
| sha256   | `1c96753a1b23dd57b122ee337dcd7b323eb1f045af96c3f94c9d32e329c9a856`           |