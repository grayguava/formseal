# commands/help.py
# Help command - shows all available commands

from ui.output import br, rule, cmd_line, link, C, G, Y, M, W, D, R


def run():
    br()
    print(f"{C} \u250c\u2500 {R}{W}formseal-embed{R}  {G}@formseal/embed{R}")
    print(G + " " + "\u2500" * 52 + R)
    print(f"  {G}>>{R} {Y}Commands{R}")
    print(G + " " + "\u2500" * 52 + R)
    cmd_line("fse init",                "scaffold ./formseal-embed/ into current directory")
    cmd_line("fse configure quick",      "set endpoint and public key")
    cmd_line("fse configure field add",    "add a field")
    cmd_line("fse configure field remove", "remove a field")
    cmd_line("fse configure field required", "set field required")
    cmd_line("fse configure field maxLength", "set field max length")
    cmd_line("fse configure field type", "set field type (email|tel|text)")
    br()
    print(f"  {G}>>{R} {M}coming soon{R}")
    print(G + " " + "\u2500" * 52 + R)
    cmd_line("fse doctor",              "validate config and schema")
    br()
    print(f"  {G}>>{R} {Y}docs{R}")
    print(G + " " + "\u2500" * 52 + R)
    print(f"  {G}Docs:{R}")
    link("https://github.com/grayguava/formseal-embed/docs")
    br()
