# commands/version.py
# Show version info.

from pathlib import Path

VERSION_PATH = Path(__file__).parent.parent.parent / "version.txt"


def run():
    from ui import br
    version = _get_local_version()
    br()
    print(f"v{version}")


def _get_local_version():
    try:
        return VERSION_PATH.read_text(encoding="utf-8").strip()
    except:
        return "unknown"
