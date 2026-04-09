# commands/configure.py
# Configure formseal-embed settings.
# Usage:
#   fse configure quick        - set endpoint + key
#   fse configure field add <name> [options]
#   fse configure field remove <name>
#   fse configure field required <name> <true|false>
#   fse configure field maxLength <name> <number>
#   fse configure field type <name> <email|tel|text>

import re
import json
from pathlib import Path

from ui.output import br, rule, row, code, fail, C, G, Y, S, W, R, D

CONFIG_PATH = Path.cwd() / "formseal-embed" / "config" / "fse.config.js"
FIELDS_PATH = Path.cwd() / "formseal-embed" / "config" / "fields.jsonl"

MARKERS = {
    "endpoint":   "endpoint:",
    "publicKey":  "publicKey:",
}


def _prompt(label: str, hint: str) -> str:
    try:
        return input(f"  {D}{label}:{R} ").strip()
    except (KeyboardInterrupt, EOFError):
        br()
        return ""


def _patch(field: str, value: str):
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
            line    = re.sub(r':\s*"[^"]*"', f': "{value}"', line)
        updated.append(line)

    if matched:
        CONFIG_PATH.write_text("".join(updated), encoding="utf-8")
    return matched


def _normalize_endpoint(url: str) -> str:
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    return url


def _load_fields_jsonl() -> dict:
    if not FIELDS_PATH.exists():
        return {}
    lines = FIELDS_PATH.read_text(encoding="utf-8").strip().split('\n')
    fields = {}
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
            key = list(obj.keys())[0]
            fields[key] = obj[key]
        except:
            pass
    return fields


def _save_fields_jsonl(fields: dict):
    lines = []
    for name, opts in fields.items():
        line = json.dumps({name: opts})
        lines.append(line)
    FIELDS_PATH.write_text('\n'.join(lines) + '\n', encoding="utf-8")


def run(subcommand: str, args: list):
    if not subcommand:
        fail("Usage: fse configure <quick|field>")

    if not CONFIG_PATH.exists():
        fail(
            "formseal-embed/config/fse.config.js not found.\n"
            f"           Run {W}fse init{R} first."
        )

    if subcommand in ("quick", "q"):
        _run_quick()
    elif subcommand in ("field", "fields", "f"):
        _run_field(args)
    else:
        fail(f"Unknown subcommand: {subcommand}\n" +
             f"           Use {W}fse configure quick{R} or {W}fse configure field{R}")


def _run_quick():
    br()
    print(f"{C} \u250c\u2500 {R}{W}formseal-embed{R}  {G}quick configure{R}")
    print(G + " " + "\u2500" * 52 + R)
    br()

    endpoint = _prompt("POST endpoint", ":")
    key      = _prompt("X25519 public key (base64url)", ":")

    br()
    updated = False
    if endpoint:
        endpoint = _normalize_endpoint(endpoint)
        if _patch("endpoint", endpoint):
            updated = True
    if key:
        if _patch("publicKey", key):
            updated = True

    if updated:
        print(f"  {S}*{R} {G}Updated!{R}")
        print(G + " " + "\u2500" * 52 + R)
        
        if endpoint:
            row(">", "POST API", endpoint)
        if key:
            row(">", "X25519 Key", key[:24] + "..." if len(key) > 24 else key)


def _run_field(args: list):
    if not args:
        fail("Usage: fse configure field <add|remove|required|maxLength|type>")

    action = args[0]

    if action == "add":
        _field_add(args[1:])
    elif action in ("remove", "rm", "delete"):
        _field_remove(args[1:])
    elif action == "required":
        _field_required(args[1:])
    elif action in ("maxlength", "maxLength"):
        _field_maxlength(args[1:])
    elif action in ("type",):
        _field_type(args[1:])
    else:
        fail(f"Unknown field action: {action}\n" +
             f"           Use add, remove, required, maxLength, or type")


def _field_add(args: list):
    if not args:
        fail("Usage: fse configure field add <name> [required:true] [maxLength:n] [type:email]")

    name = args[0]
    fields = _load_fields_jsonl()

    is_update = name in fields
    field = fields.get(name, {"enabled": True})
    for opt in args[1:]:
        if ":" in opt:
            k, v = opt.split(":", 1)
            if k == "required":
                field["required"] = v.lower() == "true"
            elif k in ("maxLength", "maxlength"):
                try:
                    field["maxLength"] = int(v)
                except ValueError:
                    fail(f"Invalid maxLength: {v}")
            elif k in ("type",):
                if v not in ("email", "tel", "text"):
                    fail(f"Invalid type: {v}. Use email, tel, or text.")
                field["type"] = v

    fields[name] = field
    _save_fields_jsonl(fields)

    br()
    action = "Updated" if is_update else "Added"
    print(f"  {G}{action} field:{R} {name}")
    for k, v in field.items():
        row("", k, str(v))


def _field_remove(args: list):
    if not args:
        fail("Usage: fse configure field remove <name>")

    name = args[0]
    fields = _load_fields_jsonl()

    if name not in fields:
        fail(f"Field {W}{name}{R} not found.")

    del fields[name]
    _save_fields_jsonl(fields)

    br()
    print(f"  {G}Removed field:{R} {name}")


def _field_required(args: list):
    if len(args) != 2:
        fail("Usage: fse configure field required <name> <true|false>")

    name, value = args
    if value not in ("true", "false"):
        fail("Use true or false")

    fields = _load_fields_jsonl()

    if name not in fields:
        fail(f"Field {W}{name}{R} not found.")

    fields[name]["required"] = value == "true"
    _save_fields_jsonl(fields)

    br()
    row(">", f"{name}.required", value)


def _field_maxlength(args: list):
    if len(args) != 2:
        fail("Usage: fse configure field maxLength <name> <number>")

    name, value = args
    try:
        maxlen = int(value)
    except ValueError:
        fail(f"Invalid number: {value}")

    fields = _load_fields_jsonl()

    if name not in fields:
        fail(f"Field {W}{name}{R} not found.")

    fields[name]["maxLength"] = maxlen
    _save_fields_jsonl(fields)

    br()
    row(">", f"{name}.maxLength", str(maxlen))


def _field_type(args: list):
    if len(args) != 2:
        fail("Usage: fse configure field type <name> <email|tel|text>")

    name, value = args
    if value not in ("email", "tel", "text"):
        fail(f"Invalid type: {value}. Use email, tel, or text.")

    fields = _load_fields_jsonl()

    if name not in fields:
        fail(f"Field {W}{name}{R} not found.")

    fields[name]["type"] = value
    _save_fields_jsonl(fields)

    br()
    row(">", f"{name}.type", value)
