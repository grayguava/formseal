# commands/about.py
# About command - shows logo and info

from ui.output import br, link, O, R, W, D
from logo import LOGO


def run():
    br()
    lines = LOGO.strip().split("\n")
    for i, line in enumerate(lines):
        if i == 0:
            line = " " + line  # add leading space to first line
        print(f"{O}{line}{R}")
    br()
    print(f"  {W}Client-side encrypted contact forms.{R}")
    br()
    print(f"  {D}Author:{R} grayguava")
    print(f"  {D}License:{R} MIT")
    br()
    print(f"  {D}GitHub links:")
    link("https://github.com/grayguava/formseal-embed")
    link("https://github.com/grayguava/formseal-embed/docs")
    br()
