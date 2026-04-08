# JavaScript

---

## Callbacks

Define `window.fseCallbacks` before the formseal script tag to hook into form events.

```html
<script>
  window.fseCallbacks = {
    onSuccess: function(response) {
      // response = your endpoint's JSON response
    },
    onError: function(error) {
      // error = Error object
    }
  };
</script>
<script src="/formseal-embed/globals.js"></script>
```

`onSuccess` fires after a successful POST. `onError` fires on network failure — not on validation errors, which are handled inline.

---

## Skipping the status element

If you want full control over messaging, set `status: null` and handle everything in callbacks:

```javascript
var FSE = {
  status: null,
};
```

---

## Event reference

| Event | Trigger | `onError` called? |
|---|---|---|
| Validation failure | Missing or invalid field | No |
| Network error | POST fails | Yes |
| Success | POST returns 2xx | No — use `onSuccess` |