// /functions/api/write/index.js

import { ENV } from "../../_shared/env.js";

const MAX_CIPHERTEXT_B64 = 4096;
const MESSAGE_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

export async function onRequestPost({ request, env }) {
  // --- hard gate: internal-only
  const auth = request.headers.get("X-Internal-Auth");
  if (auth !== env[ENV.WRITE_SECRET]) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!env[ENV.FORMSUBMITS]) {
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

  // strict schema: ciphertext only
  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== "ciphertext") {
    return new Response("Invalid payload", { status: 400 });
  }

  const { ciphertext } = body;

  if (typeof ciphertext !== "string") {
    return new Response("Invalid payload", { status: 400 });
  }

  if (ciphertext.length > MAX_CIPHERTEXT_B64) {
    return new Response("Ciphertext too large", { status: 413 });
  }

  // blind write
  await env.GUAVA_FORMSUBMITS.put(
    crypto.randomUUID(),
    ciphertext,
    { expirationTtl: MESSAGE_TTL_SEC }
  );

  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { "Content-Type": "application/json" } }
  );
}
