# Versioning

Every encrypted payload includes a `version` field. This lets your storage layer and any future tooling identify the schema without decrypting first.

---

## Current version

`fse.v1.0`

```json
{
  "version": "fse.v1.0",
  "origin": "contact-form",
  "id": "uuid",
  "submitted_at": "2024-01-01T00:00:00.000Z",
  "client_tz": "Europe/London",
  "data": { ... }
}
```

---

## Version support

| Version | Status |
|---|---|
| `fse.v1.0` | current |
| `fse.v1.x` | forward-compatible |
| anything else | invalid |

All `v1.x` releases share the same envelope structure. Minor increments may add fields inside `data` but won't break existing decoders.

