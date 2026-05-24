import shutil

from fse.ui import br, ok
from fse.helpers.config import SRC, DEST


def run(_=None):
    if DEST.exists():
        shutil.rmtree(DEST)

    shutil.copytree(SRC, DEST)

    br()
    ok("re-initialized")
    br()
