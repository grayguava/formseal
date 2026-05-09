# fse/cli/commands/keygen.py
# Keygen command - generate X25519 keypair

import base64
import json

from nacl.public import PrivateKey

from fse.cli.ui import br, header, rule, G, R, RED


def run(_=None):
    br()
    header("keygen")
    br()

    private_key = PrivateKey.generate()
    public_key = private_key.public_key

    public_b64 = base64.urlsafe_b64encode(bytes(public_key)).rstrip(b"=").decode()
    private_b64 = base64.urlsafe_b64encode(bytes(private_key)).rstrip(b"=").decode()

    output = {
        "publicKey": public_b64,
        "privateKey": private_b64,
    }

    print(json.dumps(output, indent=2))
    br()

    print(f"{RED}WARNING:{R} KEEP THIS KEYPAIR SOMEWHERE SAFE. NEVER STORE ON YOUR SERVER.")
    print(f"         LOSS OF THIS KEY = LOSS OF DECRYPTION ABILITY")
    br()