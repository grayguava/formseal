# Contributing to formseal-embed

Thanks for your interest in contributing! Contributions of all kinds are welcome — bug fixes, security, new features, docs, and more.

---

## Table of contents

- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Versioning](#versioning)
- [Code style](#code-style)
- [Submitting changes](#submitting-changes)
- [Testing](#testing)
- [Reporting issues](#reporting-issues)

---

## Getting started

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/useFormseal/embed.git
   cd formseal-embed
   ```

2. Install in development mode using `pipx` (recommended) or `pip`:
   ```bash
   pipx install -e .
   ```
3. Verify it works:
   ```bash
   fse
   ```

> **Note:** Always use `pipx install -e .` for local dev — it gives you an isolated environment and the version header will display correctly from source.

---

## Project structure

```
formseal-embed/
├── fse/
│   ├── cli.py                 # Entry point, dispatch
│   ├── __main__.py            # python -m fse support
│   ├── src/                   # Client-side JavaScript (scaffold source)
│   ├── commands/              # CLI commands (flat)
│   │   ├── init.py            # fse init
│   │   ├── reset.py           # fse reset
│   │   ├── set.py             # fse set endpoint / key / origin
│   │   ├── field.py           # fse field add / remove
│   │   ├── keygen.py          # fse keygen
│   │   ├── about.py           # fse --about
│   │   ├── version.py         # fse --version
│   │   ├── help.py            # fse --help
│   │   └── status.py          # fse --status
│   ├── helpers/               # Shared logic
│   │   ├── config.py          # Paths, patching, validation
│   │   ├── errors.py          # Error handlers
│   │   ├── aliases.py         # Shorthand aliases
│   │   └── fields.py          # Field type definitions
│   └── ui/                    # Terminal output helpers
│       ├── styles.py          # Colors, icons
│       ├── headers.py         # header(), rule()
│       └── bodies.py          # br(), row(), ok(), fail(), etc
├── docs/                      # End-user documentation
├── .github/workflows/        # GitHub Actions
├── pyproject.toml
└── version.txt               # Source of truth for the version string
```

---

## Versioning

The version string lives in **`version.txt`** and is the single source of truth. The publish workflow reads it and injects it into the code at build time.

Do not edit the `version` field in `pyproject.toml` manually — it gets overwritten by the workflow.

---

## Code style

- Add a comment at the top of each logical block explaining what it does
- Follow the patterns already in the file you're editing
- Use the `fse.ui` module helpers (`info`, `fail`, `warn`, `br`, `header`) for all terminal output
- Validate before writing — never persist invalid state
- Never expose secrets or keys in output

---

## Submitting changes

1. Create a branch off `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes and test locally (see [Testing](#testing))

3. Commit with clear, descriptive messages

4. Push and open a pull request against `main`

---

## Testing

Test the relevant commands manually before opening a PR:

```bash
fse                          # check about displays correctly
fse init                     # scaffold a project
fse set endpoint             # interactive endpoint config
fse set key                  # interactive key config
fse --status                 # show current config
fse field add email type:email  # add a field
```

If your change touches the install/packaging path, test with local install method:
```bash
pipx install -e .            # local dev
```

---

## Reporting issues

Report bugs via GitHub Issues — include the command you ran, the full error message, and your OS.

- **Bug report** : something isn't working
- **Documentation issue** : something in the docs is wrong or missing
- **Question / support** : need help with setup or usage