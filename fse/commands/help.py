# commands/help — Help command (show commands and aliases)

from fse.ui import br, header, rule
from fse.ui.styles import C, G, R, W, GRAY


def _get_help_groups():
    return {
        "Setup": [
            ("fse init", "scaffold project"),
            ("fse reset", "remove + re-scaffold"),
        ],
        "Configuration": [
            ("fse keygen", "generate X25519 keypair"),
            ("fse set key", "set encryption key"),
            ("fse set endpoint", "set endpoint"),
            ("fse set origin", "set form origin"),
            ("fse set logging", "toggle console logging"),
            ("fse field add <name>", "add field"),
            ("fse field rm <name>", "remove field"),
        ],
        "Info": [
            ("fse status", "show current config"),
            ("fse --version", "show version"),
            ("fse --aliases", "show shorthand flags"),
        ],
        "Docs": [
            ("https://github.com/useFormseal/embed/tree/main/docs", None),
        ],
    }


def _show_help():
    groups = _get_help_groups()
    br()
    header("help")
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
