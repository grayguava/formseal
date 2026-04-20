# commands/about.py
# About command - shows project info

from ui import br, header, C, G, W, D, R


def _load_version():
    from pathlib import Path
    p = Path(__file__).parent.parent.parent / "version.txt"
    if p.exists():
        return p.read_text().strip()
    return "dev"


VERSION = _load_version()


def run():
    br()
    header()
    br()
    print(f"  {W}CLI for scaffolding and setting up formseal-embed in your project{R}")
    br()
    print(f"  Part of the {C}formseal{R} ecosystem")
    br()
    print(f"  {G}Repository:{R}  https://github.com/grayguava/formseal-embed")
    print(f"  {G}License:{R}  MIT")
    print(f"  {G}Maintained by:{R}  grayguava")
    br()