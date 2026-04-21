# Contributing to formseal-embed

Thanks for your interest in contributing! This guide covers everything you need to get started.

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
   git clone https://github.com/YOUR_USERNAME/formseal-embed.git
   cd formseal-embed
   ```

2. Install in development mode using `pipx` (recommended) or `pip`:
   ```bash
   pipx install -e .
   # or
   pip install -e .
   ```

3. Verify it works:
   ```bash
   fse
   ```
   You should see the header.

> **Note:** Always use `pipx install -e .` for local dev — it gives you an isolated environment and the version header will display correctly from source.

---

## Project structure

```
formseal-embed/
├── cli/
│   ├── fse.py                  # Entry point, argument dispatch
│   ├── version.txt             # Source of truth for the version string
│   ├── ui/
│   │   ├── __init__.py         # UI exports
│   │   ├── styles.py           # Colors, icons
│   │   ├── headers.py          # header(), rule()
│   │   └── bodies.py           # br(), row(), ok(), etc
│   └── commands/               # One file per CLI command
│       ├── about.py
│       ├── configure.py
│       ├── doctor.py
│       ├── help.py
│       ├── init.py
│       ├── update.py
│       └── version.py
├── docs/                       # End-user documentation
├── .github/
│   └── workflows/              # GitHub Actions
├── src/                        # Client-side JavaScript
├── pyproject.toml
└── version.txt
```

---

## Versioning

The version string lives in **`version.txt`** at the project root and is the single source of truth. The publish workflow reads it and injects it into `pyproject.toml` at build time.

When preparing a release:
1. Update `version.txt` with the new version (e.g. `3.4.0`)
2. Trigger the **Publish to PyPI** workflow from GitHub Actions

Do not edit the `version` field in `pyproject.toml` manually — it gets overwritten by the workflow.

---

## Code style

- Add a comment at the top of each logical block explaining what it does — not required for every line or function, but each distinct section of logic should have one
- Follow the patterns already in the file you're editing
- Use the `ui` module helpers (`info`, `fail`, `warn`, `br`, `header`) for all terminal output — don't print directly
- Sensitive config values must go through secure storage, never stored in plaintext

---

## Submitting changes

1. Create a branch off `main`:
   ```bash
   git checkout -b feat/my-feature
   # or
   git checkout -b fix/some-bug
   ```

2. Make your changes and test locally (see [Testing](#testing))

3. Commit with clear, descriptive messages:
   ```
   fix: include version.txt in package data
   feat: add new field validation
   docs: expand configuration guide
   ```

4. Push and open a pull request against `main`

---

## Testing

There is no automated test suite yet. Test the relevant commands manually before opening a PR:

```bash
fse                          # check about displays correctly
fse init                     # scaffold a project
fse doctor                   # validate configuration
fse configure quick          # quick configure
fse field add email type:email  # add a field
fse update endpoint https://example.com  # update config
```

If your change touches the install/packaging path, test both install methods:
```bash
pipx install -e .            # local dev
pip install formseal-embed   # from PyPI (after publishing)
```

---

## Reporting issues

Use the GitHub issue templates — they're structured to make sure we get the info needed to help quickly:

- **[Bug report](https://github.com/grayguava/formseal-embed/issues/new?template=bug_report.yml)** : something isn't working
- **[Documentation issue](https://github.com/grayguava/formseal-embed/issues/new?template=documentation.yml)** : something in the docs is wrong or missing
- **[Question / support](https://github.com/grayguava/formseal-embed/issues/new?template=question.yml)** : need help with setup or usage
