# Cheatsheet

Quick reference for common commands.

## Setup

```bash
pip install formseal-embed
fse init
```

## Keys

```bash
fse keygen                    # Generate new keypair
fse set key <publicKey>       # Set public key in config
```

## Endpoint

```bash
fse set endpoint <url>        # Configure POST endpoint
fse --status                 # Show current config
```

## Fields

```bash
fse field add <name> type:<type>     # Add field (type: text/email/tel)
fse field remove <name>               # Remove field
fse field                            # Show fields
```

## Validation

```bash
fse doctor                  # Validate config, endpoint, keys, fields
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