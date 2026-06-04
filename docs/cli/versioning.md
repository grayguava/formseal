# Versioning

The entire payload (including the version field) is encrypted. Storage sees only opaque ciphertext — nothing is readable until decrypted with your private key.

## Current version

`fse.v1.0`

```json
{
  "version": "fse.v1.0",
  "origin": "contact-form",
  "id": "uuid",
  "submitted_at": "2024-01-01T00:00:00.000Z",
  "data": { ... }
}
```

## Version support

| Version | Status |
|---|---|
| `fse.v1.0` | current |
| `fse.v1.x` | forward-compatible |
| anything else | invalid |

All `v1.x` releases share the same envelope structure. Minor increments may add fields inside `data` but won't break existing decryptors. Incompatible changes would increment the major version (`v2.0`).

All versions and their schemas are documented in [Schemas](../payload-schemas/README.md).

## Ecosystem versioning

| Tool | Handles versioning |
|------|-------------------|
| formseal-embed | Creates versioned payloads (this tool) |
| [formseal-fetch](https://github.com/useFormseal/fetch) | Passes through (doesn't parse) |
| [formseal-decrypt](https://github.com/useFormseal/decrypt) | Validates and decrypts versioned payloads |
