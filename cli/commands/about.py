# commands/about.py
# About command - shows project info

from ui.output import br, link, C, G, W, D, R


def run():
    br()
    print(f"{C}┌─{R} {W}formseal-embed{R}")
    print(f"{C}│{R} {W}Client-side encrypted contact forms{R}")
    print(f"{C}└────────────────────────────────────{R}")
    br()
    print(f"  {D}Author:{R} grayguava")
    print(f"  {D}License:{R} MIT")
    br()
    print(f"  {D}Project:{R}")
    link("https://github.com/grayguava/formseal-embed")
    br()
    print(f"  {D}Documentation:{R}")
    link("https://github.com/grayguava/formseal-embed/docs")
    br()