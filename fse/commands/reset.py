# commands/reset — Remove and re-scaffold formseal-embed project

import shutil
from pathlib import Path

from fse.ui import br, ok

SRC = Path(__file__).resolve().parent.parent / "src"
DEST = Path.cwd() / "formseal-embed"


def run(_=None):
    if DEST.exists():
        shutil.rmtree(DEST)

    shutil.copytree(SRC, DEST)

    br()
    ok("re-initialized")
    br()
