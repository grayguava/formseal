// /functions/api/verify/index.js


import { ENV } from "../../_shared/env.js";


const MAX_CIPHERTEXT_B64 = 4096;
const POW_WINDOW_SEC = 60;
const REPLAY_TTL_SEC = POW_WINDOW_SEC + 10;

// --- helpers -------------------------------------------------

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256Bytes(data) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(data));
  return new Uint8Array(buf);
}

function hasLeadingZeroBits(bytes, bits) {
  let remaining = bits;

  for (const b of bytes) {
    if (remaining <= 0) return true;

    if (remaining >= 8) {
      if (b !== 0) return false;
      remaining -= 8;
    } else {
      return (b >> (8 - remaining)) === 0;
    }
  }
  return true;
}

// --- PoW verification ---------------------------------------

async function verifyPoW(ciphertext, nonce, ts, salt, difficulty, env) {
  const now = Math.floor(Date.now() / 1000);

  // freshness window
  if (Math.abs(now - ts) > POW_WINDOW_SEC) {
    return null;
  }

  // recompute expected salt
  const expectedSaltBytes = await sha256Bytes(`${ts}|${env[ENV.POW_SECRET]}`);
  const expectedSalt = base64url(expectedSaltBytes);

  if (salt !== expectedSalt) {
    return null;
  }

  // recompute PoW hash
  const hashBytes = await sha256Bytes(
   `${nonce}|${ciphertext}|${ts}|${salt}|${difficulty}`
  );

  if (!hasLeadingZeroBits(hashBytes, difficulty)) {
  return null;
  }


  // return replay key (hash of proof)
  const replayKeyBytes = await sha256Bytes(
    `${nonce}|${ciphertext}|${ts}|${salt}`
  );

  return base64url(replayKeyBytes);
}

async function checkAndMarkReplay(env, key) {
  const existing = await env[ENV.RATELIMIT].get(key);
  if (existing) return false;

  await env[ENV.RATELIMIT].put(key, "1", {
    expirationTtl: REPLAY_TTL_SEC
  });

  return true;
}

// --- handler -------------------------------------------------

export async function onRequestPost({ request, env }) {
  if (!env[ENV.POW_SECRET] || !env[ENV.RATELIMIT] || !env[ENV.WRITE_SECRET]) {
    return new Response("Misconfigured", { status: 500 });
  }

  if (!request.headers.get("Content-Type")?.startsWith("application/json")) {
    return new Response("Unsupported Media Type", { status: 415 });
  }

  const raw = await request.text();
  if (raw.length > 10000) {
    return new Response("Payload too large", { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const allowed = ["ciphertext", "nonce", "ts", "salt", "difficulty"];
  for (const k of Object.keys(body)) {
    if (!allowed.includes(k)) {
      return new Response("Invalid payload", { status: 400 });
    }
  }

  const { ciphertext, nonce, ts, salt, difficulty } = body;
    
    if (
  typeof difficulty !== "number" ||
  difficulty < 12 ||
  difficulty > 18
) {
  return new Response("Invalid difficulty", { status: 400 });
}


  if (
    typeof ciphertext !== "string" ||
    typeof nonce !== "string" ||
    typeof ts !== "number" ||
    typeof salt !== "string"
  ) {
    return new Response("Invalid payload", { status: 400 });
  }

  if (ciphertext.length > MAX_CIPHERTEXT_B64) {
    return new Response("Ciphertext too large", { status: 413 });
  }

  // --- PoW enforcement
  const replayKey = await verifyPoW(ciphertext, nonce, ts, salt, difficulty, env);
  if (!replayKey) {
    return new Response("PoW failed", { status: 403 });
  }

  if (!(await checkAndMarkReplay(env, replayKey))) {
    return new Response("PoW replay", { status: 403 });
  }

  // --- forward to write backend (internal only)
  
const url = new URL("/api/write", request.url);

const writeRes = await fetch(url.toString(), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Internal-Auth": env[ENV.WRITE_SECRET]
  },
  body: JSON.stringify({ ciphertext })
});


  if (!writeRes.ok) {
    return new Response("Storage failed", { status: 502 });
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { "Content-Type": "application/json" } }
  );
}
