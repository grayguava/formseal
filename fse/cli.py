# cli — Entry point and command registry

import sys

from fse.helpers.aliases import resolve
from fse.helpers.errors import unknown_command, handle_interrupt, handle_exception

from fse.commands import init as cmd_init
from fse.commands import reset as cmd_reset
from fse.commands import field as cmd_field
from fse.commands import set as cmd_set
from fse.commands import keygen as cmd_keygen
from fse.commands import about as cmd_about
from fse.commands import version as cmd_version
from fse.commands import help as cmd_help
from fse.commands import status as cmd_status


COMMANDS = {
    "init":   ("Scaffold project", cmd_init.run),
    "reset":  ("Remove + re-scaffold", cmd_reset.run),
    "field":  ("Add/remove fields", cmd_field.run),
    "set":    ("Configure endpoint/key", cmd_set.run),
    "keygen": ("Generate X25519 keypair", cmd_keygen.run),
    "status": ("Show current config", cmd_status.run),
}


def main():
    if len(sys.argv) < 2:
        cmd_about.run()
        return

    args = resolve(sys.argv[1:])
    cmd = args[0].lower()
    cmd_args = args[1:]

    if cmd == "--help":
        cmd_help.run()
        return

    if cmd == "--version" or cmd == "version":
        cmd_version.run()
        return

    if cmd == "--aliases":
        cmd_help.run_aliases()
        return

    if cmd not in COMMANDS:
        unknown_command()

    _, handler = COMMANDS[cmd]

    try:
        handler(cmd_args)
    except KeyboardInterrupt:
        handle_interrupt()
        sys.exit(130)
    except Exception as e:
        handle_exception(e)


if __name__ == "__main__":
    main()
