<script src="./sodium.js"></script>

<script>
const FORM_PUBLIC_KEY = "YOUR_X25519_FORM_PUBLIC_KEY";  //* PUT YOUR X25519 PUBLIC KEY HERE
const WORKER_URL = "YOUR_WORKER_LINK/api/submit";  //* PUT YOUR WORKER LINK HERE

// Turnstile callback (added)
function turnstileCallback(token) {
  document.getElementById("cf_token").value = token;
}

// ---------- utilities ----------
function base64urlToBytes(b64url) {
  b64url = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64url.length % 4;
  if (pad) b64url += "=".repeat(4 - pad);
  const binary = atob(b64url);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function bytesToBase64url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ---------- prevent theme interference ----------
document.getElementById("secureSubmit").addEventListener("click", e => {
  e.stopPropagation();
}, true);

document.getElementById("secureForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  await sodium.ready;

  // anti double-submit (matches Worker’s spam window)
  const btn = document.getElementById("secureSubmit");
  btn.disabled = true;
  setTimeout(() => btn.disabled = false, 30000);

  const form = e.target;

  // metadata
  form.client_tz.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  form.client_time.value = new Date().toISOString();

  // honeypot
  if (form.website.value) return;

  const payloadObj = {
    fullname: form.fullname.value,
    email: form.email.value,
    message: form.message.value,
    client_tz: form.client_tz.value,
    client_time: form.client_time.value
  };

  // ---------- REQUIRED VALIDATION ----------
  if (!payloadObj.fullname.trim() ||
      !payloadObj.email.trim() ||
      !payloadObj.message.trim()) {
    alert("All fields must be filled.");
    return;
  }

  if (payloadObj.message.length > 1000) {
    alert("Message too long.");
    return;
  }

  // Turnstile token MUST exist
  const cfToken = document.getElementById("cf_token").value;
  if (!cfToken) {
    alert("Turnstile verification failed.");
    return;
  }

  // ---------- encryption ----------
  const payload = new TextEncoder().encode(JSON.stringify(payloadObj));
  const pub = base64urlToBytes(FORM_PUBLIC_KEY);
  const cipher = sodium.crypto_box_seal(payload, pub);
  const cipherB64 = bytesToBase64url(cipher);

  // ---------- send ----------
  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      ciphertext: cipherB64,
      cf_token: cfToken     // ADDED
    })
  });

  if (!res.ok) {
    alert("Failed to send message.");
    return;
  }

  window.location.href = "./thankyou.html";
}, true);
</script>
