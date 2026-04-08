# Security

---

## What it protects against

**Interception in transit**
Even without HTTPS, intercepted submissions are just opaque ciphertext. Unreadable without your private key.

**Server-side leaks**
Proxies, logging middleware, and analytics tools that touch your endpoint never see plaintext. They store blobs.

**Storage breaches**
If your submission store is compromised, attackers get ciphertext. Useless without the private key, which is never on that machine.

---

## What it doesn't protect against

**Compromised client**
Malware on the user's device can read keystrokes before encryption. This is outside formseal-embed's scope.

**Wrong endpoint**
Encryption works correctly even if someone tricks a user into submitting to the wrong URL — just to the wrong key. Use HTTPS and verify your endpoint.

**Stolen private key**
If your private key is exposed, all past and future submissions can be decrypted. Guard it accordingly.

---

## Encryption

- **Algorithm**: X25519 (libsodium sealed box)
- **Keys**: 32-byte public/private pair, base64url encoded
- **Scope**: entire payload, encrypted as one blob

---

## Key hygiene

- Never commit the private key to version control
- Store it as an environment variable or in a secrets manager
- Keep it off any machine that handles inbound submissions - decrypt separately