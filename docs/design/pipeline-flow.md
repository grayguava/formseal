# Pipeline flow

This document describes the **end-to-end traffic flow** of FormSeal, including:

- request sequence
- trust boundaries
- data visibility at each stage
- security enforcement points

this is a **descriptive specification**, not a setup guide.

---

## High-level view

FormSeal’s pipeline is intentionally linear and constrained:

1. **browser** prepares and encrypts data
2. **backend** verifies abuse resistance and stores ciphertext blindly
3. **operator** exports and decrypts data offline

at no point does plaintext pass through the backend.

---

## Trust boundaries

Before detailing requests, it’s critical to understand **where trust changes**:

| Component        | trust level                | plaintext access |
| ---------------- | -------------------------- | ---------------- |
| Browser          | trusted at submission time | yes              |
| Backend          | untrusted / hostile        | no               |
| Operator (local) | trusted                    | yes              |

every step in the pipeline exists to enforce this separation.

---

## Public submission pipeline

This pipeline is executed by **untrusted public clients**.

### Step 1:  Challenge request

**Browser → backend**

```
POST /api/challenge
```

Purpose:

- establish server-authoritative parameters for abuse resistance
- bind proof-of-work to server state

Backend actions:

- validates request shape
- computed a time-bound salt derived from a backend secret
- chooses a difficulty value
- returns `{ ts, salt, difficulty }`

Security properties:

- backend does **not** receive user data
- challenge cannot be reused indefinitely
- difficulty is not client-controlled

---

### Step 2:  Client-side encryption + proof-of-work

**Browser (local)**

Actions performed entirely in the browser:

- user input is collected
- payload is encrypted using an operator-held **public key**
- A proof-of-work solution is computed using:
    
    - ciphertext
    - nonce
    - timestamp
    - salt
    - difficulty

plaintext exists **only here**.

---

### Step 3:  Verification request

**Browser → backend**

```
POST /api/verify
```

Payload (high-level):

- `ciphertext`
- `nonce`
- `ts`
- `salt`
- `difficulty`

Backend actions:

- validates payload schema strictly
- recomputes expected salt
- verifies proof-of-work
- enforces freshness window
- enforces single-use (replay protection)

Security properties:

- backend treats ciphertext as opaque data
- no attempt is made to decode or interpret payload contents
- abuse resistance is enforced without plaintext access

if verification fails, the pipeline stops here.

---

### Step 4:  Blind storage

**Backend (internal)**

```
POST /api/write   (internal-only)
```

triggered only after successful verification.

Backend actions:

- accepts **ciphertext only**
- rejects any additional fields
- stores ciphertext in KV with a bounded TTL
- generates a random storage key

Security properties:

- storage layer contains only opaque ciphertext blobs
- backend never sees plaintext
- storage keys are not derived from submission data

---

## Operator export pipeline

This pipeline is executed by a **trusted operator** and is **not part of public ingestion**.

---

### Step 5:  Export request

**Operator → backend**

```
POST /api/export-request
```

Purpose:

- authenticate operator intent
- mint a short-lived, single-use export token

Backend actions:

- authenticates operator (browser or automation mode)
- applies replay and freshness checks (where applicable)
- issues a one-time export token with a dtrict expiry

Security properties:

- no submission data is returned at this stage
- token is bound to operator identity
- token lifetime is intentionally short

---

### Step 6:  Encrypted export stream

**Operator → backend**

```
GET /api/export/{token}
```

Backend actions:

- validates and burns the token **before streaming**
- iterates over stored ciphertext entries
- streams data as newline-delimited JSON
- includes minimal metadata and a summary footer

Returned data:

- storage keys
- ciphertext values
- export metadata (counts, errors)

Security properties:

- backend does not decrypt or transform ciphertext
- token cannot be reused
- export does not mutate stored data

---

### Step 7:  Offline decryption

**Operator (local)**

Actions:

- exported file is processed locally
- ciphertext is decrypted using the operator’s private key
- plaintext is inspected or processed offline

This step occurs **entirely outside** the FormSeal backend.

---

## Data visibility matrix

| Stage                  | plaintext | ciphertext | metadata |
| ---------------------- | --------- | ---------- | -------- |
| Browser                | yes       | yes        | yes      |
| Backend (verify/write) | no        | yes        | limited  |
| Backend (export)       | no        | yes        | limited  |
| Operator (local)       | yes       | yes        | yes      |

---

## Failure and compromise behavior (summary)

- backend compromise **does not** expose previously submitted plaintext
- proof-of-work failure halts ingestion early
- frontend compromise affects **future submissions only**
- export tokens are single-use and short-lived

Detailed analysis is covered in:

- `02-threat-model.md`
- `04-backend-compromise.md`
- `05-frontend-trust.md`

---

## Design intent recap

The pipeline is intentionally:

- linear
- explicit
- hostile-environment aware
- resistant to retroactive disclosure

convenience features are omitted to preserve these properties.