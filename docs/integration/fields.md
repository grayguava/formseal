# Fields

Fields define what to collect and how to validate it. They live in `fields.jsonl` and must match the `name` attributes on your form inputs.

---

## Defining fields

Fields are defined in JSONL format (one JSON object per line):

```
{"name": {"required": true, "maxLength": 100}}
{"email": {"type": "email", "required": true}}
{"message": {"type": "text", "required": true, "maxLength": 1000}}
```

```html
<input name="name">
<input name="email">
<textarea name="message"></textarea>
```

The key must exactly match the HTML `name`. Inputs without a matching field key are ignored.

---

## Options

| Option | Type | Description |
|---|---|---|
| `required` | boolean | Blocks submission if empty |
| `type` | `"email"` / `"tel"` / `"text"` | Format validation (required) |
| `maxLength` | number | Blocks submission if value exceeds this |

`type` is required for each field.

---

## CLI

```bash
# Add field (type required)
fse field add phone type:tel required:false

# Remove field
fse field rm company

# Modify field
fse -f phone required:true
fse -f phone maxLen:100 type:email
```
