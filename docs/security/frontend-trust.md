
# Frontend trust model

This document defines the **frontend trust assumptions** in FormSeal, explains **why the frontend is security-critical**, and describes **exactly what breaks if frontend integrity is lost**.

This is the weakest trust boundary in the system by design.

---

## Role of the frontend in FormSeal

In FormSeal, the frontend is responsible for **all security-critical operations** related to confidentiality:

- collecting plaintext user input
- constructing the payload
- encrypting payloads
- computing proof-of-work
- submitting encrypted data to the backend

the backend **cannot compensate** for a malicious or modified frontend.

---

## Files that form the trust surface

The following frontend files are **security-critical**:

- `config.js`
- `crypto.js`
- `payload.js`
- `pow.js`
- `form.js`

if any of these files are modified by an attacker, FormSeal’s guarantees for **future submissions** no longer hold.

---

## Encryption trust anchor

### Where encryption happens

Encryption occurs exclusively in the browser via:

```js
sealJSONToPublicKey(obj, publicKeyB64)
```

defined in `crypto.js`.

**Properties:**

- uses libsodium sealed boxes
- encrypts serialized JSON payloads
- targets a static X25519 public key embedded in `config.js`

The backend **never sees plaintext** and **never performs encryption**.

---

### Implication

If the frontend encryption logic is altered:

- plaintext may be exfiltrated before encryption
- payloads may be encrypted to an attacker-controlled key
- encryption may be skipped entirely

the backend **cannot detect this**.

---

## Public key distribution

The operator’s X25519 public key is embedded directly in:

```js
FORMSEAL_CONFIG.x25519PublicKey
```

This is a deliberate design choice.

Consequences:

- public key integrity depends on frontend code integrity
- key rotation requires frontend redeployment
- backend compromise alone does **not** expose the private key

---

## Payload construction trust

Payloads are constructed in `payload.js`:

```js
buildContactPayload(form, version)
```

This function:

- extracts form fields
- injects metadata (`_fs.origin`, `_fs.version`)
- attaches client timezone and timestamp
- enforces basic validation

If this function is modified:

- sensitive fields may be dropped, added, or altered
- metadata may be forged
- plaintext may be leaked prior to encryption

again, the backend has **no visibility** into this.

---

## Proof-of-work enforcement

Proof-of-work is computed client-side in `pow.js`.

The backend:

- verifies PoW correctness
- verifies freshness
- enforces replay protection

However:

- the frontend controls **when** PoW is computed
- a malicious frontend can selectively disable PoW
- backend checks do not protect against malicious code delivery

PoW is **abuse resistance**, not a security boundary.

---

## Backend submission boundary

The frontend submits **only** to:

```js
FORMSEAL_CONFIG.submitUrl = "/api/verify"
```

The frontend:

- never talks directly to `/api/write`
- cannot bypass verification unless backend code is also compromised

this boundary protects against malformed or direct submissions, **not against malicious frontend logic**.

---

## Cloudflare Pages implication (single point of failure)

FormSeal is deployed on **Cloudflare Pages with Functions**, which means:

- frontend and backend share the same Cloudflare account
- Pages controls frontend JavaScript delivery
- Functions control backend execution

therefore:

> **A Cloudflare account compromise is a total compromise of frontend trust.**

This is an explicit and accepted tradeoff.

---

## What a frontend compromise breaks

If an attacker can modify frontend code:

- confidentiality of **future submissions** is lost
- encryption guarantees no longer apply
- payload integrity is lost
- users cannot detect compromise

---

## What a frontend compromise does NOT break

Even under full frontend compromise:

- previously submitted data remains encrypted
- stored ciphertext remains safe
- operator private keys are not exposed
- retroactive disclosure does not occur

this is the **core security invariant** of FormSeal.

---

## Why this is acceptable by design

FormSeal prioritizes:

- **retroactive confidentiality**
- **post-compromise damage limitation**
- **minimal backend trust**

Over:

- continuous integrity guarantees
- code-delivery hardening
- frontend attestation

this matches real-world threat models involving:

- hosting provider compromise
- seizure
- operator coercion

---

## Operator responsibilities

Operators must understand that:

- frontend integrity is assumed, not enforced
- a detected frontend compromise invalidates future submissions
- keys must be rotated after compromise
- affected submission windows must be treated as tainted

FormSeal does not automate these responses.

---

## Summary

FormSeal’s frontend is a **trusted but fragile boundary**.

- if it holds, the system works as intended
- if it breaks, only future data is affected
- past data remains protected

this tradeoff is **intentional**, **documented**, and **non-negotiable**.