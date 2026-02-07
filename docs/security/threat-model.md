# Threat model

This document defines the **threat model** for FormSeal:  
who the adversaries are, what is assumed, what is protected, and what is explicitly **not** protected.

FormSeal’s security guarantees are intentionally narrow and are stated precisely.

---

## Security goal

FormSeal’s primary security goal is:

> **Prevent retroactive disclosure of submitted form data, even if backend infrastructure is fully compromised.**

FormSeal does **not** attempt to prevent compromise.  
it attempts to **limit the damage after compromise**.

---
## Assets

The primary assets FormSeal is designed to protect are:

- plaintext contents of form submissions
- confidentiality of previously submitted data
- operator-held private decryption keys

Secondary assets (best-effort only):

- submission integrity before compromise
- basic resistance to automated abuse

---
## Deployment model (important context)

FormSeal is designed to run on **Cloudflare Pages with Functions**:

- the **frontend** is served via Cloudflare Pages
- the **backend APIs** are implemented as Pages Functions
- API routes are automatically bound to the frontend deployment

as a result, the **Cloudflare account** is a **single trust root** for both:

- frontend code delivery
- backend execution

this has direct implications for the threat model.

---

## Adversaries

### 1. Backend operator / hosting provider

Capabilities:

- full access to backend runtime
- ability to read and modify server-side code
- access to storage (KV)
- ability to inspect logs and environment variables

Assumed intent:

- Curious, negligent, malicious, or coerced

This adversary is **explicitly assumed**.

---

### 2. External attacker (network-level)

Capabilities:

- observe network traffic
- replay or modify requests
- attempt to bypass abuse controls
- attempt to flood ingestion endpoints

Limitations:

- cannot break modern cryptography
- cannot access operator private keys

---

### 3. Cloudflare account compromise (total infrastructure compromise)

Capabilities:

- modify frontend code served to users
- modify backend Functions code
- access all stored ciphertext
- disable or weaken verification logic
- observe operational metadata

this adversary represents a **complete trust collapse** of the deployment.

---

### 4. Malicious client

Capabilities:

- submit malformed payloads
- attempt replay attacks
- attempt to bypass proof-of-work
- flood ingestion endpoints

This adversary is expected and partially mitigated.

---

## Trust assumptions

FormSeal makes the following **explicit assumptions**:

1. **Client-side encryption is trustworthy at the time of submission**
    - the frontend code and encryption logic has not been maliciously modified

2. **Operator private keys are kept secure**
    - keys never exist in backend environments
    - operators control key custody locally

3. **Cryptographic primitives are secure**
    - libsodium sealed boxes (X25519)
    - SHA-256

if these assumptions fail, FormSeal’s guarantees may no longer hold.

---

## Security guarantees

Under the stated assumptions, FormSeal guarantees:

### 1. Backend blindness

- backend never sees plaintext
- backend never holds decryption keys
- stored data is opaque ciphertext

### 2. Retroactive confidentiality

- compromise of backend or storage does **not** expose past submissions
- seizure or exfiltration of storage yields no recoverable plaintext

### 3. Cryptographic separation

- ingestion and decryption are isolated by design
- administrative convenience cannot weaken backend blindness

---

## Non-goals (explicit)

FormSeal **does not guarantee**:

- integrity of future submissions after frontend compromise
- protection against malicious frontend code delivery
- anonymity or metadata privacy
- strong spam or abuse prevention
- multi-tenant isolation
- availability under attack

These are intentional exclusions.

---

## Compromise scenarios

### Backend compromise (Functions only)

Impact:

- attacker gains access to ciphertext
- attacker may modify backend code

Result:

- past submissions remain confidential
- future submissions remain encrypted if frontend is unchanged

---

### Frontend compromise (Pages)

Impact:

- attacker can modify encryption logic
- attacker may exfiltrate plaintext from users

Result:

- past submissions remain confidential
- future submissions are no longer trustworthy

---

### Cloudflare account compromise (single point of failure)

Impact:

- both frontend and backend are compromised

Result:

- retroactive confidentiality holds
- forward integrity and confidentiality are lost

operators must assume **all future submissions are compromised** after this point.
this is an explicit and accepted design tradeoff.

---

## Operator responsibilities

Operators are responsible for:

- secure key generation and custody
- monitoring for infrastructure compromise
- rotating keys after compromise
- treating post-compromise submissions as untrusted
- protecting decrypted data at rest

FormSeal does not automate these responsibilities.

---

## Summary

FormSeal is designed to answer one question correctly:

> _“What happens to my data if the server is compromised?”_

The answer is:

> **Previously submitted data remains confidential.**

everything else is secondary.