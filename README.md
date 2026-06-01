# formseal-embed

<p align="center">
  <img src="fse.png" alt="formseal-embed">
</p>

<p align="center">
  <img src="https://img.shields.io/pypi/v/formseal-embed?style=flat&label=pypi&labelColor=1e293b&color=3776ab">
  <img src="https://img.shields.io/badge/license-MIT-fc8181?style=flat&labelColor=1e293b">
  <img src="https://img.shields.io/github/actions/workflow/status/useFormseal/embed/publish.yml">
  <img src="https://img.shields.io/badge/formseal-ecosystem-10b981?style=flat&labelColor=1e293b">
</p>

<p align="center">
  A server-blind, browser-native encrypted form poster.
</p>

---

Form submissions are encrypted in the browser using X25519 sealed boxes before reaching your endpoint. The backend stores ciphertext prefixed with `formseal.`. Decryption is operator-controlled.

formseal-embed is not a hosted service, dashboard, or SaaS. It is a drop-in client-side utility.

---

## Installation

**Via pipx (recommended)**

```bash
pipx install formseal-embed
```

**Via pip**

```bash
pip install formseal-embed
```

---

## Quick start

```bash
fse init
fse set endpoint
fse set key
fse set origin
fse --status
```

See [Getting started](./docs/cli/getting-started.md) for key generation.

---

## How it works

```
Browser (formseal-embed)
       │
       ▼ (encrypted submissions)
  Your server / endpoint
       │
       ▼ (fsf fetch — optional)
  Your local machine
```

On submit, formseal:

1. Collects field values by `name` attribute
2. Validates against `fields.jsonl`
3. Seals the payload with `crypto_box_seal`
4. POSTs ciphertext (prefixed `formseal.`) to your endpoint

Your endpoint stores the ciphertext. Only the holder of the private key can decrypt.

---

## Security guarantee

> If the endpoint is fully compromised, seized, or maliciously operated, previously submitted form data remains confidential.

Encryption happens in the browser. The backend stores ciphertext only. Decryption keys never exist in the backend environment. A backend compromise yields no recoverable plaintext.

---

## Wire up your HTML

> After `fse init`, files live in `./formseal-embed/`. Reference them via your server's static path (e.g. `/formseal-embed/globals.js`).

```html
<form id="contact-form">

  <!-- honeypot — hide off-screen with CSS -->
  <input type="text" name="_hp" tabindex="-1" autocomplete="off"
    style="position:absolute;left:-9999px;opacity:0;height:0;">

  <input type="text"  name="name">
  <span data-fse-error="name"></span>

  <input type="email" name="email">
  <span data-fse-error="email"></span>

  <textarea name="message"></textarea>
  <span data-fse-error="message"></span>

  <button type="submit" id="contact-submit">Send message</button>
</form>

<div id="contact-status"></div>

<script>
  window.fseCallbacks = {
    onSuccess: () => document.getElementById('contact-status').textContent = 'Sent securely.',
    onError:   (err) => console.error('formseal error:', err),
  };
</script>

<script src="/formseal-embed/globals.js"></script>
```

---

## Payload format

```json
{
  "version": "fse.v1.0",
  "origin": "contact-form",
  "id": "<uuid>",
  "submitted_at": "<iso8601>",
  "data": {
    "name": "...",
    "email": "...",
    "message": "..."
  }
}
```

The entire object is sealed with `crypto_box_seal`. Your endpoint receives ciphertext prefixed with `formseal.` as the request body.

> No IP, no timezone, no fingerprints — just the data you explicitly collect.

---

## Field configuration

Fields are defined in `fields.jsonl` (one JSON object per line):

```json
{"name": {"required": true, "maxLength": 100}}
{"email": {"required": true, "type": "email"}}
{"message": {"required": true, "maxLength": 1000}}
```

Manage fields with the CLI:

```bash
fse field add phone type:tel required:false
fse field remove company
```

---

## CSS hooks

| Selector | When |
|---|---|
| `[data-fse-error="field"]` | Populated with a validation error |
| `[aria-invalid="true"]` | Set on invalid inputs |
| `[data-fse-status="success"]` | Set on status element on success |
| `[data-fse-status="error"]` | Set on status element on error |

---

## What formseal-embed does not do

- No admin dashboard or inbox UI
- No hosted service
- No bundled decryption tools (yet)
- No npm dependencies at runtime

These are intentional.

---

## Documentation

- [Getting started](/docs/cli/getting-started.md)
- [CLI → Commands](/docs/cli/commands.md)
- [CLI → Cheatsheet](/docs/cli/cheatsheet.md)
- [Browser runtime → How it works](/docs/browser-runtime/how-it-works.md)
- [Browser runtime → HTML](/docs/browser-runtime/html.md)
- [Browser runtime → Fields](/docs/browser-runtime/fields.md)
- [Browser runtime → JavaScript](/docs/browser-runtime/javascript.md)
- [Browser runtime → Config](/docs/browser-runtime/config.md)
- [Decryption](/docs/decryption.md)
- [Security](/.github/SECURITY.md)

---

## License

MIT