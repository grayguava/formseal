import shutil

from fse.ui import br, ok, fail, W, R
from fse.helpers.config import SRC, DEST


def run(_=None):
    if DEST.exists():
        fail(
            "./formseal-embed/ already exists.\n"
            f"           Use {W}fse reset{R} to remove and re-scaffold."
        )

    shutil.copytree(SRC, DEST)

    br()
    ok("initialized")
    br()
