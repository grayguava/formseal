# commands/help.py
# Help command - shows all available commands

from ui import br, rule, cmd_line, link, header, C, G, Y, M, W, D, R, GRAY
from pathlib import Path


def run():
    br()
    header()
    br()

    print(f"  {GRAY}>>{R} {Y}General{R}")
    print(G + " " + "\u2500" * 52 + R)
    cmd_line("fse init", "scaffold project")
    cmd_line("fse --version", "check version")
    cmd_line("fse --aliases", "show aliases")
    br()

    print(f"  {GRAY}>>{R} {Y}Configure{R}")
    print(G + " " + "\u2500" * 52 + R)
    cmd_line("fse configure quick", "set endpoint + key")
    cmd_line("fse field add <name> type:email", "add field")
    cmd_line("fse field remove <name>", "remove field")
    br()

    print(f"  {GRAY}>>{R} {Y}Update{R}")
    print(G + " " + "\u2500" * 52 + R)
    cmd_line("fse update endpoint <url>", "update POST endpoint")
    cmd_line("fse update key <base64url>", "update X25519 public key")
    cmd_line("fse update origin <name>", "update form origin")
    br()

    print(f"  {GRAY}>>{R} {Y}Validate{R}")
    print(G + " " + "\u2500" * 52 + R)
    cmd_line("fse doctor", "validate config and files")
    br()

    print(f"  {GRAY}>>{R} {Y}Docs{R}")
    print(G + " " + "\u2500" * 52 + R)
    link("https://github.com/grayguava/formseal-embed/docs")
    br()


def run_aliases():
    br()
    header(f"{G}shorthand aliases{R}")
    br()

    print(f"  {W}Short{R}     {G}Canonical{R}")
    print(G + " " + "\u2500" * 52 + R)
    print(f"  {W}-qc{R}       {G}configure quick{R}")
    print(f"  {W}-f{R}        {G}field{R}")
    print(f"  {W}-u{R}        {G}update{R}")
    br()