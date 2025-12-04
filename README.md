# FormSeal
**End-to-end encrypted contact form system for Cloudflare Workers**  
_Server-blind · Client-side E2EE · Stateless Ed25519 admin login_

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)
![Encryption](https://img.shields.io/badge/E2EE-X25519%20%2B%20AES--GCM-blue)
![Status](https://img.shields.io/badge/Production--Ready-Yes-success)

FormSeal is a server-blind, end-to-end encrypted contact form system built for Cloudflare Workers.  
Messages are encrypted entirely in the browser (X25519 + AES-GCM) and stored as ciphertext in KV.  
Admins decrypt locally using their private key — the Worker never sees plaintext.

---

## 🚀 Quickstart (5 Steps)

### 1. Generate Keys
Open in your browser:
- /tools/keytools/x25519-generator.html  
- /tools/keytools/ed25519-generator.html  

Save:
- FORM_PUBLIC_KEY / FORM_PRIVATE_KEY  
- ADMIN_PUBLIC_KEY / ADMIN_PRIVATE_KEY  

---

### 2. Configure Worker
In Cloudflare Dashboard → Worker Settings:
- Bind KV: MESSAGES  
- Add ADMIN_PUBLIC_KEY  
- (Pro) Add TURNSTILE_SECRET  

Publish the Worker.

---

### 3. Configure the Form
Inside basic/, enhanced/ or pro/ set:
- FORM_PUBLIC_KEY  
- WORKER_ENDPOINT  
- (Pro) TURNSTILE_SITEKEY  

---

### 4. Host Frontend + Tools
Any static host works:
Cloudflare Pages, Netlify, GitHub Pages, etc.

---

### 5. Use Admin Panel
Open:
/tools/admin/admin.html

Decrypt messages locally using:
- ADMIN_PRIVATE_KEY  
- FORM_PRIVATE_KEY  

---

## 🔒 Key Features

- End-to-end encryption (X25519 sealed boxes + AES-GCM)
- Server-blind storage (KV stores ciphertext only)
- Stateless Ed25519 admin authentication
- Local-only decryption (plaintext never leaves your device)
- No build tools, npm, or bundlers — pure HTML + JS
- Multiple variants: Basic, Enhanced, Pro (Turnstile)
- Full tooling suite (admin panel, key generators, validators)

---

## 🧱 Variants

| Variant     | Security     | Privacy | Notes |
|-------------|--------------|---------|-------|
| **Basic**   | Minimal      | High | Pure E2EE, no rate limits, no Turnstile |
| **Enhanced**| High         | High    | Rate limits, spam filtering, size caps |
| **Pro**     | Very High    | Lower   | Turnstile validation, strongest bot protection |

---

## 🧰 Tools Included

- X25519 + Ed25519 key generators  
- Keypair validator  
- Admin dashboard (login → fetch → decrypt → search → export)  
- Single-message decryptor  
- Tools hub: /tools/index.html

---

## 📁 Repository Structure

```
/
├── basic/
├── enhanced/
├── pro/
│
├── tools/
│   ├── index.html
│   ├── sodium.js
│   │
│   ├── admin/
│   │   ├── admin.html
│   │   └── single-message-decryptor.html
│   │
│   └── keytools/
│       ├── ed25519-generator.html
│       ├── x25519-generator.html
│       └── verify-ed25519-pair.html
│
├── LICENSE
├── README.md
└── .gitignore
```

---

## 📘 Full Documentation
A complete setup guide with screenshots is available in the `docs/` directory.

---

## 📜 License
MIT License — permissive and commercial-friendly.  
See the [LICENSE](LICENSE) file for details.

---

## ⭐ Support
If you find FormSeal useful, consider starring the repository.  
It helps others discover privacy-focused alternatives.
