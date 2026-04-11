# commands/configure.py
# Configures formseal-embed settings.

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
    elif subcommand in ("field", "fields"):
        _run_field(args)
    elif subcommand in ("f", "-f"):
        if args and args[0] in ("add", "rm", "remove", "a", "r"):
            _run_field(args)
        else:
            _run_field(["modify"] + args)
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
        fail("Usage: fse configure -f <add|rm|required|maxLen|type>")

    action = args[0]

    if action in ("add", "a"):
        _field_add(args[1:])
    elif action in ("rm", "r", "remove", "delete"):
        _field_remove(args[1:])
    else:
        _field_modify(args)


def _field_add(args: list):
    if not args:
        fail("Usage: fse configure -f add <name> required:true type:email maxLen:n")

    name = args[0]
    fields = _load_fields_jsonl()

    is_update = name in fields
    field = fields.get(name, {})
    has_type = False
    for opt in args[1:]:
        if ":" in opt:
            k, v = opt.split(":", 1)
            if k == "required":
                field["required"] = v.lower() == "true"
            elif k in ("maxLen", "maxlength", "maxLength"):
                try:
                    field["maxLength"] = int(v)
                except ValueError:
                    fail(f"Invalid maxLen: {v}")
            elif k in ("type", "t"):
                if v not in ("email", "tel", "text"):
                    fail(f"Invalid type: {v}. Use email, tel, or text.")
                field["type"] = v
                has_type = True
    
    if not is_update and not has_type:
        fail("type is required. Use type:email, type:tel, or type:text")

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


def _field_modify(args: list):
    if len(args) < 2:
        fail("Usage: fse -f <name> required:true maxLen:100 type:email")

    name = args[0]
    fields = _load_fields_jsonl()

    if name not in fields:
        fail(f"Field {W}{name}{R} not found.")

    updated = []
    for opt in args[1:]:
        if ":" in opt:
            k, v = opt.split(":", 1)
            if k == "required":
                fields[name]["required"] = v.lower() == "true"
                updated.append("required")
            elif k in ("maxLen", "maxLength"):
                try:
                    fields[name]["maxLength"] = int(v)
                    updated.append("maxLength")
                except ValueError:
                    fail(f"Invalid maxLen: {v}")
            elif k in ("type", "t"):
                if v not in ("email", "tel", "text"):
                    fail(f"Invalid type: {v}. Use email, tel, or text.")
                fields[name]["type"] = v
                updated.append("type")

    if not updated:
        fail("No valid flags. Use required:true/false, maxLen:number, or type:email/tel/text")

    _save_fields_jsonl(fields)

    br()
    print(f"  {G}Updated field:{R} {name}")
    print(G + " " + "\u2500" * 52 + R)
    for k, v in fields[name].items():
        row("", k, str(v))
