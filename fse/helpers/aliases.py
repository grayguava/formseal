ALIASES = {
    "-i":  ["init"],
    "-r":  ["reset"],
    "-f":  ["field"],
}

def resolve(args):
    if not args:
        return args

    resolved = []
    i = 0
    while i < len(args):
        arg = args[i]
        if arg in ALIASES:
            replacement = ALIASES[arg]
            if isinstance(replacement, list):
                resolved.extend(replacement)
            else:
                resolved.append(replacement)
        else:
            resolved.append(arg)
        i += 1

    return resolved
