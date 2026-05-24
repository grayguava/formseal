# fse/cli/ui/bodies.py
# Body output functions

from fse.ui.styles import D, G, O, R, S, W, Y, XFATAL


def br():
    print()


def fail(msg):
    br()
    print(f"{XFATAL} {msg}")
    br()
    raise SystemExit(1)


def row(icon, label, value):
    pad   = 12
    label = (label + " " * pad)[:pad]
    print(f"{S}{icon}{R}  {D}{label}{R}  {W}{value}{R}")


def ok(msg):
    print(f"  {G}✨{R} {msg}")


def info(msg):
    print(f"  {O}{msg}{R}")


def warn(msg):
    print(f"{Y}⚠ {R}{msg}")