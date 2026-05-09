# fse/cli/commands/general/help.py
# Help command - shows all available commands

from fse.cli.ui import br, header, cmd_line, rule
from fse.cli.ui.styles import C, G, R, W, GRAY


def _get_help_groups():
    return {
        "Setup": [
            ("fse init", "scaffold project"),
            ("fse reset", "remove + re-scaffold"),
        ],
        "Configuration": [
            ("fse set endpoint", "set endpoint"),
            ("fse set key", "set encryption key"),
            ("fse field add <name>", "add field"),
            ("fse field remove <name>", "remove field"),
            ("fse doctor", "validate config"),
            ("fse keygen", "generate X25519 keypair"),
        ],
        "Info": [
            ("fse --about", "project info"),
            ("fse --version", "show version"),
            ("fse --status", "show current config"),
            ("fse --aliases", "show shorthand flags"),
        ],
        "Docs": [
            ("https://github.com/useFormseal/embed", None),
        ],
    }


def _show_help():
    groups = _get_help_groups()
    br()
    header()
    br()

    for group, cmds in groups.items():
        print(f"  {GRAY}>> {group}{R}")
        rule()
        for cmd, desc in cmds:
            if desc:
                print(f"  {W}{cmd:<27}{R} {G}{desc}{R}")
            else:
                print(f"  {C}{cmd}{R}")
        br()


def run():
    _show_help()


def run_aliases():
    br()
    header("shorthand aliases")
    br()

    print(f" {W}Short{R}  {G}Canonical{R}")
    rule()
    print(f" {W}-i{R}     {G}init{R}")
    print(f" {W}-r{R}     {G}reset{R}")
    print(f" {W}-f{R}     {G}field{R}")
    print(f" {W}-s{R}     {G}set{R}")
    br()