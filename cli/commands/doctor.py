# commands/doctor.py
# Validate formseal-embed configuration and files.

import json
import re
import sys
from pathlib import Path

from ui import br, header, C, G, Y, RED, GREEN, S, W, R, D


DEST = Path.cwd() / "formseal-embed"


def run():
    br()
    header("doctor")
    br()

    groups = {
        "Config": [],
        "Endpoint": [],
        "Encryption": [],
        "Schema": [],
    }
    warnings = []
    has_failed = False

    config_path = DEST / "config" / "fse.config.js"
    if config_path.exists():
        groups["Config"].append((True, "config file found"))
    else:
        groups["Config"].append((False, "config not found", "run: fse init"))
        has_failed = True
        print_results(groups, warnings, has_failed)
        sys.exit(1)

    content = config_path.read_text(encoding="utf-8")
    
    ep_match = re.search(r'endpoint:\s*"([^"]+)"', content)
    if ep_match:
        ep = ep_match.group(1)
        if ep.startswith("https://") and " " not in ep:
            groups["Endpoint"].append((True, "valid https URL"))
        else:
            groups["Endpoint"].append((False, "endpoint must use https", "run: fse update endpoint https://..."))
            has_failed = True
    else:
        groups["Endpoint"].append((False, "endpoint missing", "run: fse update endpoint https://..."))
        has_failed = True

    key_match = re.search(r'publicKey:\s*"([A-Za-z0-9_-]+)"', content)
    if key_match:
        key = key_match.group(1)
        if len(key) >= 40 and len(key) <= 44:
            groups["Encryption"].append((True, "public key format valid"))
        else:
            groups["Encryption"].append((False, "invalid X25519 public key length", "run: fse update key <base64url>"))
            has_failed = True
    else:
        groups["Encryption"].append((False, "public key missing", "run: fse update key <base64url>"))
        has_failed = True

    origin_match = re.search(r'origin:\s*"([^"]+)"', content)
    if origin_match:
        groups["Config"].append((True, "origin defined"))

    fields_path = DEST / "config" / "fields.jsonl"
    if fields_path.exists():
        content = fields_path.read_text(encoding="utf-8").strip()
        lines = [l.strip() for l in content.split('\n') if l.strip()]
        
        if lines:
            fields = {}
            has_duplicate = False
            has_required = False
            
            for line in lines:
                try:
                    obj = json.loads(line)
                    name = list(obj.keys())[0]
                    if name in fields:
                        has_duplicate = True
                        groups["Schema"].append((False, f"duplicate field: {name}", "check fields.jsonl"))
                        has_failed = True
                    else:
                        fields[name] = obj[name]
                        if obj[name].get("required"):
                            has_required = True
                except json.JSONDecodeError:
                    groups["Schema"].append((False, "invalid JSON in fields", "check fields.jsonl"))
                    has_failed = True
            
            if not has_duplicate:
                groups["Schema"].append((True, f"{len(fields)} fields defined"))
            
            if not has_required:
                warnings.append("no required fields (recommended at least one)")
            
            allowed_types = ["text", "email", "textarea", "number", "tel"]
            for name, opts in fields.items():
                ftype = opts.get("type", "text")
                if ftype not in allowed_types:
                    groups["Schema"].append((False, f"unsupported field type: {ftype}", "use text/email/textarea/number/tel"))
                    has_failed = True
                    
                if "maxLength" in opts:
                    if not isinstance(opts["maxLength"], int) or opts["maxLength"] <= 0:
                        groups["Schema"].append((False, f"invalid maxLength for {name}", "must be positive integer"))
                        has_failed = True
        else:
            groups["Schema"].append((False, "no fields defined", "run: fse field add email type:email"))
            has_failed = True
    else:
        groups["Schema"].append((False, "fields.jsonl not found", "run: fse init"))
        has_failed = True

    print_results(groups, warnings, has_failed)
    
    if has_failed:
        sys.exit(1)


def print_results(groups, warnings, has_failed):
    for name, items in groups.items():
        print(f"  {W}> {name}{R}")
        print(G + " " + "\u2500" * 52 + R)
        
        for item in items:
            if len(item) == 2:
                passed, msg = item
                if passed:
                    print(f"    {G}✔{R} {D}{msg}{R}")
                else:
                    print(f"    {Y}⚠{R} {D}{msg}{R}")
            else:
                passed, msg, fix = item
                print(f"    {RED}✖{R} {msg}")
                print(f"         {D}{fix}{R}")
        br()

    if warnings:
        print(f"  {W}> Warnings{R}")
        print(G + " " + "\u2500" * 52 + R)
        for w in warnings:
            print(f"    {Y}⚠{R} {w}")
        br()

    br()
    print(G + " " + "\u2500" * 52 + R)
    if has_failed:
        print(f"  {RED}✖{R} {RED}configuration invalid{R}")
    else:
        print(f"  {GREEN}✔{R} {GREEN}configuration valid{R}")