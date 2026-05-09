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
- `config/fse.config.js` — endpoint, public key, origin
- `config/fields.jsonl` — field definitions
- `globals.js` — client-side encryption library

---

### set

Configure endpoint and public key.

```bash
# Interactive mode — prompts until valid
fse set endpoint
fse set key

# Non-interactive — value provided directly
fse set endpoint https://your-api.example.com/submit
fse set key ABcdEfGhIjKlMnOpQrStUvWxYz0123456789_
```

Press `Enter` with no input to skip.

---

### field

Manage form fields.

```bash
fse field add <name> type:<type>
fse field remove <name>
```

**Field types:** `text`, `email`, `tel`

**Examples:**

```bash
fse field add name type:text
fse field add email type:email required:true
fse field add message type:text required:true maxLength:1000
fse field remove phone
```

---

### doctor

Validate configuration and files.

```bash
fse doctor
```

Checks:
- Config file exists
- Endpoint uses HTTPS
- Public key format is valid
- Fields are properly defined

---

### keygen

Generate a new X25519 keypair for form encryption.

```bash
fse keygen
```

Output:

```json
{
  "publicKey": "ABcdEfGhIjKlMnOpQrStUvWxYz0123456789_",
  "privateKey": "zyxwvutsrqponmlkjihgfedcba0987654321_"
}
```

**WARNING:** Keep both keys safe. The private key is needed to decrypt submissions — loss means permanent data loss.

---

### reset

Remove and re-scaffold.

```bash
fse reset
```

---

### --status

Show current configuration.

```bash
fse --status
```

---

### --help

Show help information.

```bash
fse --help
```

---

### --version

Show version number.

```bash
fse --version
fse version
```

---

### --about

Show project information.

```bash
fse --about
```

---

### --aliases

Show shorthand aliases.

```bash
fse --aliases
```

| Short | Canonical |
|-------|-----------|
| `-i`  | `init`    |
| `-r`  | `reset`   |
| `-f`  | `field`   |
| `-s`  | `set`     |

---

## Shorthand flags

| Flag | Description |
|------|-------------|
| `-i` | Scaffold project (same as `fse init`) |
| `-r` | Re-scaffold (same as `fse reset`) |
| `-f` | Field management (same as `fse field`) |
| `-s` | Configure endpoint/key (same as `fse set`) |