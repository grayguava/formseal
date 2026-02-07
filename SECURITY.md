# Security Policy

FormSeal is currently maintained by a **single individual**.
There is no dedicated security team or formal SLA.

That said, security issues are taken seriously and handled in good faith.

---

## Supported Versions

Only the **latest stable release** of FormSeal is supported.

Older releases, experimental commits, and archived tooling may contain known or
unknown issues and should not be relied upon.

---

## Reporting a Vulnerability

If you discover a security vulnerability, **do not open a public GitHub issue**.

Please report it using GitHub’s **Private Vulnerability Report** feature:

https://github.com/grayguava/formseal/security/advisories/new

This keeps reports confidential while they are reviewed.

Because this project is maintained by a single person, responses may not be
immediate, but all valid reports will be reviewed.

---

## Scope

The following components are **in scope** for security reports:

### Client-side cryptography
- X25519 key exchange and sealed-box usage
- Symmetric encryption and key handling in the browser
- Integrity and confidentiality of encrypted payloads

### Backend logic (Cloudflare Pages Functions)
- Request validation and replay protection
- Proof-of-work challenge and verification logic
- Enforcement of authentication and authorization boundaries
- Export and export-request endpoints (ciphertext-only guarantees)

### Data protection
- Confidentiality of stored submissions
- Integrity of data written to KV namespaces
- Any scenario where plaintext is exposed or derivable by the backend

### Administrative surfaces
- Automation-based admin access controls
- Export token issuance, validation, and expiration
- Separation between public submission APIs and operator-only APIs

### Any issue that results in
- Unauthorized access
- Privilege escalation
- Authentication or authorization bypass
- Plaintext exposure of protected data
- Meaningful tampering with stored ciphertext

---

## Out of Scope

The following are **out of scope** and will not be treated as security
vulnerabilities:

- Denial-of-service (DoS) attacks against publicly accessible endpoints
- High-volume spam or automated submissions
- Limitations inherent to basic abuse-resistance mechanisms
- User-side misconfiguration, including:
  - Cloudflare bindings
  - KV namespaces
  - Environment variables
  - Deployment mistakes
- Loss, exposure, or mishandling of private keys by operators or users
  - By design, encrypted data cannot be recovered without keys
- Issues in:
  - browsers
  - Cloudflare infrastructure
  - third-party cryptographic libraries (unless misused by FormSeal)

---

## Related Tooling

Administrative export and inspection tooling lives in a separate repository:
**formseal-sync**.

Security issues in that repository should be reported there, unless they directly
affect the FormSeal backend or client pipeline.

---

## Responsible Disclosure

FormSeal follows a responsible disclosure approach.

Valid reports will be investigated and addressed as time and circumstances
allow. Please allow reasonable time for response before any public disclosure.

Good-faith research and responsible reporting are appreciated.

