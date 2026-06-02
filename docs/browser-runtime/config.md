# Configuration reference

Complete reference of all `FSE` config keys. Values come from `config/fse.config.js`.

## Endpoint & Identity

| Key | Default | Description |
|---|---|---|
| `endpoint` | `"YOUR_POST_API_LINK_HERE"` | POST URL where ciphertext is sent. Must be HTTPS. |
| `origin` | `"contact-form"` | Form origin identifier embedded in every payload. |
| `publicKey` | `"PASTE_YOUR_BASE64URL_PUBLIC_KEY_HERE"` | X25519 public key for encryption. |

Set via `fse set endpoint`, `fse set key`, `fse set origin`.

## Form Selectors

| Key | Default | Description |
|---|---|---|
| `form` | `"#contact-form"` | CSS selector for the `<form>` element. |
| `submit` | `"#contact-submit"` | CSS selector for the submit button. |

See [HTML](./html.md) for markup requirements.

## Status Element

| Key | Default | Description |
|---|---|---|
| `status` | `"#contact-status"` | CSS selector for the status message element. Set to `null` to disable and use [callbacks](./javascript.md) instead. |

## Submit Button States

| Key | Default | Description |
|---|---|---|
| `submitStates.idle` | `"Send message"` | Button text before submission. |
| `submitStates.sending` | `"Sending..."` | Button text while submitting (button is disabled). |
| `submitStates.sent` | `"Sent"` | Button text after successful submission. |

## Success Behavior

| Key | Default | Description |
|---|---|---|
| `onSuccess.redirect` | `false` | If `true`, redirects to `redirectUrl` instead of showing a message. |
| `onSuccess.redirectUrl` | `"/thank-you"` | URL to redirect to on success. |
| `onSuccess.message` | `"Thanks! Your message has been sent."` | Text shown in the status element on success. |

## Error Behavior

| Key | Default | Description |
|---|---|---|
| `onError.message` | `"Something went wrong. Please try again."` | Text shown in the status element on network/POST failure. |

## Logging

| Key | Default | Description |
|---|---|---|
| `logging` | `true` | Set to `false` to suppress info and warning console logs. Errors always show. |

Set via `fse set logging true|false`.

## Fields

| Key | Default | Description |
|---|---|---|
| `fields` | `FSE_FIELDS` | Field definitions loaded from `fields.jsonl` at runtime. |

See [Fields](./fields.md) for the field definition format.
