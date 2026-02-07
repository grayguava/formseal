// functions/api/export-request/index.js

import { ENV } from "../../_shared/env.js";
import { authenticate } from "../../_shared/auth.js";

/* =========================
   HELPERS
========================= */

function randomToken(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
}

/* =========================
   HANDLER
========================= */

export async function onRequestPost({ request, env }) {
  // ---- AUTHENTICATION (AUTOMATION ONLY) ----
  const authResult = await authenticate({ request, env });

  if (!authResult.ok) {
    return new Response("Unauthorized", { status: 403 });
  }

  const { adminId } = authResult.auth;

  // ---- MINT ONE-TIME EXPORT TOKEN ----
  const now = Math.floor(Date.now() / 1000);
  const token = randomToken();
  const tokenKey = `export:${token}`;

  await env[ENV.EXPORT_TOKENS].put(
    tokenKey,
    JSON.stringify({
      adminId,
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
