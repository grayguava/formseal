#!/usr/bin/env python3
# fse.py
# Entry point. Parses args and routes to the correct command.

import sys
import os
from pathlib import Path

if os.name == "nt":
    try:
        os.system("chcp 65001 >nul")
    except:
        pass

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except:
    pass

sys.path.insert(0, os.path.dirname(__file__))

from ui import br, rule, cmd_line, link, fail, badge, C, G, Y, M, W, D, R, BOLD, header

from commands import init as cmd_init
from commands import configure as cmd_configure
from commands import update as cmd_update
from commands import version as cmd_version
from commands import help as cmd_help
from commands import about as cmd_about
from commands import doctor as cmd_doctor


def main():
    args    = sys.argv[1:]
    command = args[0] if args else None

    match command:
        case "init":
            cmd_init.run()

        case "configure":
            sub = args[1] if len(args) > 1 else None
            cmd_configure.run(sub, args[2:])

        case "-qc":
            cmd_configure.run("quick", [])

        case "field":
            sub = args[1] if len(args) > 1 else None
            cmd_configure.run("field", args[1:])

        case "-f":
            cmd_configure.run("-f", args[1:])

        case "update":
            sub = args[1] if len(args) > 1 else None
            cmd_update.run(sub, args[2:])

        case "-u":
            sub = args[1] if len(args) > 1 else None
            cmd_update.run(sub, args[2:])

        case "doctor":
            cmd_doctor.run()

        case None | "fse" | "--about":
            cmd_about.run()

        case "--help" | "-h":
            cmd_help.run()

        case "--aliases":
            cmd_help.run_aliases()

        case "--about":
            cmd_about.run()

        case "--version" | "version" | "-v":
            cmd_version.run()

        case _:
            fail(
                f"Unknown command: {command}\n"
                f"           Run {W}fse --help{R} for usage."
            )


if __name__ == "__main__":
    main()
