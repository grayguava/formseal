# How it works

## The pipeline

```
formseal-embed (browser encryption)   ← this tool
       │
       ▼ (encrypted submissions)
  Storage backend
       │
       ▼ (formseal-fetch downloads)
  formseal.ct.jsonl
       │
       ▼ (formseal-decrypt decrypts)
  formseal.decrypted.jsonl
       │
       ▼
  You
```

## The flow

1. User submits the form
2. Browser collects all field values
3. Browser encrypts the payload using your public key (X25519 via libsodium)
4. Browser POSTs the ciphertext (prefixed `formseal.`) to your endpoint
5. Your endpoint stores it — no parsing needed
6. [formseal-fetch](https://github.com/useFormseal/fetch) downloads ciphertexts to `formseal.ct.jsonl`
7. [formseal-decrypt](https://github.com/useFormseal/decrypt) decrypts them locally

Steps 1–5 happen automatically on form submit. Steps 6–7 are on your schedule.

## What gets encrypted

The entire payload is a single encrypted blob:

```json
{
  "version": "fse.v1.0",
  "origin": "contact-form",
  "id": "uuid",
  "submitted_at": "timestamp",
  "data": {
    "name": "John",
    "email": "john@example.com",
    "message": "Hello"
  }
}
```

Nothing is left in plaintext — not the fields, not the metadata.

## Position in the ecosystem

| Step | Tool | What happens |
|------|------|-------------|
| 1 | formseal-embed | Encrypts submission in the browser |
| 2 | [formseal-fetch](https://github.com/useFormseal/fetch) | Downloads ciphertexts from storage |
| 3 | [formseal-decrypt](https://github.com/useFormseal/decrypt) | Decrypts locally |

