# commands/init.py
# Scaffolds ./formseal-embed/ into the current working directory.

import shutil
from pathlib import Path

from ui.output import br, rule, row, code, link, fail, C, G, Y, S, W, R, D

# MASCOT: from ui.mascot import on_init

SRC  = Path(__file__).resolve().parent.parent.parent / "src"
DEST = Path.cwd() / "formseal-embed"


def _prompt(label: str, hint: str) -> str:
    try:
        return input(f"  {D}{label}:{R} ").strip()
    except (KeyboardInterrupt, EOFError):
        br()
        return ""


def _confirm(prompt: str) -> bool:
    try:
        return input(f"  {D}{prompt}{R} {G}(y/n){R}: ").strip().lower() == "y"
    except (KeyboardInterrupt, EOFError):
        br()
        return False


def _patch_config(field: str, value: str):
    import re
    from commands.configure import MARKERS

    marker = MARKERS.get(field)
    if not marker or not value:
        return False

    config = DEST / "config" / "fse.config.js"
    if not config.exists():
        return False

    lines   = config.read_text(encoding="utf-8").splitlines(keepends=True)
    updated = []
    matched = False
    for line in lines:
        if marker in line and "://" not in marker:
            matched = True
            line = re.sub(r':\s*"[^"]*"', f': "{value}"', line)
        updated.append(line)
    
    if matched:
        config.write_text("".join(updated), encoding="utf-8")
    return matched


def _normalize_endpoint(url: str) -> str:
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    return url


def run():
    if DEST.exists():
        fail(
            "./formseal-embed/ already exists.\n"
            "           Remove it first if you want a fresh scaffold."
        )

    if not SRC.exists():
        fail(
            f"Source files not found at {SRC}.\n"
            "           Is the package installed correctly?"
        )

    shutil.copytree(SRC, DEST)

    br()
    print(f"{C} \u250c\u2500 {R}{W}formseal-embed{R}  {S}initialized{R}")
    print(G + " " + "\u2500" * 52 + R)
    br()

    do_config = _confirm("Configure now?")
    
    if do_config:
        br()
        endpoint = _prompt("POST endpoint", "https://your-api.example.com/submit")
        key      = _prompt("X25519 public key (base64url)", "base64url x25519 public key")

        br()
        updated = False
        if endpoint:
            endpoint = _normalize_endpoint(endpoint)
            if _patch_config("endpoint", endpoint):
                updated = True
        if key:
            if _patch_config("publicKey", key):
                updated = True

        if updated:
            print(f"  {S}*{R} {G}Set!{R}")
            print(G + " " + "\u2500" * 52 + R)
            
            if endpoint:
                row(">", "POST API", endpoint)
            if key:
                row(">", "X25519 Key", key[:24] + "..." if len(key) > 24 else key)
        
        br()

    br()
    print(f"  {G}\u2192{R} {Y}Next steps{R}")
    print(G + " " + "\u2500" * 52 + R)
    br()
    print(f"  {G}Wire up in your HTML:{R}")
    code('<script src="/formseal-embed/globals.js"></script>')
    br()