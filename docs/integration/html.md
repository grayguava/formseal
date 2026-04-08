# HTML integration

formseal-embed renders no markup. You write the form; formseal connects to it via selectors.

---

## Required

**A form with an ID**

```html
<form id="contact-form">
```

Matches `FSE.form` (default: `#contact-form`).

**A submit button with an ID**

```html
<button id="contact-submit">Send</button>
```

Matches `FSE.submit` (default: `#contact-submit`). formseal controls its disabled state and label during submission.

**Input `name` attributes matching your field config**

```html
<input name="name">
<input name="email">
<textarea name="message"></textarea>
```

---

## Optional

**Per-field error elements**

```html
<span data-fse-error="name"></span>
<span data-fse-error="email"></span>
```

formseal writes validation messages here. Without these, errors fall back to the status element.

**A status element**

```html
<div id="contact-status"></div>
```

Matches `FSE.status` (default: `#contact-status`). Receives success and error messages. Omit it and set `status: null` in config if you're handling everything via [callbacks](./javascript.md).

**The script tag**

```html
<script src="/formseal-embed/globals.js"></script>
```

Place it before `</body>`.

---

## Full example

```html
<form id="contact-form">
  <div>
    <label>Name</label>
    <input name="name">
    <span data-fse-error="name"></span>
  </div>

  <div>
    <label>Email</label>
    <input name="email">
    <span data-fse-error="email"></span>
  </div>

  <div>
    <label>Message</label>
    <textarea name="message"></textarea>
    <span data-fse-error="message"></span>
  </div>

  <button id="contact-submit">Send message</button>
</form>

<div id="contact-status"></div>

<script src="/formseal-embed/globals.js"></script>
```

---

## Selector reference

| Config key | Default | Matches |
|---|---|---|
| `FSE.form` | `#contact-form` | `<form id="contact-form">` |
| `FSE.submit` | `#contact-submit` | `<button id="contact-submit">` |
| `FSE.status` | `#contact-status` | `<div id="contact-status">` |
| field keys | — | `<input name="...">` |
| `data-fse-error` | — | `<span data-fse-error="...">` |

To use different IDs, override the defaults in your config:

```javascript
var FSE = {
  form:   "#my-form",
  submit: "#submit-btn",
  status: "#msg-box",
};
```

---

## Honeypot

Add a hidden field to reject bot submissions:

```html
<input
  type="text"
  name="_hp"
  tabindex="-1"
  autocomplete="off"
  style="position:absolute;left:-9999px;"
>
```

formseal discards the submission if this field has a value.

---

## Accessibility

formseal sets `aria-invalid="true"` on invalid fields, focuses the first error, and marks the status element with `aria-live="polite"`.