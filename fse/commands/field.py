# commands/field — Add and remove form fields

import json
from pathlib import Path

from fse.ui import br, row, C, G, W, R, fail

FIELDS_PATH = Path.cwd() / "formseal-embed" / "config" / "fields.jsonl"

FIELD_TYPES = {
    "text": {
        "validate": None,
    },
    "email": {
        "validate": r"^[^\s@]+@[^\s@]+\.[^\s@]+$",
    },
    "tel": {
        "validate": r"^\+?[\d\s\-().]{6,20}$",
    },
}

VALID_TYPES = tuple(FIELD_TYPES.keys())


def run(args):
    if not args:
        fail(f"Usage: {C}fse field <add|remove> [opts]{R}")

    action = args[0]
    cmd_args = args[1:]

    if not FIELDS_PATH.exists():
        fail(
            "formseal-embed/config/fields.jsonl not found.\n"
            f"           {C}Run fse init first.{R}"
        )

    if action == "add":
        _field_add(cmd_args)
    elif action in ("remove", "rm"):
        _field_remove(cmd_args)
    else:
        _field_add(args)


def _field_add(args):
    if not args:
        fail(f"Usage: {C}fse field add <name> type:<type>{R}")

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
            elif k in ("maxLen", "maxLength"):
                try:
                    field["maxLength"] = int(v)
                except ValueError:
                    fail(f"Invalid maxLen: {v}")
            elif k == "type":
                if v not in VALID_TYPES:
                    fail(f"Invalid type: {v}. Valid types: {', '.join(VALID_TYPES)}")
                field["type"] = v
                has_type = True

    if not is_update and not has_type:
        fail(f"type is required. Valid types: {', '.join(VALID_TYPES)}")

    fields[name] = field
    _save_fields_jsonl(fields)

    br()
    action = "Updated" if is_update else "Added"
    print(f"  {G}{action} field:{R} {name}")
    for k, v in field.items():
        row("", k, str(v))


def _field_remove(args):
    if not args:
        fail(f"Usage: {C}fse field remove <name>{R}")

    name = args[0]
    fields = _load_fields_jsonl()

    if name not in fields:
        fail(f"Field {W}{name}{R} not found.")

    del fields[name]
    _save_fields_jsonl(fields)

    br()
    print(f"  {G}Removed field:{R} {name}")


def _load_fields_jsonl():
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


def _save_fields_jsonl(fields):
    lines = []
    for name, opts in fields.items():
        line = json.dumps({name: opts})
        lines.append(line)
    FIELDS_PATH.write_text('\n'.join(lines) + '\n', encoding="utf-8")
