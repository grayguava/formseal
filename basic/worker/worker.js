// -----------------------------
// GLOBAL CORS HEADERS
// -----------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
};

// -----------------------------
// BASIC VERSION — NO RATE LIMITS
// NO SPAM CHECKS
// NO BODY SIZE LIMITS
// NO IP LOGIC
// -----------------------------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // OPTIONS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ROUTES
    if (url.pathname === "/api/submit") return handleSubmit(request, env);
    if (url.pathname === "/api/login") return handleAdminLogin(request, env);
    if (url.pathname === "/api/list") return handleList(request, env);
    if (url.pathname === "/api/get") return handleGet(request, env);
    if (url.pathname === "/api/all") return handleAll(request, env);

    return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
  }
};

//
// -----------------------------------------
// 1) RECEIVE ENCRYPTED CONTACT FORM MESSAGE
// -----------------------------------------
async function handleSubmit(request, env) {
  if (request.method !== "POST") {
    return new Response("Use POST", { status: 405, headers: CORS_HEADERS });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response("Bad JSON", { status: 400, headers: CORS_HEADERS });
  }

  if (!data.ciphertext) {
    return new Response("Missing ciphertext", { status: 400, headers: CORS_HEADERS });
  }

  const id = crypto.randomUUID();
  await env.MESSAGES.put(id, data.ciphertext);

  return new Response(JSON.stringify({ ok: true, id }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}

//
// -----------------------------------------
// 2) ADMIN LOGIN (Ed25519 SIGNATURE VERIFY)
// -----------------------------------------
async function handleAdminLogin(request, env) {
  if (request.method !== "POST") {
    return new Response("Use POST", { status: 405, headers: CORS_HEADERS });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Bad JSON", { status: 400, headers: CORS_HEADERS });
  }

  const { message, signature } = body;
  if (!message || !signature) {
    return new Response("Missing fields", { status: 400, headers: CORS_HEADERS });
  }

  const msgBytes = base64urlToBytes(message);
  const sigBytes = base64urlToBytes(signature);
  const pub = base64urlToBytes(env.ADMIN_PUBLIC_KEY);

  let valid = false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      pub,
      { name: "Ed25519", namedCurve: "Ed25519" },
      false,
      ["verify"]
    );
    valid = await crypto.subtle.verify("Ed25519", key, sigBytes, msgBytes);
  } catch {
    return new Response("Signature verify error", {
      status: 500,
      headers: CORS_HEADERS
    });
  }

  if (!valid) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }

  const token = await generateSessionToken();
  return new Response(JSON.stringify({ ok: true, token }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}

//
// -----------------------------------------
// 3) LIST ALL MESSAGE IDS
// -----------------------------------------
async function handleList(request, env) {
  const token = request.headers.get("X-Admin-Token");
  if (!verifySessionToken(token)) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }

  const list = await env.MESSAGES.list();
  return new Response(JSON.stringify(list.keys), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}

//
// -----------------------------------------
// 4) GET SINGLE MESSAGE
// -----------------------------------------
async function handleGet(request, env) {
  const token = request.headers.get("X-Admin-Token");
  if (!verifySessionToken(token)) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response("Missing id", { status: 400, headers: CORS_HEADERS });
  }

  const ciphertext = await env.MESSAGES.get(id);
  if (!ciphertext) {
    return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
  }

  return new Response(JSON.stringify({ ciphertext }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}

//
// -----------------------------------------
// 5) GET ALL MESSAGES
// -----------------------------------------
async function handleAll(request, env) {
  const token = request.headers.get("X-Admin-Token");
  if (!verifySessionToken(token)) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }

  const keys = await env.MESSAGES.list();
  const out = {};

  for (const item of keys.keys) {
    const ct = await env.MESSAGES.get(item.name);
    if (ct) out[item.name] = ct;
  }

  return new Response(JSON.stringify({ messages: out }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}

//
// -----------------------------------------
// UTILITIES
// -----------------------------------------
function base64urlToBytes(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) str += "=".repeat(4 - pad);
  const bin = atob(str);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

function bytesToBase64url(buf) {
  const bin = String.fromCharCode(...new Uint8Array(buf));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateSessionToken() {
  const buf = crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64url(buf);
}

function verifySessionToken(token) {
  if (!token) return false;
  try {
    const raw = base64urlToBytes(token);
    return raw.length === 32;
  } catch {
    return false;
  }
}
