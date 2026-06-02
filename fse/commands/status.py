# commands/status — Show current configuration and fields

import json
import re
from pathlib import Path

from fse.ui import br, header, warn, C, D, W, R, GRAY

DEST = Path.cwd() / "formseal-embed"


def run(args=None):
    br()
    header("status")
    br()

    config_path = DEST / "config" / "fse.config.js"

    if not config_path.exists():
        warn(f"formseal-embed not initialized. {C}Run fse init first.{R}")
        br()
        return

    if args and "-fields" in args:
        _show_fields()
        br()
        return

    content = config_path.read_text(encoding="utf-8")

    def row(label, value, color=W):
        print(f"  {D}{label:<20}{R}{color}{value}{R}")

    ep_match = re.search(r'endpoint:\s*"([^"]+)"', content)
    row("POST API:", ep_match.group(1) if ep_match else "(not set)", W if ep_match else GRAY)

    key_match = re.search(r'publicKey:\s*"([A-Za-z0-9_-]+)"', content)
    row("Public Key:", key_match.group(1) if key_match else "(not set)", W if key_match else GRAY)

    origin_match = re.search(r'origin:\s*"([^"]+)"', content)
    row("Origin:", origin_match.group(1) if origin_match else "(not set)", W if origin_match else GRAY)

    fields_path = DEST / "config" / "fields.jsonl"
    if fields_path.exists():
        raw = fields_path.read_text(encoding="utf-8").strip()
        lines = [l.strip() for l in raw.split('\n') if l.strip()]
        count = sum(1 for l in lines if json.loads(l))
        row("Total Fields:", str(count))
    else:
        row("Total Fields:", "0", GRAY)

    br()
    print(f"  Run {C}fse status -fields{R} to see configured fields.")
    br()


def _show_fields():
    print(f"  {D}Configured Fields:{R}")
    br()

    fields_path = DEST / "config" / "fields.jsonl"
    if not fields_path.exists():
        print(f"  {GRAY}(none){R}")
        return

    raw = fields_path.read_text(encoding="utf-8").strip()
    lines = [l.strip() for l in raw.split('\n') if l.strip()]
    if not lines:
        print(f"  {GRAY}(none){R}")
        return

    for line in lines:
        try:
            obj = json.loads(line)
            name = list(obj.keys())[0]
            opts = obj[name]
            ftype = opts.get("type", "text")
            maxl = opts.get("maxLength", "")
            req = "required" if opts.get("required") else ""
            maxl_str = f"max length: {maxl}" if maxl else "max length:  - "
            req_str = req if req else ""
            print(f"  {W}{name:<20}{R} {D}{ftype:<5}{R} | {D}{maxl_str}{R} | {D}{req_str}{R}")
        except:
            pass
