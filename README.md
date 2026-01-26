# FormSeal

FormSeal is a **secure form submission pipeline** designed for public-facing forms where the backend should not be trusted with plaintext data.

It encrypts submissions **in the browser**, applies **basic abuse mitigation**, and stores **only ciphertext** on the backend.  
The server is intentionally blind.

FormSeal is a _pipeline_, not a hosted service or UI product.

---

## Why FormSeal exists

Most contact form solutions assume:

- the backend is trusted
- stored messages can be read server-side
- operators won’t mishandle keys or formats

FormSeal rejects these assumptions.

It is intended for cases where:

- the backend must never see plaintext
- submissions may be anonymous
- basic automated abuse should be discouraged
- operators want explicit control over keys and data handling

---

## High-level design

FormSeal separates concerns deliberately:

- **Client**: payload construction, encryption, proof-of-work
- **Backend**: basic abuse mitigation and blind storage
- **Operator environment**: inspection and decryption (offline)

The backend never holds decryption keys and cannot read submissions.

---

## High-level flow

```
Client
  → /api/challenge
  → client-side PoW + encryption
  → /api/verify
  → /api/write
  → KV (ciphertext only)
```

---

## What FormSeal does NOT do

- No admin dashboard
- No server-side decryption
- No message rendering
- No session-based admin authentication
- No claim of strong abuse prevention

These are **intentional design choices**, not missing features.

---

## Repository structure

Understanding the structure is important before attempting deployment.

```
formseal/
├─ frontend/        # Client-side pipeline (encryption, PoW)
├─ backend/         # Cloudflare Pages Functions (blind ingestion)
├─ wrangler.toml.example
├─ README.md
└─ LICENSE
```

### `frontend/`

Contains browser-side logic:

- payload construction
- client-side encryption (libsodium)
- proof-of-work
- basic sanity checks

This code **must be configured by the operator** before use.

### `backend/`

Contains the ingestion backend:

- challenge issuance
- PoW verification
- replay checks
- rate limiting
- ciphertext storage

The backend is intentionally minimal and does not expose an admin surface.

### `wrangler.toml.example`

Documents the **deployment contract**:

- required secrets
- required KV bindings
- expected value types

This file is **documentation**, not a deployable configuration.

---

## Configuration model (important)

FormSeal uses **two separate configuration layers**.

### 1. Frontend configuration (required)

Located in:

```
frontend/js/config.js
```

This includes:

- payload version
- PoW parameters
- **x25519 public key**

The repository ships with:

```
x25519PublicKey: null
```

Form submission will fail until this is configured.  
This is intentional and prevents accidental misconfiguration.

---

### 2. Backend environment bindings (required)

Backend functions rely on environment bindings injected at runtime.

Required bindings are documented in:

`wrangler.toml.example`

#### Required secrets

- `FS_POW_SECRET`  
    Used to derive per-challenge salts.

- `FS_WRITE_SECRET`  
    Used to authenticate internal write requests.  
    Must be distinct from `FS_POW_SECRET`.

#### Required KV namespaces

- `FS_RATELIMIT` — basic rate limiting and replay tracking
- `FS_SUBMITS` — encrypted submission storage

If any required binding is missing, the backend fails closed.

---

## Admin tooling and inspection

This repository does **not** include admin panels or submission viewers.

Operators are expected to:

- export encrypted submissions
- decrypt and inspect them offline
- convert formats for analysis if needed

This separation is intentional to keep the ingestion pipeline small and auditable.

Operator tooling is provided in a **[separate repository](https://github.com/grayguava/formseal-tools)**.

---

## Threat model (summary)

### Mitigated (to a limited degree)

- Casual automated spam
- Simple replay attempts
- Accidental plaintext exposure on the backend

### Not mitigated

- Determined attackers
- High-volume distributed abuse
- Compromised client devices
- Private key theft
- Traffic correlation

FormSeal provides **basic resistance**, not guarantees.

---

## Deployment guidance

The README intentionally avoids step-by-step deployment instructions.

Instead:

- the pipeline is documented here
- required bindings are documented in `wrangler.toml.example`
- provider-specific deployment notes belong in `/docs`

Reference deployment documentation will live under:

`docs/deployment/`

---

## Scope

This repository documents **the FormSeal pipeline only**.

It is not:

- a hosted service
- a full contact form solution
- an admin product

Those concerns are intentionally handled elsewhere.