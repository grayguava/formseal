# ui/headers — Header and rule rendering

from fse.ui.styles import C, D, G, R, W, HEAD


def header(title=""):
    if title:
        print(f"{C} \u250c\u2500 {HEAD} {R}{W}formseal-embed{R}   {D}\\{R}   {W}{title}{R}")
    else:
        print(f"{C} \u250c\u2500 {HEAD} {R}{W}formseal-embed{R}")
    print(G + " " + "\u2500" * 52 + R)


def rule():
    print(G + " " + "\u2500" * 52 + R)