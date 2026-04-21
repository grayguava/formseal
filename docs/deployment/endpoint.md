# Endpoint

What your endpoint receives on form submission.

---

## Request format

```
POST https://your-server.com/submit
Content-Type: text/plain

<base64url-encoded ciphertext>
```

The body is ciphertext prefixed with `formseal.` e.g. `formseal.ABcDef...`

---

## What to do with it

Store it. That's the entire job of your endpoint.

```javascript
// Cloudflare Pages example
export async function onRequestPost({ request, env }) {
  const ciphertext = await request.text();
  await env.SUBMISSIONS.put(crypto.randomUUID(), ciphertext);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
```

Don't parse it. Don't try to decrypt it server-side. Just save the string.

---

## Storage

The ciphertext is a plain string — store it anywhere:

- **KV / Redis**: `put(id, ciphertext)`
- **SQL**: insert into a `text` column
- **Object storage**: write as a flat file
- **Anything else**: if it holds a string, it works

---

## Response

Return JSON. Whatever you return goes to the [`onSuccess`](../integration/javascript.md) callback.

```json
{ "ok": true, "id": "uuid" }
```