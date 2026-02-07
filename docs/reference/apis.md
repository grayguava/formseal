# API reference

This document specifies the **backend API surface** of FormSeal as implemented via **Cloudflare Pages Functions**.

It describes:

- endpoint purpose
- request/response shape
- authentication and enforcement
- security-relevant behavior

This is **not** a client tutorial.

---

## Global characteristics

- all endpoints expect **JSON** unless stated otherwise
- all responses are intentionally minimal
- the backend treats submission payloads as **opaque data**
- no endpoint performs decryption or plaintext inspection

---

## `/api/challenge`

### Method

```
POST
```

### Purpose

issue server-authoritative parameters for proof-of-work (PoW).

this endpoint establishes:

- freshness window
- abuse resistance difficulty
- server-bound challenge salt

---

### Request body

```json
{
  "bench_ms": number
}
```

- `bench_ms` is a client-provided benchmark value used to tune difficulty
- Must be a positive finite number

---

### Response

```json
{
  "ts": number,
  "salt": string,
  "difficulty": number
}
```

- `ts`: server timestamp (seconds)
- `salt`: base64url-encoded value derived from a server secret and timestam
- `difficulty`: PoW difficulty (server-authoritative)


---

### Security notes

- no user data is accepted
- difficulty is never client-controlled
- salt cannot be forged without the server secret
- response is time-bound

---

## `/api/verify`

### Method

```
POST
```

### Purpose

verify proof-of-work and replay resistance before accepting a submission.

this endpoint enforces:

- payload shape
- freshness window
- PoW correctness
- replay protection

---

### Request body

```json
{
  "ciphertext": string,
  "nonce": string,
  "ts": number,
  "salt": string,
  "difficulty": number
}
```

constraints enforced by backend:

- only the above fields are allowed
- `ciphertext` is treated as opaque
- size limits are enforced
- difficulty bounds are validated

---

### Behavior

Backend actions:

1. validate content type and JSON
2. enforce strict schema
3. recompute expected salt
4. verify PoW
5. enforce freshness window
6. enforce single-use replay protection
7. forward ciphertext internally to `/api/write`

---

### Response

```json
{ "ok": true }
```
on success.

errors are returned with appropriate HTTP status codes.

---

### Security notes

- backend never inspects or decodes ciphertext
- replay keys are derived from proof material
- failure stops the pipeline immediately

---

## `/api/write` (internal only)

### Method

```
POST
```

### Purpose

blindly store verified ciphertext.
this endpoint is **not public**.

---

### Authentication

requires internal header:

```
X-Internal-Auth: <WRITE_SECRET>
```

requests without this header are rejected.

---

### Request body

```json
{
  "ciphertext": string
}
```

constraints:

- exactly one field
- must be a string
- size-limited

---

### Behavior

Backend actions:

- generate a random storage key
- store ciphertext in KV
- apply a bounded TTL

---

### Response

```json
{ "ok": true }
```

---

### Security notes

- No metadata is derived from ciphertext
- Storage keys are random and unlinkable
- Backend remains blind by design

---

## `/api/export-request`

### Method

```
POST
```

### Purpose

Authenticate operator intent and mint a short-lived export token.

this endpoint is part of the **administrative plane**, not public ingestion.

---

### Authentication

This endpoint is **automation-only**.

Authentication is performed using a static bearer token supplied via:

Authorization:  Bearer <ADMIN_AUTOMATION_SECRET>

No browser-based administrative workflows exist.

---

### Request body

The request body is an **empty JSON object**:

```json
{}
```


This endpoint is invoked exclusively by operator-controlled automation tooling.
No user-supplied parameters are accepted.

That’s it. No conditionals, no “minimal JSON”, no ambiguity.

This endpoint is intended to be called only by the FormSeal administrative
automation toolchain.

At present, this is the **only administrative endpoint that ever accepts
network requests from operator tooling**.

---

### Behavior

Backend actions:

- authenticate operator
- generate a cryptographically random export token
- store token with:
    - operator identity
    - expiry (short-lived)
- return a download URL


---

### Response

```
{
  "download_url": "/api/export/{token}",
  "expires_in": number
}
```

---

### Security notes

- no submission data is returned
- tokens are single-use
- tokens are short-lived

---

## `/api/export/{token}`

### Method

```
GET
```

### Purpose

stream encrypted submissions to an authenticated operator.

---

### Authentication

- requires a valid, unexpired export token
- token is burned **before streaming begins**

---

### Behavior

Backend actions:

1. validate token
2. enforce operator identity binding
3. delete token (single-use)
4. stream encrypted data as JSONL:
    - header metadata
    - key/ciphertext pairs
    - summary footer

---

### Response

- content-type: `application/x-ndjson`
- streamed response
- downloadable attachment

---

### Security notes

- backend does not decrypt or transform ciphertext
- token reuse is impossible
- streaming avoids buffering all data in memory

---

## `/api/status/vars`

### Method

```
GET
```

### Purpose

expose backend configuration presence for diagnostics.

---

### Response

```json
{
  "POW_SECRET": boolean,
  "RATELIMIT": boolean,
  "WRITE_SECRET": boolean,
  "FORMSUBMITS": boolean,
  "EXPORT_TOKENS": boolean,
  "ADMIN_AUTOMATION_SECRET": boolean
}
```

---

### Security notes

- reveals presence, not values
- intended for operator diagnostics
- not part of public submission flow

---

## API surface summary

| Endpoint              | role             | trust level |
| --------------------- | ---------------- | ----------- |
| `/api/challenge`      | PoW bootstrap    | public      |
| `/api/verify`         | abuse gate       | public      |
| `/api/write`          | blind storage    | internal    |
| `/api/export-request` | admin auth       | operator    |
| `/api/export/{token}` | encrypted export | operator    |
| `/api/status`         | diagnostics      | operator    |

---

## Design intent recap

The API surface is intentionally:

- small
- explicit
- hostile-environment aware
- incapable of plaintext handling

No endpoint weakens the core guarantee of backend blindness.