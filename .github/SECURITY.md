# Security policy

## Supported versions

Only the latest published release receives security updates.

## Reporting vulnerabilities

Report vulnerabilities privately via the **"Report a vulnerability"** button on this repo's `Security` tab.

**Do not** open a public issue.

Include a description, steps to reproduce, and potential impact.

## Response process

This is an independently maintained open source project. Response times are not guaranteed, but security reports will be reviewed as soon as possible. Please allow reasonable time before public disclosure.

## What formseal-embed protects

- **Interception in transit** — submissions are encrypted before transport. Passive network observers cannot read payload contents without the private key.
- **Server-side data leaks** — plaintext is not exposed to backend proxies, logging middleware, or server-side analytics after encryption occurs in the browser.
- **Storage breaches** — ciphertext requires the private key to decrypt. For strongest isolation, private keys should not reside on machines handling inbound submissions.
- **Runtime tampering resistance** — critical config and crypto modules are frozen after initialization to reduce accidental or late-stage mutation by third-party scripts.

## What it does NOT protect

- **Compromised client** — malware on user's device reads keystrokes before encryption.
- **Malicious host pages** — the page embedding formseal-embed can intercept user input before encryption occurs.
- **Wrong endpoint** — encryption does not authenticate the destination. Submissions sent to an attacker-controlled endpoint remain encrypted, but the attacker can store or forward the ciphertext.
- **Stolen private key** — all past and future submissions become readable.

## Supply chain and JS delivery

Client-side encryption cannot protect against malicious JavaScript delivered before encryption occurs. An attacker who compromises the npm package, CDN, hosting, build pipeline, or embedding page can steal plaintext before it is encrypted.

## Requirements

- **HTTPS required** — refuses to run on HTTP (except localhost/127.0.0.1 in development).

## Encryption

- **Algorithm**: X25519 (libsodium sealed box)
- **Keys**: 32-byte public/private pair, base64url encoded
- **Scope**: entire payload encrypted as one blob

## Key hygiene

- Never commit the private key to version control.
- Store it as an environment variable or secrets manager.
- Keep it off any machine that handles inbound submissions — decrypt separately.

## Threat model

formseal-embed is a client-side browser library. It assumes the user's browser is not compromised and the embedding page is trusted. It does not protect against malicious host pages, compromised build pipelines, or stolen private keys.
