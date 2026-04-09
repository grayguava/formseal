# Fields

Fields define what to collect and how to validate it. They live in `fields.jsonl` and must match the `name` attributes on your form inputs.

---

## Defining fields

```javascript
fields: {
  name:    { required: true },
  email:   { required: true, type: "email" },
  message: { required: true, maxLength: 1000 },
}
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
| `type` | `"email"` / `"tel"` / `"text"` | Format validation |
| `maxLength` | number | Blocks submission if value exceeds this |

`type: "text"` is the default — no format validation applied.

---

## CLI

```bash
fse configure field add company required:false maxLength:50
fse configure field remove company
fse configure field required email true
fse configure field maxLength message 500
fse configure field type phone tel
```