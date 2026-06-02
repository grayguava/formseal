# Fields

Fields define what to collect and how to validate it. They live in `fields.jsonl` and must match the `name` attributes on your form inputs.

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

## Options

| Option | Type | Description |
|---|---|---|
| `required` | boolean | Blocks submission if empty |
| `type` | `"email"` / `"tel"` / `"text"` | `text` = no validation, `email` = basic email pattern, `tel` = phone pattern |
| `maxLength` | number | Blocks submission if value exceeds this |

`type` is required for each field. `text` accepts any input (no format validation).

## CLI

```bash
# Add field (type required)
fse field add phone type:tel required:false
fse field phone type:tel required:false      # implicit (no "add" keyword)

# Remove field
fse field remove company

# Modify field
fse field phone required:true
fse field phone maxLen:100 type:email
fse -f phone required:true                   # shorthand
```
