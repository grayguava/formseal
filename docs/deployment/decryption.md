# Decryption

> Decryption tooling is under development. This page will be updated when it ships.

---

## What you'll need

- Your **private key** — generated during setup
- The **ciphertext** — pulled from wherever your endpoint stores it

---

## When tooling is ready

The `fse` CLI will handle decryption. You'll pull ciphertexts and decrypt them locally — no server involved, no network calls during decryption.

---

## In the meantime

If you can't wait, decryption is straightforward with libsodium directly. The ciphertext is a standard sealed box — any libsodium binding will open it.

```python
import base64, json
from nacl.public import PrivateKey, SealedBox

raw_key = base64.urlsafe_b64decode(your_private_key_base64 + "==")
box = SealedBox(PrivateKey(raw_key))

ciphertext = base64.urlsafe_b64decode(your_ciphertext + "==")
payload = json.loads(box.decrypt(ciphertext))
```

This is the full decryption — no custom parsing, no proprietary format. The output is the plain JSON payload described in [How it works](../concepts/how-it-works.md).