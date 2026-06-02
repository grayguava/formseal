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

## 2. Configuration issues

### "endpoint must use https"

**Cause**: Endpoint URL must use HTTPS.

**Solution**:

```bash
fse set endpoint https://your-api.example.com/submit
```

### "invalid X25519 public key length"

**Cause**: Public key must be 40-44 characters (base64url encoded).

**Solution**: Generate a new key pair:

```bash
fse keygen
```

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

## 5. Submission issues

### Endpoint not receiving data

**Cause**: CORS or network issues.

**Solution**:

1. Check browser network tab for failed requests.
2. Verify endpoint accepts POST requests.
3. Ensure endpoint doesn't require authentication headers.

### Config syntax error

**Cause**: `fse.config.js` has a syntax error (missing brace, trailing comma, etc.).

**Solution**: Check the last saved change in `formseal-embed/config/fse.config.js`. The console shows `[formseal] Error: fse.config.js has a syntax error` with a fix hint.

### Form not submitting without visible error

**Cause**: Console logging suppressed via `logging: false` in config.

**Solution**: Temporarily set `logging: true` (or run `fse set logging true`) to see warnings and info. Only errors appear when `logging` is off.

## 6. Keyboard interrupt

### Ctrl+C during interactive prompt

**Behavior**: Prompt cancels gracefully, no changes made.

This is intentional — you can safely interrupt at any prompt.

## 7. Still stuck?

1. Check [GitHub Issues](https://github.com/useFormseal/embed/issues)
3. Open a new issue with:
   - Command you ran
   - Full error message
   - OS and version (`fse --version`)
