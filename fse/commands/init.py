# commands/init — Scaffold a new formseal-embed project

import shutil
from pathlib import Path

from fse.ui import br, ok, fail, C, R

SRC = Path(__file__).resolve().parent.parent / "src"
DEST = Path.cwd() / "formseal-embed"


def run(_=None):
    if DEST.exists():
        fail(
            "./formseal-embed/ already exists.\n"
            f"           Use {C}fse reset{R} to remove and re-scaffold."
        )

    shutil.copytree(SRC, DEST)

    br()
    ok("initialized")
    br()
