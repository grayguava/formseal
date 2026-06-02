# helpers/errors — Error handler functions

from fse.ui import br, fail, neutral, C, WHITE, R

def unknown_command():
    neutral(f"{WHITE}This command doesn't exist. Run {C}fse --help{R}{WHITE} for available commands.{R}")

def handle_interrupt():
    from fse.ui import info
    br()
    info("Interrupted.")
    br()

def handle_exception(e):
    fail(str(e))
