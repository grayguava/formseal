# ui/bodies — Body text output (fail, neutral, ok, info, warn)

from fse.ui.styles import D, ERROR, G, O, R, S, W, Y


def br():
    print()


def fail(msg):
    br()
    print(f" {ERROR}Error:{R} {msg}")
    raise SystemExit(1)


def neutral(msg):
    br()
    print(f" \U0001f610 {msg}")
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
    print(f"  {Y}⚠️ {R}{msg}")