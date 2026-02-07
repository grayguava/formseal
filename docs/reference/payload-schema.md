# Payload Schema

This document defines the **plaintext payload schema** used by FormSeal **before encryption**, along with versioning strategy and invariants.

The backend **never sees this schema**.  
It exists for:

- frontend correctness
- operator-side decryption
- future compatibility

---

## Scope and visibility

- this schema applies **only to plaintext**
- the payload is constructed in the browser
- the payload is encrypted **as a whole**
- the backend treats ciphertext as opaque data

any schema violation **after encryption** is undetectable by the backend.

---

## High-level structure

Every FormSeal submission encrypts **one JSON object** with the following top-level structure:

```json
{
  "_fs": { ... },
  "data": { ... }
}
```

no other top-level keys are permitted.

---

## `_fs` — FormSeal metadata block

The `_fs` object contains **system metadata** used for versioning and origin tracking.

### Schema

```json
"_fs": {
  "origin": string,
  "version": string
}
```

### Fields

#### `origin`

- type: `string`
- purpose: identifies the logical source of the submission
- example values:
    - `"contact-form"`
    - `"support-form"`
    - `"feedback-form"`

this field is **informational only** and not validated by the backend.

---

#### `version`

- type: `string`
- format: opaque semantic identifier
- current value: `"fs.v2.0.0"`

this value is injected from frontend configuration and **must not be user-controlled**.

---

## `data` — Application payload

The `data` object contains **user-submitted fields and derived metadata**.

### Current schema (contact form)

```json
"data": {
  "fullname": string,
  "email": string,
  "message": string,
  "client_tz": string,
  "client_time": string
}
```

---

### Field definitions

#### `fullname`

- type: `string`
- trimmed
- required
- must be non-empty

---

#### `email`

- type: `string`
- trimmed
- required
- format validation is frontend-only

---

#### `message`

- type: `string`
- required
- maximum length: **1000 characters**

---

#### `client_tz`

- type: `string`
- derived via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- informational only

---

#### `client_time`

- type: `string`
- ISO 8601 timestamp
- derived via `new Date().toISOString()`
- informational only

---

## Validation boundaries

### Frontend validation

The frontend enforces:

- required fields
- length limits
- basic formatting
- payload shape

If validation fails:

- submission is aborted
- encryption does not occur

---

### Backend validation

The backend:

- does **not** validate schema
- does **not** parse payloads
- does **not** enforce field constraints

all schema enforcement is frontend-only.

---

## Encryption boundary

The **entire payload object** is encrypted as a single unit.

Implications:

- field-level access control is impossible server-side
- partial disclosure cannot occur
- schema evolution must be backward-compatible at the operator level

---

## Versioning strategy

### Payload version field

The `_fs.version` field exists to:

- allow operators to interpret decrypted payloads correctly
- enable schema evolution without breaking old data
- avoid backend coupling to payload structure

the backend treats this field as opaque.

---

### Compatibility rules

- existing versions must remain decryptable
- new fields may be added under `data`
- existing fields must not change semantics
- breaking changes require a new version identifier

versioning is **informational**, not enforced.

---

## Forbidden practices

The payload **must not** include:

- secrets
- encryption keys
- backend identifiers
- derived ciphertext metadata
- dynamically injected server values

doing so weakens the security model.

---

## Failure modes

### Frontend compromise

An attacker may:

- alter payload structure
- inject additional fields
- exfiltrate plaintext

backend cannot detect this.

---

### Operator tooling mismatch

If operator tooling does not recognize a payload version:

- decryption still succeeds
- interpretation may fail

operators must handle unknown versions explicitly.

---

## Design intent recap

The payload schema is designed to be:

- minimal
- explicit
- frontend-owned
- backend-agnostic
- forward-extensible

the backend’s ignorance of this schema is **intentional**, not a limitation.