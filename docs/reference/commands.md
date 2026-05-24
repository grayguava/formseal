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

Configure endpoint, public key, and form origin.

```bash
# Interactive mode — prompts until valid
fse set endpoint
fse set key
fse set origin

# Non-interactive — value provided directly
fse set endpoint https://your-api.example.com/submit
fse set key ABcdEfGhIjKlMnOpQrStUvWxYz0123456789_
fse set origin contact-form
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

The `add` keyword can be omitted — the first argument is treated as the field name:

```bash
fse field phone type:tel required:false    # same as fse field add phone type:tel ...
```

**Examples:**

```bash
fse field add name type:text
fse field add email type:email required:true
fse field add message type:text required:true maxLength:1000
fse field remove phone
fse field phone type:tel required:false        # implicit add
```

---

### keygen

Generate a new X25519 keypair for form encryption.

```bash
fse keygen
fse keygen --json           # machine-readable JSON output
```

Default output (human-readable):

```
    Public key:      ABcdEfGhIjKlMnOpQrStUvWxYz0123456789_
    Private key:     zyxwvutsrqponmlkjihgfedcba0987654321_
```

With `--json`:

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
fse --status -fields       # also show per-field details
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