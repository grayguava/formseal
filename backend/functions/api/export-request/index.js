import { ENV } from "../../_shared/env.js";
import { authenticate } from "../../_shared/auth.js";

/* =========================
   HELPERS
========================= */

function base64UrlToBytes(b64url) {
  const b64 = b64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(b64url.length / 4) * 4, "=");

  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function randomToken(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
}

/* =========================
   HANDLER
========================= */

export async function onRequestPost({ request, env }) {
  // ---- DEBUG (TEMPORARY) ----
  console.log("AUTH HEADER RAW =", request.headers.get("Authorization"));

  const authResult = await authenticate({ request, env });
  console.log("AUTH RESULT =", authResult);

  if (!authResult.ok) {
    return new Response("AUTH FAIL", { status: 403 });
  }

  const { adminId, mode } = authResult.auth;
  console.log("MODE =", mode);

  // ---- BODY PARSE ----
  let body = {};
  try {
    body = await request.json();
  } catch {
    if (mode === "browser") {
      return new Response("Invalid JSON", { status: 400 });
    }
  }

  const { ts, nonce, signature } = body;

  // ---- browser-only field check ----
  if (mode === "browser") {
    if (!ts || !nonce || !signature) {
      return new Response("Missing fields", { status: 400 });
    }
  }

  // ---- timestamp check (browser only) ----
  const now = Math.floor(Date.now() / 1000);
  if (mode === "browser" && Math.abs(now - ts) > 120) {
    return new Response("Stale request", { status: 403 });
  }

  // ---- nonce single-use (browser only) ----
  if (mode === "browser") {
    const nonceKey = `nonce:${nonce}`;
    if (await env[ENV.EXPORT_TOKENS].get(nonceKey)) {
      return new Response("Replay detected", { status: 403 });
    }
    await env[ENV.EXPORT_TOKENS].put(nonceKey, "1", {
      expirationTtl: 300
    });
  }

  // ---- verify signature (browser only) ----
  if (mode === "browser") {
    const canonical = [
      "EXPORT_V1",
      "POST",
      "/api/export-request",
      ts,
      nonce
    ].join("\n");

    let valid = false;
    try {
      const pubKey = await crypto.subtle.importKey(
        "raw",
        base64UrlToBytes(env[ENV.ADMIN_PUBLIC_KEY]),
        { name: "Ed25519" },
        false,
        ["verify"]
      );

      valid = await crypto.subtle.verify(
        "Ed25519",
        pubKey,
        base64UrlToBytes(signature),
        new TextEncoder().encode(canonical)
      );
    } catch {
      return new Response("Verification failure", { status: 403 });
    }

    if (!valid) {
      return new Response("Unauthorized", { status: 403 });
    }
  }

  // ---- mint one-time export token ----
  const token = randomToken();
  const tokenKey = `export:${token}`;

  await env[ENV.EXPORT_TOKENS].put(
    tokenKey,
    JSON.stringify({
      adminId,
      mode,
      exp: now + 60
    }),
    { expirationTtl: 60 }
  );

  return new Response(
    JSON.stringify({
      download_url: `/api/export/${token}`,
      expires_in: 60
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}
