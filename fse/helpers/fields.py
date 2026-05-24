FIELD_TYPES = {
    "text": {
        "validate": None,
    },
    "email": {
        "validate": r"^[^\s@]+@[^\s@]+\.[^\s@]+$",
    },
    "tel": {
        "validate": r"^\+?[\d\s\-().]{6,20}$",
    },
}

VALID_TYPES = tuple(FIELD_TYPES.keys())
