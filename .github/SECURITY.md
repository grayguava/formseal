# Security Policy

## Supported versions

Only the latest release is supported.


## Reporting vulnerabilities

If you find a security vulnerability, please report it privately to allow time for a fix before public disclosure.

**Do NOT** open a public GitHub issue for security vulnerabilities.

### How to report

**GitHub Security Advisories**: Use the "Report a vulnerability" button on this repo's `Security` tab

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

### Response timeline

- **Acknowledgment**: Best effort (typically within a few days)
- **Assessment**: Best effort based on availability
- **Fix timeline**: Depends on severity and maintainer bandwidth

---

## What formseal-embed protects

- **Interception in transit** — server receives ciphertext only
- **Server-side data leaks** — plaintext never reaches your server
- **Storage breaches** — ciphertext requires private key to decrypt

---

## What formseal-embed does NOT protect

- **Compromised client** — malware on user's device can read keystrokes before encryption
- **Wrong endpoint** — encryption works even if submitting to attacker-controlled URL
- **Stolen private key** — all past and future submissions become readable

---

## Runtime hardening

Version 3.6.0+ includes:

- **Immutable runtime** — internal state frozen at initialization
- **Locked modules** — prevents monkey-patching of crypto, validation, payload, and form modules
- **HTTPS enforcement** — refuses to run on HTTP (except localhost/127.0.0.1 in development)

---

## Threat model

formseal-embed is a client-side browser library. It assumes:

- The user's browser is not compromised
- The user controls their own device
- The endpoint URL is correct and not intercepted

It does **NOT** protect against:

- Malware on the user's device
- Man-in-the-middle attacks on the endpoint
- Stolen private keys

---

## See also

[Security Concepts](/docs/concepts/security.md)