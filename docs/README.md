# Documentation

Welcome to the formseal-embed documentation.

## Quick links

| Guide | Description |
|-------|-------------|
| [Getting Started](./cli/getting-started.md) | Installation and first-time setup |
| [CLI → Commands](./cli/commands.md) | Complete command reference |
| [CLI → Cheatsheet](./cli/cheatsheet.md) | Quick reference for common commands |
| [CLI → Versioning](./cli/versioning.md) | Payload versioning |
| [Browser runtime → How it works](./browser-runtime/how-it-works.md) | How encryption works |
| [Browser runtime → HTML](./browser-runtime/html.md) | Adding forms to your site |
| [Browser runtime → Fields](./browser-runtime/fields.md) | Configuring form fields |
| [Browser runtime → JavaScript](./browser-runtime/javascript.md) | Callbacks and events |
| [Browser runtime → Config](./browser-runtime/config.md) | Full configuration reference |
| [Decryption](./decryption.md) | Decrypting submissions |
| [Security](../.github/SECURITY.md) | Security model and guarantees |
| [Troubleshooting](./troubleshooting.md) | Common issues and solutions |

## What is formseal-embed?

formseal-embed is a client-side JavaScript library that encrypts form submissions in the browser before they leave the user's device. The backend receives ciphertext prefixed with `formseal.` — plaintext never touches your server.

Use it together with [formseal-fetch](https://github.com/useFormseal/fetch) to download and [formseal-decrypt](https://github.com/useFormseal/decrypt) to decrypt submissions.

## Workflow

```
formseal-embed (browser encryption)
       │
       ▼ (encrypted submissions)
  Storage backend
       │
       ▼ (fsf fetch)
  formseal.ct.jsonl
       │
       ▼ (fsd decrypt)
  formseal.decrypted.jsonl
       │
       ▼
  You
```
