# ui/output.py
# All terminal output primitives. No logic, no commands.
# Every print in fse goes through here.

import os
import sys

if os.name == "nt":
    try:
        os.system("chcp 65001 >nul")
    except:
        pass

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except:
    pass

# -- ansi colors --

RESET  = "\x1b[0m"
BOLD   = "\x1b[1m"
DIM    = "\x1b[2m"

RED    = "\x1b[31m"
GREEN  = "\x1b[32m"
YELLOW = "\x1b[33m"
BLUE   = "\x1b[34m"
MAGENTA= "\x1b[35m"
CYAN   = "\x1b[36m"
WHITE  = "\x1b[37m"
GRAY   = "\x1b[90m"

# Semantic palette
B = "\x1b[38;5;109m"  # muted green - arguments/placeholders
C = "\x1b[38;5;117m"  # soft cyan - title, links, script tag
M = "\x1b[38;5;141m"  # muted magenta - experimental sections
G = "\x1b[38;5;244m"  # dim gray - descriptions
Y = "\x1b[38;5;103m"  # muted purple - section headers
S = "\x1b[38;5;112m"  # soft green - success states
O = "\x1b[38;5;130m"  # dim orange - logo
W = WHITE + BOLD      # bright white - commands
D = DIM              # dim - secondary
R = RESET            # reset


# -- primitives --

def br():
    print()

def rule():
    print(G + " " + "\u2500" * 52 + R)

def badge(label, color):
    return f"{color}{BOLD} {label} {R}"

def fail(msg):
    br()
    print(f"{badge('ERR', RED)} {msg}")
    br()
    raise SystemExit(1)

def row(icon, label, value):
    pad   = 10
    label = (label + " " * pad)[:pad]
    print(f"{S}{icon}{R}  {D}{label}{R}  {W}{value}{R}")

def cmd_line(command, desc):
    pad     = 34
    command = (command + " " * pad)[:pad]
    print(f"  {W}{command}{R}{G}{desc}{R}")

def code(msg):
    print(f"  {C}{msg}{R}")

def link(msg):
    print(f"  {C}{msg}{R}")