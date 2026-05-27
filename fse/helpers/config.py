import base64
import re
from pathlib import Path

from fse.ui import br, G, D, R

CONFIG_PATH = Path.cwd() / "formseal-embed" / "config" / "fse.config.js"
FIELDS_PATH = Path.cwd() / "formseal-embed" / "config" / "fields.jsonl"
SRC  = Path(__file__).resolve().parent.parent / "src"
DEST = Path.cwd() / "formseal-embed"

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

def _confirm(prompt: str) -> bool:
    try:
        return input(f"  {D}{prompt}{R} {G}(y/n){R}: ").strip().lower() == "y"
    except (KeyboardInterrupt, EOFError):
        br()
        return False

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
