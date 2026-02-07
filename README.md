# FormSeal

FormSeal is a **server-blind, browser-native encrypted form ingestion pipeline** for public websites operating under the assumption that **backend infrastructure cannot be trusted with plaintext data**.

All submissions are encrypted **in the browser**, stored as **opaque ciphertext**, and exported for **offline, operator-controlled decryption**.  
The backend is intentionally incapable of reading submission contents.

FormSeal is **not a hosted service, dashboard, or SaaS product**.  
It is a security-first ingestion pipeline.

---

## Start here

- **Quickstart:** `docs/quickstart.md` — verify browser-side encryption end-to-end
- **Deployment:** `docs/deployment.md` — correct and safe Cloudflare deployment

---

## Security guarantee (read this first)

> **If the FormSeal backend is fully compromised, seized, or maliciously operated, previously submitted form data remains confidential.**

This guarantee holds because:

- Encryption happens **client-side**
- The backend stores **ciphertext only**
- Decryption keys **never exist** in the backend environment

A backend compromise yields **no recoverable plaintext**.

---

## Architecture overview

FormSeal enforces strict separation of concerns:

- **Browser**
    
    - Payload construction
    - Client-side encryption (libsodium sealed boxes, X25519)
    - Basic abuse resistance (proof-of-work)
    
- **Backend**
    
    - Blind ingestion
    - Replay checks
    - Encrypted export only
    - No plaintext handling
    - No decryption capability
    
- **Operator environment**
    
    - Export retrieval
    - Offline decryption
    - Inspection and processing

The backend never holds decryption keys.

---

## Threat model 

FormSeal is designed for environments where:

- The hosting provider may be compromised
- The backend must be treated as hostile
- Data seizure is a realistic concern
- Retroactive disclosure must be prevented

FormSeal prioritizes **backward confidentiality** (protecting already-submitted data) over convenience or real-time administration.

---

## Data flows

### Public submission

Browser  
→ `/api/challenge`  
→ client-side PoW + encryption  
→ `/api/verify`  
→ `/api/write`  
→ KV storage (**ciphertext only**)

---

### Operator export

Operator  
→ `/api/export-request`  
→ `/api/export/{token}`  
→ local, offline decryption

---

## Backend compromise impact

If the backend or storage layer is compromised, an attacker can:

- Access encrypted submission blobs
- Observe submission timing and size
- Modify backend code affecting **future submissions**

They **cannot**:

- Decrypt existing submissions, unless they have the private key
- Recover plaintext from stored data
- Retroactively compromise already-encrypted data

---

## Frontend trust assumption

FormSeal assumes that the frontend code delivered to users is trustworthy **at the time of submission**.

If an attacker can modify the frontend (for example, via hosting provider or CDN compromise), they may subvert client-side encryption for **future submissions only**.

This design intentionally prioritizes protection of **already submitted data** over integrity guarantees after compromise.

---


## Repo layout

```
formseal/
├── frontend/   # browser-side encryption and submission logic
├── backend/    # Cloudflare Pages Functions (blind ingestion)
├── docs/       # architecture, threat model, deployment notes (WIP)
└── wrangler.toml.example
```

---

## Configuration & deployment

Deployment bindings, routes, and required environment variables are documented in:

```wrangler
wrangler.example.toml
```

This file is documentation only and is **not** a ready-to-deploy configuration.

---

## What FormSeal does NOT do

- No admin dashboard
- No inbox UI
- No server-side decryption
- No hosted service
- No claims of strong spam or abuse prevention

These omissions are **intentional** and part of the security model.

---

## Administrative tooling

FormSeal does **not** include administrative tooling or decryption utilities.

Operator workflows (export, decrypt, inspect) are intentionally isolated in a separate repository:

**FormSeal Sync**  
[https://github.com/grayguava/formseal-sync](https://github.com/grayguava/formseal-sync)

---

## Scope

FormSeal implements **ingestion and encrypted export only**.

Everything else is explicitly out of scope.

---
## License

MIT