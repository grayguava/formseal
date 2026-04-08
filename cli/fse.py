#!/usr/bin/env python3
# fse.py
# Entry point. Parses args and routes to the correct command.
# Adding a new command:
#   1. Create commands/newcommand.py with a run() function
#   2. Import it below
#   3. Add a case to the router

import sys
import os

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

from ui.output import br, rule, cmd_line, link, fail, badge, C, G, Y, M, W, D, R, BOLD
from logo import LOGO

from commands import init as cmd_init
from commands import configure as cmd_configure
from commands import help as cmd_help
from commands import about as cmd_about


# -- intro --

def intro():
    br()
    print(f"{C} \u250c\u2500 {R}{W}formseal-embed{R}")
    print(G + " " + "\u2500" * 52 + R)
    br()
    print(f"  {G}Start:{R}")
    br()
    print(f"  {W}fse init{R}")
    print(f"  {D}scaffold project files{R}")
    br()
    print(f"  {W}fse configure quick{R}")
    print(f"  {D}set endpoint + key{R}")
    br()
    print(f"  {G}Help:{R}")
    br()
    print(f"  {W}fse --help{R}")
    link("https://github.com/grayguava/formseal-embed/docs")
    br()


# -- router --

def main():
    args    = sys.argv[1:]
    command = args[0] if args else None

    match command:
        case "init":
            cmd_init.run()

        case "configure":
            sub = args[1] if len(args) > 1 else None
            cmd_configure.run(sub, args[2:])

        case "doctor":
            fail("fse doctor is not yet available.")

        case None | "fse":
            intro()

        case "--help" | "-h":
            cmd_help.run()

        case "--about":
            cmd_about.run()

        case _:
            fail(
                f"Unknown command: {command}\n"
                f"           Run {W}fse --help{R} for usage."
            )


if __name__ == "__main__":
    main()
