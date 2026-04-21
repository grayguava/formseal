# Documentation

Welcome to the formseal-embed documentation.

## Quick links

| Guide | Description |
|-------|-------------|
| [Getting Started](./getting-started.md) | Installation and first-time setup |
| [Concepts → How it works](./concepts/how-it-works.md) | How encryption works |
| [Concepts → Security](./concepts/security.md) | Security model and guarantees |
| [Integration → HTML](./integration/html.md) | Adding forms to your site |
| [Integration → Fields](./integration/fields.md) | Configuring form fields |
| [Deployment → Endpoint](./deployment/endpoint.md) | Setting up your POST endpoint |
| [Deployment → Decryption](./deployment/decryption.md) | Decrypting submissions |
| [Troubleshooting](./troubleshooting.md) | Common issues and solutions |

## What is formseal-embed?

formseal-embed is a client-side JavaScript library that encrypts form submissions in the browser before they leave the user's device. The backend receives opaque ciphertext only — plaintext never touches your server.

Use it together with [formseal-fetch](https://github.com/grayguava/formseal-fetch) to download and decrypt submissions.

## Workflow

```
User browser (formseal-embed)
        │
        ▼ (encrypted submission)
   Your server (POST endpoint)
        │
        ▼ (ciphertext storage)
   You (formseal-fetch → decrypt)
```
