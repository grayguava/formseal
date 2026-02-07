# Quickstart

This quickstart verifies **one thing only**:

> FormSeal encrypts data in the browser, stores ciphertext on the backend, and allows decryption **without the backend ever seeing plaintext**.

If you want correct, hardened deployment details, read the **Deployment** document.  
This file is about **proving the model works**.

---

## What you will verify

By the end, you will confirm that:

- plaintext exists only in the browser
- the backend stores opaque ciphertext
- decryption works using an operator-held key
- the backend never needs plaintext access

---

## Prerequisites

You need:

- an existing FormSeal deployment (see **Deployment**)
- access to cloudflare KV for inspection
- a browser

No admin tooling required.

---

## Step 1: Generate an encryption keypair

FormSeal encrypts submissions to a static **X25519 public key**.

Generate a keypair using the FormSeal generator:

[https://formseal.pages.dev/tools/x25519-generate/](https://formseal.pages.dev/tools/x25519-generate/)

This tool:

- generates a libsodium-compatible X25519 keypair
- outputs **base64url** encoding exactly as FormSeal expects
- avoids padding and encoding errors

Keep the **private key offline**.  
the backend must never see it.

---

## Step 2:  Set the public key in the frontend

Edit:

```js
frontend/config.js
```

Set:

```js
FORMSEAL_CONFIG.x25519PublicKey = "<BASE64URL_PUBLIC_KEY>";
```

redeploy the frontend if needed.

---

## Step 3:  Submit a test form

Open the deployed site and submit the form.

expected behavior:

- the browser performs encryption before submission
- the submission succeeds
- no plaintext is sent to the backend

---

## Step 4:  Inspect stored data

Open the bound KV namespace used for submissions.

Confirm that:

- values are **opaque base64url blobs**
- no readable user data exists
- no structured fields are visible

if you see plaintext here, the deployment is broken.

---

## Step 5:  Decrypt ciphertext locally

To verify encryption correctness, use the FormSeal decrypt tool:

[https://formseal.pages.dev/tools/ciphertext-decrypt/](https://formseal.pages.dev/tools/ciphertext-decrypt/)

Steps:

1. copy a ciphertext **base64url** blob from KV
2. paste it into the decrypt tool
3. paste your **X25519 private key**
4. decrypt locally in the browser

The backend is not involved in this step.

successful decryption confirms:

- encryption is correct
- keys are correct
- backend blindness holds

---

## What this quickstart does NOT cover

This document intentionally excludes:

- cloudflare configuration details
- environment variables and bindings
- admin export workflows
- automation or inbox tooling
- production hardening

all of that lives in the **Deployment** document.

---

## Summary

If this quickstart succeeds:

- FormSeal’s core security model is working
- plaintext never touches the backend
- stored data remains confidential after compromise

everything else is secondary.