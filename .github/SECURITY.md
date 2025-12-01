# Security Policy

## Supported Versions
Only the latest stable release of FormSeal receives security updates.

## Reporting a Vulnerability
If you discover a security vulnerability, **do not open a public GitHub issue.**

Instead, please use GitHub’s **Private Vulnerability Report** feature:

https://github.com/arbyte/formseal/security/advisories/new

This ensures the report remains confidential until it is reviewed and resolved.

## Scope
The following components are in-scope:
- Client-side encryption (X25519 sealed boxes + AES-GCM)
- Admin authentication (Ed25519 signatures)
- Worker validation logic (Basic / Enhanced / Pro)
- KV data storage integrity and privacy
- Any bypass that results in plaintext exposure

## Out of Scope
The following issues are not considered vulnerabilities:
- Denial-of-service attacks against public Workers
- Abuse of demo keys or demo Workers
- High-volume spam submissions (use Enhanced/Pro if needed)
- Self-misconfiguration of Workers, KV bindings, or environment variables
- Loss of private keys (by design, messages cannot be recovered)

## Responsible Disclosure
We follow a responsible disclosure process.  
Valid reports will be reviewed promptly, and fixes will be released as needed.
