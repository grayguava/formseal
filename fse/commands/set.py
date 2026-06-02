# commands/set — Configure endpoint, key, origin, and logging

import base64
import re
from pathlib import Path

from fse.ui import br, row, neutral, warn, C, WHITE, W, R, G, GRAY, D, fail, rule

CONFIG_PATH = Path.cwd() / "formseal-embed" / "config" / "fse.config.js"

MARKERS = {
    "endpoint":  "endpoint:",
    "publicKey": "publicKey:",
    "key":       "publicKey:",
    "origin":    "origin:",
    "logging":   "logging:",
}

BOOLEAN_KEYS = {"logging"}


def _prompt(label: str) -> str:
    try:
        return input(f"  {D}{label}{R}: ").strip()
    except (KeyboardInterrupt, EOFError):
        br()
        return ""


def _normalize_endpoint(url: str) -> str:
    url = url.strip()
    if url.startswith("https://"):
        return url
    if url.startswith("http://"):
        return url.replace("http://", "https://", 1)
    return "https://" + url


def _patch_config(field: str, value: str):
    marker = MARKERS.get(field)
    if not marker or not value:
        return False

    if not CONFIG_PATH.exists():
        return False

    lines   = CONFIG_PATH.read_text(encoding="utf-8").splitlines(keepends=True)
    matched = False
    updated = []

    for line in lines:
        if marker in line and "://" not in marker:
            matched = True
            if field in BOOLEAN_KEYS:
                line = re.sub(r':\s*(true|false|\"[^\"]*\")', f': {value}', line)
            else:
                line = re.sub(r':\s*"[^"]*"', f': "{value}"', line)
        updated.append(line)

    if matched:
        CONFIG_PATH.write_text("".join(updated), encoding="utf-8")
    return matched


def _validate_key(key):
    try:
        decoded = base64.urlsafe_b64decode(key + "==")
        return len(decoded) == 32
    except Exception:
        return False


def run(args):
    if not args:
        fail(f"{WHITE}Usage:{R} {C}fse set <endpoint|key|origin> [value]{R}")

    subcommand = args[0]
    cmd_args = args[1:]

    if not CONFIG_PATH.exists():
        fail(
            "formseal-embed/config/fse.config.js not found.\n"
            f"           {C}Run fse init first.{R}"
        )

    if subcommand == "endpoint":
        _set_endpoint(cmd_args)
    elif subcommand == "key":
        _set_key(cmd_args)
    elif subcommand == "origin":
        _set_origin(cmd_args)
    elif subcommand == "logging":
        _set_logging(cmd_args)
    else:
        fail(f"Unknown: {subcommand}\n" +
             f"           Use {C}fse set endpoint{R}, {C}fse set key{R}, {C}fse set origin{R}, or {C}fse set logging{R}")


def _set_endpoint(args):
    value = args[0] if args else None

    if not value:
        value = _prompt_loop_endpoint()
        if not value:
            return

    original = value
    url = _normalize_endpoint(original)

    if not url.startswith("https://"):
        neutral("Endpoint must use HTTPS.")

    if not original.startswith("http://") and not original.startswith("https://"):
        br()
        warn("No protocol provided — using https://")

    _patch_config("endpoint", url)
    br()
    print(f"  {G}✨{R} Updated!")
    rule()
    row("", "endpoint", url)


def _prompt_loop_endpoint():
    while True:
        value = _prompt("POST endpoint")
        if not value:
            print(f"  {GRAY}skipped{R}")
            return None

        url = _normalize_endpoint(value)
        if url.startswith("https://"):
            if value != url:
                warn("No protocol provided — using https://")
            return url

        print(f"  {GRAY}Endpoint must use HTTPS.{R}")


def _set_key(args):
    value = args[0] if args else None

    if not value:
        value = _prompt_loop_key()
        if not value:
            return

    if not _validate_key(value):
        neutral("Invalid public key. Expected raw 32-byte X25519 public key in base64url format.")

    _patch_config("key", value)
    br()
    print(f"  {G}✨{R} Updated!")
    rule()
    row("", "key", value[:24] + "...")


def _prompt_loop_key():
    while True:
        value = _prompt("X25519 public key")
        if not value:
            print(f"  {GRAY}skipped{R}")
            return None

        if _validate_key(value):
            return value

        print(f"  {GRAY}Invalid public key. Expected raw 32-byte X25519 public key in base64url format.{R}")


def _set_origin(args):
    value = args[0] if args else None

    if not value:
        value = _prompt("Form origin")
        if not value:
            print(f"  {GRAY}skipped{R}")
            return

    _patch_config("origin", value)
    br()
    print(f"  {G}✨{R} Updated!")
    rule()
    row("", "origin", value)


def _set_logging(args):
    value = args[0] if args else None

    if not value or value.lower() not in ("true", "false"):
        neutral(f"{WHITE}Usage:{R} {C}fse set logging <true|false>{R}.")

    _patch_config("logging", value.lower())
    br()
    print(f"  {G}✨{R} Updated!")
    rule()
    row("", "logging", value)
