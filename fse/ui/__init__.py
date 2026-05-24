# fse/cli/ui/__init__.py
# UI module exports

from fse.ui.styles import (
    RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE, GRAY,
    O, S, G, C, Y, M, W, D, R,
    HEAD, CROSS, XFATAL,
)
from fse.ui.headers import header, rule
from fse.ui.bodies import (
    br, fail, row, ok, info, warn,
)