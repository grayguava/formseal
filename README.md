# FormSeal

FormSeal is a **browser-native encrypted form submission pipeline** for public
websites where the backend must not be trusted with plaintext data.

Submissions are encrypted **in the browser**, gated by basic abuse resistance,
and stored as **opaque ciphertext** on the backend.  
The server is intentionally blind.

FormSeal is a pipeline, not a hosted service or admin product.

---

## High-level idea

FormSeal separates concerns deliberately:

- **Browser**: payload construction, encryption, proof-of-work  
- **Backend**: blind ingestion, replay checks, controlled export  
- **Operator environment**: export, decryption, inspection (offline)

The backend never holds decryption keys.

---

## High-level flows

### Public submission

#### Browser  
→ /api/challenge  
→ client-side PoW + encryption  
→ /api/verify  
→ /api/write  
→ KV (ciphertext only)

### Operator export

#### Operator  
→ /api/export-request  
→ /api/export/{token}  
→ local decryption (offline)


---

## What FormSeal does NOT do

- No admin dashboard
- No server-side decryption
- No inbox UI
- No hosted service
- No claim of strong abuse prevention

These are intentional design choices.

---

## Repository layout


```
formseal/  
├── frontend/ # browser-side pipeline  
├── backend/ # Cloudflare Pages Functions  
├── docs/ # architecture, threat model, deployment notes  
└── wrangler.toml.example
```


---

## Configuration & deployment

Deployment contracts, required secrets, and KV bindings are documented in:

```
wrangler.toml.example
```

This file is documentation, not a deployable config.

---

## Admin tooling

FormSeal does not include admin tooling or decryption utilities.

Operator workflows (export, decrypt, inspect) live in a separate repository:

**FormSeal Sync**  
https://github.com/grayguava/formseal-sync

---

## Documentation

Detailed documentation lives under:
```
docs/
```


Including:
- architecture and trust boundaries
- export API details
- threat model
- deployment notes

---

## Scope

FormSeal implements **ingestion and export only**.

Everything else is intentionally out of scope.

---

## License

**MIT**