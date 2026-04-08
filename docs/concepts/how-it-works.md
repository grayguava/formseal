# How it works

---

## The flow

1. User submits the form
2. Browser collects all field values
3. Browser encrypts the payload using your public key (X25519 via libsodium)
4. Browser POSTs the raw ciphertext to your endpoint
5. Your endpoint stores it — no parsing needed
6. You decrypt locally using your private key

Steps 1–5 happen automatically. Step 6 is on your schedule.

---

## What gets encrypted

The entire payload is a single encrypted blob:

```json
{
  "version": "fse.v1.0",
  "origin": "contact-form",
  "id": "uuid",
  "submitted_at": "timestamp",
  "client_tz": "Europe/London",
  "data": {
    "name": "John",
    "email": "john@example.com",
    "message": "Hello"
  }
}
```

Nothing is left in plaintext — not the fields, not the metadata.

---

## Decryption

Decryption happens offline, using your private key. There's no server component. You pull the ciphertext, run the decryptor, and read your submissions.

See [Deployment → Decryption](../deployment/decryption.md).