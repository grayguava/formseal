import base64
import json

from nacl.public import PrivateKey

from fse.ui import br, header, D, G, W, R, RED


def run(args=None):
    br()
    header("keygen")
    br()

    private_key = PrivateKey.generate()
    public_key = private_key.public_key

    public_b64 = base64.urlsafe_b64encode(bytes(public_key)).rstrip(b"=").decode()
    private_b64 = base64.urlsafe_b64encode(bytes(private_key)).rstrip(b"=").decode()

    print(f"  {G}✨{R} Generated keypair!\n")

    if args and "--json" in args:
        output = {
            "publicKey": public_b64,
            "privateKey": private_b64,
        }
        raw = json.dumps(output, indent=2)
        print("  " + raw.replace("\n", "\n  "))
    else:
        print(f"    {D}Public key:{R}      {W}{public_b64}{R}")
        print(f"    {D}Private key:{R}     {W}{private_b64}{R}")

    br()
    br()
    print(f"{RED} WARNING:{R} KEEP THIS KEYPAIR SOMEWHERE SAFE. NEVER STORE ON YOUR SERVER.")
    print("          LOSS OF THIS KEY = LOSS OF DECRYPTION ABILITY")
    br()
