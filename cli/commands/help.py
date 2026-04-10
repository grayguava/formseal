# commands/help.py
# Help command - shows all available commands

from ui.output import br, rule, cmd_line, link, C, G, Y, M, W, D, R


def run():
    br()
    print(f"{C} \u250c\u2500 {R}{W}formseal-embed{R}  {G}@formseal/embed{R}")
    print(G + " " + "\u2500" * 52 + R)
    br()

    # General
    print(f"  {G}>>{R} {Y}General{R}")
    print(G + " " + "\u2500" * 52 + R)
    cmd_line("fse init", "scaffold project")
    cmd_line("fse --help", "show this help")
    cmd_line("fse --version", "check version & updates")
    cmd_line("fse --about", "show logo and info")
    cmd_line("fse --aliases", "show shortand aliases")
    br()

    # Configure
    print(f"  {G}>>{R} {Y}Configure{R}")
    print(G + " " + "\u2500" * 52 + R)
    cmd_line("fse configure quick", "set endpoint + key")
    cmd_line("fse field add <name> type:email", "add field")
    cmd_line("fse field remove <name>", "remove field")
    br()

    # Update
    print(f"  {G}>>{R} {Y}Update{R}")
    print(G + " " + "\u2500" * 52 + R)
    cmd_line("fse update endpoint <url>", "update POST endpoint")
    cmd_line("fse update key <base64url>", "update X25519 public key")
    cmd_line("fse update origin <name>", "update form origin")
    br()

    # Coming soon
    print(f"  {G}>>{R} {M}Coming Soon{R}")
    print(G + " " + "\u2500" * 52 + R)
    cmd_line("fse doctor", "validate config and schema")
    br()

    # Docs
    print(f"  {G}>>{R} {Y}Docs{R}")
    print(G + " " + "\u2500" * 52 + R)
    link("https://github.com/grayguava/formseal-embed/docs")
    br()


def run_aliases():
    br()
    print(f"{C} \u250c\u2500 {R}{W}formseal-embed{R}    {G}shorthand aliases{R}")
    print(G + " " + "\u2500" * 52 + R)
    br()

    print(f"  {W}Short{R}     {G}Canonical{R}")
    print(G + " " + "\u2500" * 52 + R)
    print(f"  {W}-qc{R}       {G}configure quick{R}")
    print(f"  {W}-f{R}        {G}field{R}")
    print(f"  {W}-u{R}        {G}update{R}")
    br()