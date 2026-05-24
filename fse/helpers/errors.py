from fse.ui import fail, br

def unknown_command(cmd):
    br()
    fail(f"Unknown command: {cmd}\nRun 'fse --help' for available commands")

def handle_interrupt():
    from fse.ui import info
    br()
    info("Interrupted.")
    br()

def handle_exception(e):
    from fse.ui import fail
    fail(str(e))
