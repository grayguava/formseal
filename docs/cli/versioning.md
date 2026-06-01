# Versioning

The entire payload (including the version field) is encrypted. Storage sees only opaque ciphertext — nothing is readable until decrypted with your private key.

---

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

---

## Version support

| Version | Status |
|---|---|
| `fse.v1.0` | current |

All versions and their schemas are documented in [Schemas](../payload-schemas/README.md).

---

## Decryption

When you decrypt, the `version` field tells your tool which schema to use. See [Decryption](../decryption.md).
