# Cryptography

This document describes the **cryptographic primitives**, **data transformations**, and **security properties** used by FormSeal.

It focuses on **what is actually implemented**, not theoretical alternatives.

---
## Cryptographic goals

FormSeal’s cryptography is designed to achieve:

- confidentiality of submitted data
- backend blindness to plaintext
- protection against retroactive disclosure
- simplicity and auditability

It is **not** designed to provide:

- authentication of submitters
- anonymity
- deniability
- forward secrecy across submissions
- metadata protection

---

## High-level model

FormSeal uses a **one-way encryption model**:

- data is encrypted **in the browser**
- encryption targets an **operator-held public key**
- only the operator can decrypt submissions
- the backend never sees plaintext or keys

there is no server-side cryptography related to submission contents.

---

## Primitive summary

| Purpose               | primitive                              |
| --------------------- | -------------------------------------- |
| Asymmetric encryption | X25519 (libsodium sealed boxes)        |
| Symmetric encryption  | XSalsa20-Poly1305 (libsodium internal) |
| Hashing               | SHA-256 (WebCrypto)                    |
| Proof-of-work         | SHA-256 preimage search                |

all asymmetric encryption is handled by **libsodium**.  
all hashing is handled by **WebCrypto**.

---

## Sealed box encryption

### What is used

FormSeal uses **libsodium sealed boxes** via:

```js
sodium.crypto_box_seal(plaintext, publicKey)
```

This construction provides:

- anonymous sender encryption
- one-way encryption to a public key
- ephemeral key generation per message
- authenticated encryption (AEAD)

the sender does **not** need a keypair.

---

### Why sealed boxes

Sealed boxes are chosen because they:

- require only the recipient’s public key
- avoid long-term client key management
- provide message authenticity implicitly
- are simple to reason about

This fits FormSeal’s **public submission** model.

---

## Key material

### Public key

The operator’s X25519 public key is embedded in frontend code:

```js
FORMSEAL_CONFIG.x25519PublicKey
```

Properties:

- base64url-encoded
- public by design
- not secret
- must be replaced to rotate encryption targets

---

### Private key

The corresponding private key:

- exists **only** in the operator’s local environment
- is never present in backend infrastructure
- is never transmitted over the network
- is used only during offline decryption

loss of the private key makes stored data permanently unrecoverable.

---

## Plaintext preparation

Before encryption:

1. user input is collected
2. payload is constructed as structured JSON
3. JSON is UTF-8 encoded
4. the byte sequence is passed to `crypto_box_seal`

the backend never sees:

- plaintext
- JSON structure
- field names
- metadata

---

## Ciphertext format

The output of encryption is:

- a binary sealed box produced by libsodium
- encoded as **base64url** for transport
- treated as an opaque string by the backend

FormSeal does **not**:

- inspect ciphertext
- tag ciphertext with metadata
- derive storage keys from ciphertext

---

## Integrity and authenticity

Sealed boxes provide:

- integrity protection
- authenticity of the ciphertext

If ciphertext is modified:

- decryption fails
- plaintext is not recoverable

there is no separate MAC or signature layer.

---

## Proof-of-work cryptography

Proof-of-work uses **SHA-256** via WebCrypto.

Properties:

- hash input binds:
    - nonce
    - ciphertext
    - timestamp
    - server salt
    - difficulty
- server verifies leading zero bits
- replay protection is enforced server-side

PoW is **not** a cryptographic security boundary.  
It is an abuse-resistance mechanism.

---

## What is deliberately NOT used

FormSeal does **not** use:

- ed25519 signatures for submissions
- client keypairs
- password-derived keys
- symmetric encryption on the backend
- key derivation functions
- TLS termination for security guarantees (only transport)

This reduces complexity and attack surface.

---

## Failure modes

### Backend compromise

- ciphertext is exposed
- no keys are exposed
- decryption remains infeasible

---

### Frontend compromise

- encryption may be bypassed
- encryption may target attacker keys
- plaintext may be exfiltrated

This affects **future submissions only**.

---

### Key loss

- past submissions become permanently inaccessible
- no recovery mechanism exists

this is an accepted tradeoff.

---

## Cryptographic assumptions

FormSeal assumes:

- libsodium primitives are correctly implemented
- x25519 and XSalsa20-Poly1305 are secure
- SHA-256 is collision- and preimage-resistant
- browser WebCrypto is trustworthy

breaking these assumptions breaks the system.

---

## Summary

FormSeal’s cryptography is intentionally:

- simple
- asymmetric
- one-way
- operator-controlled

There are no layered schemes, no protocol gymnastics, and no hidden trust.

The cryptography exists to answer one question reliably:

> _“Can the backend ever decrypt submissions?”_

The answer is **no**.