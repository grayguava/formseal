// /functions/api/challenge/index.js

import { ENV } from "../../_shared/env.js";

export async function onRequestPost({ request, env }) {
  if (!env[ENV.POW_SECRET]) {
    return new Response("Misconfigured", { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const benchMs = Number(body.bench_ms);
  if (!Number.isFinite(benchMs) || benchMs <= 0) {
    return new Response("Invalid benchmark", { status: 400 });
  }

  // --- decide difficulty (server authority)
  let difficulty;
  if (benchMs < 0.08) difficulty = 18;
  else if (benchMs < 0.12) difficulty = 17;
  else if (benchMs < 0.20) difficulty = 16;
  else if (benchMs < 0.35) difficulty = 15;
  else if (benchMs < 0.60) difficulty = 14;
  else difficulty = 13;
  
  difficulty = Math.max(12, difficulty - 1);

  const ts = Math.floor(Date.now() / 1000);

  const enc = new TextEncoder();
  const input = enc.encode(`${ts}|${env[ENV.POW_SECRET]}`);
  const hashBuf = await crypto.subtle.digest("SHA-256", input);

  const salt = btoa(
    String.fromCharCode(...new Uint8Array(hashBuf))
  ).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return new Response(
    JSON.stringify({ ts, salt, difficulty }),
    { headers: { "Content-Type": "application/json" } }
  );
}

