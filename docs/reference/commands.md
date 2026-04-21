# Commands reference

Complete reference for all formseal-embed commands.

## Usage syntax

```bash
fse <command> [options] [arguments]
```

## Commands

### init

Scaffold formseal-embed into your project.

```bash
fse init
```

Creates a `formseal-embed/` directory with:
- `config/fse.config.js` — main configuration
- `config/fields.jsonl` — field definitions
- `globals.js` — client-side encryption library

**Interactive prompts:**

1. Configure now? (y/n)
2. POST endpoint (your encryption endpoint)
3. X25519 public key (base64url encoded)

---

### configure quick

Set endpoint and public key in one go.

```bash
fse configure quick
```

Prompts for:
1. POST endpoint URL
2. X25519 public key (base64url)

---

### configure field

Manage form fields.

```bash
# Add a field
fse field add <name> type:<type>

# Remove a field
fse field remove <name>
```

**Field types:** `text`, `email`, `textarea`, `number`, `tel`

**Examples:**

```bash
fse field add name type:text required:true
fse field add email type:email required:true
fse field add message type:textarea required:true maxLength:1000
fse field remove phone
```

---

### update

Update configuration values.

```bash
# Update POST endpoint
fse update endpoint <url>

# Update public key
fse update key <base64url>

# Update form origin
fse update origin <name>
```

**Examples:**

```bash
fse update endpoint https://your-api.example.com/submit
fse update key ABcdEfGhIjKlMnOpQrStUvWxYz0123456789_
fse update origin contact-form
```

---

### doctor

Validate configuration and files.

```bash
fse doctor
```

Checks:
- Config file exists
- Endpoint is valid HTTPS URL
- Public key format is valid
- Fields are properly defined

---

### --version

Show version.

```bash
fse --version
```

Output: `v3.4.0`

---

### --aliases

Show command shorthand aliases.

```bash
fse --aliases
```

| Short | Canonical |
|-------|-----------|
| `-qc` | configure quick |
| `-f` | field |
| `-u` | update |

---

### Shorthand flags

| Flag | Description |
|------|-------------|
| `-qc` | Quick configure (same as `fse configure quick`) |
| `-f` | Field management (same as `fse field`) |
| `-u` | Update config (same as `fse update`) |
