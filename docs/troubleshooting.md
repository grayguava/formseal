# Troubleshooting

Solutions to common issues with formseal-embed.

## 1. Installation issues

### "Command not found: fse"

**Cause**: Package not installed or PATH not updated.

**Solution**:

```bash
# Verify installation
pip show formseal-embed

# If installed but not found, add Python Scripts to PATH
# Windows: Add C:\Users\<you>\AppData\Local\Programs\Python\Python314\Scripts to PATH
# macOS/Linux: Typically added automatically via pip
```

---

## 2. Configuration issues

### "config not found" in doctor

**Cause**: Project not initialized.

**Solution**:

```bash
fse init
```

### "endpoint must use https"

**Cause**: Endpoint URL must use HTTPS.

**Solution**:

```bash
fse update endpoint https://your-api.example.com/submit
```

### "invalid X25519 public key length"

**Cause**: Public key must be 40-44 characters (base64url encoded).

**Solution**: Generate a new key pair:

```python
import base64
from nacl.public import PrivateKey

key = PrivateKey.generate()
public = base64.urlsafe_b64encode(bytes(key.public_key)).rstrip(b'=').decode()
private = base64.urlsafe_b64encode(bytes(key)).rstrip(b'=').decode()

print(f"Public key: {public}")
print(f"Private key: {private}")
```

---

## 3. Field configuration issues

### "duplicate field" error

**Cause**: Same field name defined multiple times in fields.jsonl.

**Solution**: Remove duplicates from `formseal-embed/config/fields.jsonl`.

### "invalid JSON in fields"

**Cause**: fields.jsonl contains malformed JSON.

**Solution**: Each line must be valid JSON:

```
{"name": {"required": true}}
{"email": {"required": true, "type": "email"}}
```

### "unsupported field type"

**Cause**: Using a type not supported.

**Solution**: Use only: `text`, `email`, `textarea`, `number`, `tel`.

---

## 4. Browser integration issues

### Form not submitting

**Cause**: JavaScript not loading or executing.

**Solution**:

1. Verify the script is loaded:
   ```html
   <script src="/formseal-embed/globals.js"></script>
   ```

2. Check browser console for errors.

3. Ensure form has `name` attributes on inputs.

### Validation errors not showing

**Cause**: Missing error span elements.

**Solution**: Add error spans for each field:

```html
<input type="text" name="email">
<span data-fse-error="email"></span>
```

---

## 5. Submission issues

### Endpoint not receiving data

**Cause**: CORS or network issues.

**Solution**:

1. Check browser network tab for failed requests.
2. Verify endpoint accepts POST requests.
3. Ensure endpoint doesn't require authentication headers.

### "fse is not defined"

**Cause**: Script not loaded before form submits.

**Solution**: Load script in `<head>` or before `</body>`.

---

## 6. Keyboard interrupt

### Ctrl+C during interactive prompt

**Behavior**: Prompt cancels gracefully, no changes made.

This is intentional — you can safely interrupt at any prompt.

---

## 7. Still stuck?

1. Run `fse doctor` to validate your setup.
2. Check [GitHub Issues](https://github.com/grayguava/formseal-embed/issues)
3. Open a new issue with:
   - Command you ran
   - Full error message
   - OS and version (`fse --version`)
