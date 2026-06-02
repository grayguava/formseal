# Getting started

formseal-embed encrypts form submissions in the browser before they leave the user's device.

## What you need

- **A POST endpoint** — where encrypted submissions are sent
- **An X25519 key pair** — public/private keys in base64url format

## Quick setup

### 1. Install

```bash
pip install formseal-embed
```

### 2. Scaffold

```bash
fse init
```

Creates a `formseal-embed/` directory in your project.

### 2. Generate keys

```bash
fse keygen
```

This outputs your public/private key pair. Store the private key somewhere safe — you'll need it to decrypt submissions.

### 3. Configure

```bash
fse set endpoint
fse set key
fse set origin
```

You'll be prompted for your endpoint URL, public key, and form origin. Use `fse status` to check your config. Add `-fields` to see per-field details.

### 4. Add to your page

```html
<script src="/formseal-embed/globals.js"></script>
```

Then add your form markup. See [Browser runtime → HTML](../browser-runtime/html.md).

## Read more

- [How it works](../browser-runtime/how-it-works.md)
- [Browser runtime → HTML](../browser-runtime/html.md)
- [Browser runtime → Fields](../browser-runtime/fields.md)
- [Decryption](../decryption.md)
