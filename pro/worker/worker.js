// -----------------------------
// GLOBAL CORS HEADERS
// -----------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
};

// -----------------------------
// SECURITY CONSTANTS
// -----------------------------
const MAX_BODY_SIZE = 10_000; // max JSON size (10KB)
const RATE_LIMIT_MAX = 5;     // 5 requests
const RATE_LIMIT_WINDOW = 60; // per 60 seconds
const SUBMIT_WINDOW = 60;     // spam throttle for /submit

// -----------------------------
// MAIN ROUTER
// -----------------------------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ROUTES
    if (url.pathname === "/api/submit") {
      return handleSubmit(request, env);
    }
    if (url.pathname === "/api/login") {
      return handleAdminLogin(request, env);
    }
    if (url.pathname === "/api/list") {
      return handleList(request, env);
    }
    if (url.pathname === "/api/get") {
      return handleGet(request, env);
    }
    if (url.pathname === "/api/all") {
      return handleAll(request, env);
    }

    return new Response("Not Found", {
      status: 404,
      headers: CORS_HEADERS
    });
  }
};


//
// -----------------------------------------
// 1) RECEIVE ENCRYPTED CONTACT FORM MESSAGE
// -----------------------------------------
async function handleSubmit(request, env) {
  if (request.method !== "POST") {
    return new Response("Use POST", {
      status: 405,
      headers: CORS_HEADERS
    });
  }

  const ip = getClientIP(request);

  // rate limit
  if (!(await rateLimitCheck(env, ip, "submit"))) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: CORS_HEADERS
    });
  }

  // spam double-submit protection
  if (!(await submitSpamCheck(env, ip))) {
    return new Response("Slow down", {
      status: 429,
      headers: CORS_HEADERS
    });
  }

  // body size limit
  const raw = await request.text();
  if (raw.length > MAX_BODY_SIZE) {
    return new Response("Payload too large", {
      status: 413,
      headers: CORS_HEADERS
    });
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  // --- Turnstile strict verification ---
if (!data.cf_token) {
  return new Response("Missing Turnstile token", {
    status: 400,
    headers: CORS_HEADERS
  });
}

const turnOK = await verifyTurnstile(env.TURNSTILE_SECRET, data.cf_token, ip);
if (!turnOK) {
  return new Response("Turnstile verification failed", {
    status: 400,
    headers: CORS_HEADERS
  });
}

// Continue normally
if (!data.ciphertext) {
  return new Response("Missing ciphertext", {
    status: 400,
    headers: CORS_HEADERS
  });
}

  const id = crypto.randomUUID();
  await env.MESSAGES.put(id, data.ciphertext);

  return new Response(JSON.stringify({ ok: true, id }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}



//
// -----------------------------------------
// 2) ADMIN LOGIN (Ed25519 SIGNATURE VERIFY)
// -----------------------------------------
async function handleAdminLogin(request, env) {
  if (request.method !== "POST") {
    return new Response("Use POST", {
      status: 405,
      headers: CORS_HEADERS
    });
  }

  const ip = getClientIP(request);

  // anti-bruteforce rate limit
  if (!(await rateLimitCheck(env, ip, "login"))) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: CORS_HEADERS
    });
  }

  // body size cap
  const raw = await request.text();
  if (raw.length > 2000) {
    return new Response("Payload too large", {
      status: 413,
      headers: CORS_HEADERS
    });
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  const { message, signature } = body;

  if (!message || !signature) {
    return new Response("Missing fields", {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  // Base64URL → bytes
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

    valid = await crypto.subtle.verify(
      "Ed25519",
      key,
      sigBytes,
      msgBytes
    );
  } catch (e) {
    return new Response("Signature verify error", {
      status: 500,
      headers: CORS_HEADERS
    });
  }

  if (!valid) {
    return new Response("Unauthorized", {
      status: 401,
      headers: CORS_HEADERS
    });
  }

  const token = await generateSessionToken();

  return new Response(JSON.stringify({ ok: true, token }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}


//
// -----------------------------------------
// 3) LIST ALL MESSAGE IDS
// -----------------------------------------
async function handleList(request, env) {
  const ip = getClientIP(request);
  if (!(await rateLimitCheck(env, ip, "admin"))) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: CORS_HEADERS
    });
  }

  const token = request.headers.get("X-Admin-Token");
  if (!verifySessionToken(token)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: CORS_HEADERS
    });
  }

  const list = await env.MESSAGES.list();

  return new Response(JSON.stringify(list.keys), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}


//
// -----------------------------------------
// 4) GET A SINGLE ENCRYPTED MESSAGE
// -----------------------------------------
async function handleGet(request, env) {
  const ip = getClientIP(request);
  if (!(await rateLimitCheck(env, ip, "admin"))) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: CORS_HEADERS
    });
  }

  const token = request.headers.get("X-Admin-Token");
  if (!verifySessionToken(token)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: CORS_HEADERS
    });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response("Missing id", {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  const ciphertext = await env.MESSAGES.get(id);

  if (!ciphertext) {
    return new Response("Not Found", {
      status: 404,
      headers: CORS_HEADERS
    });
  }

  return new Response(JSON.stringify({ ciphertext }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}


//
// -----------------------------------------
// 5) GET ALL MESSAGES
// -----------------------------------------
async function handleAll(request, env) {
  const ip = getClientIP(request);
  if (!(await rateLimitCheck(env, ip, "admin"))) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: CORS_HEADERS
    });
  }

  const token = request.headers.get("X-Admin-Token");
  if (!verifySessionToken(token)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: CORS_HEADERS
    });
  }

  const keys = await env.MESSAGES.list();
  const out = {};

  for (const item of keys.keys) {
    const ciphertext = await env.MESSAGES.get(item.name);
    if (ciphertext) out[item.name] = ciphertext;
  }

  return new Response(JSON.stringify({ messages: out }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
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
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function bytesToBase64url(buffer) {
  const bin = String.fromCharCode(...new Uint8Array(buffer));
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

function getClientIP(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown"
  );
}

async function rateLimitCheck(env, ip, route) {
  const key = `rl:${route}:${ip}`;
  const current = await env.RATELIMIT.get(key, { type: "json" });

  const now = Date.now();

  if (!current) {
    await env.RATELIMIT.put(
      key,
      JSON.stringify({ count: 1, ts: now }),
      { expirationTtl: RATE_LIMIT_WINDOW }
    );
    return true;
  }

  if (now - current.ts > RATE_LIMIT_WINDOW * 1000) {
    await env.RATELIMIT.put(
      key,
      JSON.stringify({ count: 1, ts: now }),
      { expirationTtl: RATE_LIMIT_WINDOW }
    );
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }

  await env.RATELIMIT.put(
    key,
    JSON.stringify({ count: current.count + 1, ts: current.ts }),
    { expirationTtl: RATE_LIMIT_WINDOW }
  );
  return true;
}

async function submitSpamCheck(env, ip) {
  const key = `spam:${ip}`;
  const recent = await env.RATELIMIT.get(key);
  if (recent) return false;

  await env.RATELIMIT.put(key, "1", { expirationTtl: SUBMIT_WINDOW });
  return true;
}

async function verifyTurnstile(secret, token, ip) {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  form.append("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form
  });

  const out = await res.json();
  return out.success === true;
}
