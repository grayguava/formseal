# Cheatsheet

Quick reference for common commands.

## Setup

```bash
pip install formseal-embed
fse init
```

## Keys

```bash
fse keygen                    # Generate new keypair (--json for JSON output)
fse set key <publicKey>       # Set public key in config
```

## Endpoint / Origin / Logging

```bash
fse set endpoint <url>        # Configure POST endpoint
fse set origin <name>         # Set form origin identifier
fse set logging <true|false>  # Toggle info and warning logs (default: true)
fse --status                 # Show current config
```

## Fields

```bash
fse field <name> type:<type>         # Add field (implicit, type: text/email/tel)
fse field add <name> type:<type>     # Add field (explicit)
fse field remove <name>              # Remove field
```

## Status

```bash
fse --status                # Show current config
fse --status -fields       # Show config with per-field details
```

## Help

```bash
fse --help                  # Show all commands
fse --aliases               # Show shorthand flags
fse --version              # Show version
```

## Flags

| Short | Command |
|-------|---------|
| `-i` | `init` |
| `-r` | `reset` |
| `-f` | `field` |
| `-s` | `set` |