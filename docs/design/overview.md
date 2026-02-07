# FormSeal : System overview

This document provides a **high-level technical overview** of FormSeal as a system.  
It explains _what exists_, _why it exists_, and _how the pieces relate_, without diving into protocol minutiae or deployment steps.

For guarantees, scope, and positioning, see the repository README.  
For flows, threats, APIs, and crypto details, see the remaining documents in `docs/`.

---

## What FormSeal is

FormSeal is a **server-blind form ingestion system** designed to accept submissions from untrusted public clients while ensuring that **backend infrastructure never gains access to plaintext data**.

It is intentionally minimal.  
FormSeal does not attempt to be a product, platform, or inbox.  
It implements a **single responsibility**:

> Accept encrypted submissions, store them blindly, and allow controlled export for offline decryption.

---

## Core design principle

The central principle of FormSeal is **asymmetric trust**:

- **Clients (browsers)** are trusted to encrypt data correctly _at submission time_
- **Backends** are treated as hostile or compromisable
- **Operators** are trusted only in their local environment, outside the backend

This asymmetry is deliberate.  
FormSeal is built to preserve confidentiality **after compromise**, not to prevent compromise entirely.

---

## System components

FormSeal is composed of three logically separate environments:

### 1. Client environment (browser)

Responsibilities:

- Construct submission payloads
- Encrypt data using an operator-held public key
- Perform proof-of-work to limit abuse
- Submit encrypted data to the backend

The browser is the **only place where plaintext exists** during normal operation.

---

### 2. Backend environment (ingestion + export)

Responsibilities:

- Issue proof-of-work challenges
- Verify proof-of-work and replay resistance
- Accept and store encrypted payloads
- Provide authenticated export of encrypted data

Non-responsibilities:

- Decryption
- Inspection
- Interpretation of payload contents

The backend is **intentionally blind**.

---

### 3. Operator environment (administrative)

Responsibilities:

- Authenticate export requests
- Retrieve encrypted submissions
- Decrypt data locally
- Inspect or process plaintext offline

This environment is **not network-facing** and is not part of the submission pipeline.

Administrative tooling lives in a separate repository (**FormSeal Sync**) to preserve trust boundaries.

---

## What FormSeal explicitly avoids

FormSeal deliberately avoids:

- Server-side decryption
- Admin dashboards or inbox UIs
- Long-lived backend secrets capable of data recovery
- Multi-tenant or hosted-service assumptions
- Claims of anonymity, metadata protection, or strong abuse prevention

These omissions are not missing features — they are **design constraints**.

---

## Security posture (high level)

FormSeal is designed to provide:

- **Confidentiality of past submissions** under backend compromise
- **Cryptographic separation** between storage and decryption
- **Minimal attack surface** in the ingestion path

FormSeal does **not** provide:

- Integrity guarantees after frontend compromise
- Protection against malicious client-side code delivery
- Strong spam resistance or anonymity guarantees

These tradeoffs are documented explicitly in later sections.

---

## Relationship to FormSeal Sync

FormSeal handles **ingestion and export only**.

All administrative workflows — including:

- export automation
- decryption
- inbox splitting
- post-processing

are handled by **FormSeal Sync**, a separate, local-only toolchain.

This separation ensures that **administrative convenience never weakens backend blindness**.

---

## Documentation map

This overview intentionally omits detail.  
Each topic is expanded in a dedicated document:

- `01-pipeline-flow.md` — end-to-end traffic and trust flow
- `02-threat-model.md` — adversaries, assumptions, guarantees
- `03-api-reference.md` — backend endpoint behavior
- `04-backend-compromise.md` — post-incident analysis
- `05-frontend-trust.md` — frontend delivery assumptions

Cryptography, payload schema, deployment, and versioning are documented separately once frontend code is introduced.

---

## Intended audience

This documentation is written for:

- security engineers
- reviewers and auditors
- operators deploying FormSeal
- future maintainers

It is **not** a beginner tutorial and does not attempt to hide complexity.

---

### Status

This document describes the **current design intent** of FormSeal.  
Implementation details are expected to evolve, but the trust boundaries and guarantees described here are considered stable.