# fse/cmd.py
# Command registry

from fse.cli.commands.init import run as run_init
from fse.cli.commands.reset import run as run_reset
from fse.cli.commands.field import run as run_field
from fse.cli.commands.set import run as run_set
from fse.cli.commands.doctor import run as run_doctor
from fse.cli.commands.keygen import run as run_keygen


COMMANDS = {
    "init":   ("Scaffold project", run_init),
    "reset":  ("Remove + re-scaffold", run_reset),
    "field":  ("Add/remove fields", run_field),
    "set":    ("Configure endpoint/key", run_set),
    "doctor": ("Validate configuration", run_doctor),
    "keygen": ("Generate X25519 keypair", run_keygen),
}