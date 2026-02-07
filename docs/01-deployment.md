# Deployment (FormSeal)

This document describes how to deploy FormSeal **correctly and safely** using **cloudflare Pages with Functions**, and how to verify that the system’s core security guarantees hold in practice.

This is **not a beginner tutorial**.  
It assumes familiarity with Cloudflare Pages, Wrangler, environment variables, and KV bindings.

---

## Security guarantee (read first)

> **If the FormSeal backend or storage is fully compromised, previously submitted form data still remains confidential.**

This guarantee holds because:

- encryption happens **in the browser**
- the backend stores **ciphertext only**
- decryption keys **never exist** in backend infrastructure

the backend is intentionally blind.

---

## Trust warning

> **A cloudflare account compromise is a total compromise of the deployment.**

This includes:

- frontend JavaScript delivery
- backend Functions code
- environment variables
- KV access

despite this, **previously encrypted submissions remain confidential**.  
only future submissions are affected after compromise.

this tradeoff is explicit and intentional.

---

## Deployment model overview

FormSeal is deployed as a **single cloudflare Pages project** containing:

- static frontend assets
- Pages Functions implementing backend APIs
- cloudflare KV namespaces for storage and replay protection

The frontend and backend share the same Cloudflare account and deployment.

---

## Repository layout (expected)

A correct deployment expects the following structure:

```
/
├── index.html
├── assets/js/form/
│   ├── config.js
│   ├── crypto.js
│   ├── payload.js
│   ├── pow.js
│   └── form.js
└── functions/
    ├── api/
    │   ├── challenge/
    │   ├── verify/
    │   ├── write/
    │   ├── export-request/
    │   ├── export/[token]/
    │   └── status/
    └── _shared/
```

cloudflare automatically binds `/functions/api/*` to `/api/*`.

---

## Cryptographic prerequisites

FormSeal encrypts submissions to a **static operator-held X25519 public key**.

### Key generation

Generate an X25519 keypair using any libsodium-compatible tool.

**Recommended option (no setup, no encoding errors):**

[https://formseal.pages.dev/tools/x25519-generate/](https://formseal.pages.dev/tools/x25519-generate/)

This tool:

- generates a libsodium-compatible X25519 keypair
- outputs **base64url** encoding exactly as FormSeal expects
- avoids padding and encoding mistakes

### Rules

- **public key** → embedded in the frontend
- **private key** → stored offline, locally, securely
- the private key must **never** touch Cloudflare or the backend

loss of the private key results in **permanent data loss**.

---

## Frontend configuration

Edit:

```js
frontend/config.js
```

Set the operator public key:

```js
FORMSEAL_CONFIG.x25519PublicKey = "<BASE64URL_PUBLIC_KEY>";
```

verify the following:

- `submitUrl` points to `/api/verify`
- `payloadVersion` is set and immutable
- PoW bounds match backend limits
- the public key is correct

the frontend must **never** talk directly to `/api/write`.

---

## Environment variables (required)

Create the following **secrets** in your Cloudflare Pages project:

| Variable                        | purpose                      |
| ------------------------------- | ---------------------------- |
| `GUAVA_POW_SECRET`              | server-bound PoW salt        |
| `GUAVA_WRITE_SECRET`            | internal write authorization |
| `GUAVA_ADMIN_AUTOMATION_SECRET` | admin export authentication  |

All secrets must be:

- random
- high entropy
- never reused elsewhere
- never committed

---

## KV namespaces (required)

Create and bind the following KV namespaces:

| Binding               | purpose                   |
| --------------------- | ------------------------- |
| `GUAVA_RATELIMIT`     | PoW replay protection     |
| `GUAVA_FORMSUBMITS`   | encrypted submissions     |
| `GUAVA_EXPORT_TOKENS` | short-lived export tokens |

binding names must match exactly.

Custom binding names are allowed, but must match backend expectations.  
Refer to `wrangler.toml.example` in the repository root.

---

## Wrangler configuration

Copy the example configuration:

```bash
cp wrangler.toml.example wrangler.toml
```

Verify that:

- KV binding names match the deployment
- no secrets are present
- routes align with Pages + Functions

`wrangler.toml.example` is **documentation**, not a drop-in config.  
Read it carefully.

---

## Deployment

Deploy frontend and backend together:

```bash
wrangler pages deploy .
```

After deployment, verify configuration:

```bash
GET /api/status/vars
```

All required flags must return `true`.  
if any value is `false`, fix it before proceeding.

---

## Submission verification

Open the deployed site and submit the form.

Expected behavior:

- a PoW challenge is issued
- payload is encrypted client-side
- submission succeeds

Verify in Cloudflare KV:

- stored values are **opaque ciphertext**
- no plaintext exists anywhere server-side

---

## Decryption verification (no admin tooling)

Administrative workflows are **intentionally out of scope** for this repository.

To verify encryption correctness, use the FormSeal ciphertext decrypt tool:

[https://formseal.pages.dev/tools/ciphertext-decrypt/](https://formseal.pages.dev/tools/ciphertext-decrypt/)

Steps:

1. copy a ciphertext **base64url** blob from KV storage
2. paste the ciphertext into the tool
3. paste your **X25519 private key**
4. decrypt locally in the browser

This tool:

- performs client-side decryption only
- does not contact the FormSeal backend
- exists purely to validate encryption correctness

successful decryption confirms:

- ciphertext validity
- correct key usage
- backend blindness

---

## Post-deployment validation

Confirm the following:

- submissions succeed end-to-end
- KV contains ciphertext only
- backend never logs plaintext
- private keys never touch Cloudflare
- no admin UI is exposed publicly

if any of these fail, the deployment is **not secure**.

---

## Key rotation

Key rotation requires:

1. generating a new X25519 keypair
2. updating the frontend public key
3. redeploying frontend assets
4. retaining old private keys to decrypt historical data

Backend changes are **not** required.

---

## Incident response (minimal)

If compromise is suspected:

1. assume frontend code is malicious
2. rotate encryption keys
3. rotate all backend secrets
4. redeploy frontend and backend
5. treat future submissions as compromised until redeployment completes

previously submitted data remains confidential.

---

## Operational non-goals

This deployment does **not** provide:

- high availability guarantees
- redundancy across providers
- automatic key rotation
- tamper-evident frontend delivery
- hosted admin dashboards

these are outside FormSeal’s scope.

---

## Summary

A correct FormSeal deployment:

- treats the backend as hostile
- keeps decryption keys offline
- accepts cloudflare as a single trust root
- relies on cryptography for post-compromise safety

Misconfiguration weakens guarantees more than code changes.