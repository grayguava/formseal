# commands/update.py

import re
from pathlib import Path

from ui.output import br, rule, row, code, fail, C, G, Y, S, W, R, D

CONFIG_PATH = Path.cwd() / "formseal-embed" / "config" / "fse.config.js"

MARKERS = {
    "endpoint": "endpoint:",
    "key": "publicKey:",
    "origin": "origin:",
}


def _patch(field: str, value: str):
    marker = MARKERS.get(field)
    if not marker or not value:
        return False

    if not CONFIG_PATH.exists():
        return False

    lines = CONFIG_PATH.read_text(encoding="utf-8").splitlines(keepends=True)
    matched = False
    updated = []

    for line in lines:
        if marker in line and "://" not in marker:
            matched = True
            line = re.sub(r':\s*"[^"]*"', f': "{value}"', line)
        updated.append(line)

    if matched:
        CONFIG_PATH.write_text("".join(updated), encoding="utf-8")
    return matched


def _normalize_endpoint(url: str) -> str:
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    return url


def run(subcommand: str, args: list):
    if not subcommand:
        fail("Usage: fse update <endpoint|key>")

    if not CONFIG_PATH.exists():
        fail(
            "formseal-embed/config/fse.config.js not found.\n"
            f"           Run {W}fse init{R} first."
        )

    if subcommand in ("endpoint", "ep"):
        _update_endpoint(args)
    elif subcommand in ("key", "k"):
        _update_key(args)
    elif subcommand in ("origin", "o"):
        _update_origin(args)
    else:
        fail(f"Unknown update: {subcommand}\n" +
             f"           Use {W}fse update endpoint{R}, {W}fse update key{R}, or {W}fse update origin{R}")


def _update_endpoint(args: list):
    if not args:
        fail("Usage: fse update endpoint <url>")

    url = _normalize_endpoint(args[0])

    if _patch("endpoint", url):
        br()
        print(f"  {S}*{R} {G}Updated!{R}")
        print(G + " " + "\u2500" * 52 + R)
        row(">", "endpoint", url)
    else:
        fail("Could not update endpoint.")


def _update_key(args: list):
    if not args:
        fail("Usage: fse update key <base64url>")

    key = args[0]

    if _patch("key", key):
        br()
        print(f"  {S}*{R} {G}Updated!{R}")
        print(G + " " + "\u2500" * 52 + R)
        row(">", "key", key[:24] + "..." if len(key) > 24 else key)
    else:
        fail("Could not update key.")


def _update_origin(args: list):
    if not args:
        fail("Usage: fse update origin <name>")

    origin = args[0]

    if _patch("origin", origin):
        br()
        print(f"  {S}*{R} {G}Updated!{R}")
        print(G + " " + "\u2500" * 52 + R)
        row(">", "origin", origin)
    else:
        fail("Could not update origin.")
