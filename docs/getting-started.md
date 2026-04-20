# Getting started

formseal-embed encrypts form submissions in the browser before they leave the user's device.

---

## What you need

- **A POST endpoint** — where encrypted submissions are sent
- **An X25519 key pair** — public/private keys in base64url format

---

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

```python
import base64
from nacl.public import PrivateKey

key = PrivateKey.generate()
print("public: ", base64.urlsafe_b64encode(bytes(key.public_key)).rstrip(b'=').decode())
print("private:", base64.urlsafe_b64encode(bytes(key)).rstrip(b'=').decode())
```

Store the private key somewhere safe. You'll use the public key in config.

### 3. Configure

```bash
fse configure quick
```

You'll be prompted for your endpoint URL and public key.

### 4. Verify

```bash
fse doctor
```

Validates your config, endpoint, encryption keys, and fields. Run this anytime something's not working.

### 5. Add to your page

```html
<script src="/formseal-embed/globals.js"></script>
```

Then add your form markup. See [Integration → HTML](../integration/html.md).

---

## Read more

- [How it works](../concepts/how-it-works.md)
- [Integration → HTML](../integration/html.md)
- [Integration → Fields](../integration/fields.md)
- [Deployment → Endpoint](../deployment/endpoint.md)
- [Deployment → Decryption](../deployment/decryption.md)