import { ENV } from "../../_shared/env.js";
import { authenticate } from "../../_shared/auth.js";

/* =========================
   HELPERS
========================= */

function formatUtcTimestamp() {
  const d = new Date();

  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();

  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const sec = String(d.getUTCSeconds()).padStart(2, "0");

  return `${dd}-${mm}-${yyyy} at ${hh}:${min}:${sec}`;
}

function formatFilenameTimestamp() {
  const d = new Date();

  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();

  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const sec = String(d.getUTCSeconds()).padStart(2, "0");

  return `${dd}${mm}${yyyy}-${hh}.${min}.${sec}`;
}

function randomHex(bytes = 6) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
}

/* =========================
   HANDLER
========================= */

export async function onRequestGet({ request, params, env }) {
  // ---- AUTH (NEW) ----
  const authResult = await authenticate({ request, env });
  if (!authResult.ok) {
    return authResult.response;
  }

  const { adminId } = authResult.auth;

  // ---- TOKEN LOOKUP ----
  const token = params.token;
  if (!token) return new Response("Not found", { status: 404 });

  const tokenKey = `export:${token}`;
  const raw = await env[ENV.EXPORT_TOKENS].get(tokenKey);
  if (!raw) return new Response("Invalid or expired token", { status: 404 });

  let record;
  try {
    record = JSON.parse(raw);
  } catch {
    return new Response("Corrupt token", { status: 500 });
  }

  // ---- EXPIRY CHECK ----
  const now = Math.floor(Date.now() / 1000);
  if (now > record.exp) {
    await env[ENV.EXPORT_TOKENS].delete(tokenKey);
    return new Response("Expired", { status: 404 });
  }

  // ---- IDENTITY ENFORCEMENT (CRITICAL) ----
  if (record.adminId !== adminId) {
    await env[ENV.EXPORT_TOKENS].delete(tokenKey);
    return new Response("Forbidden", { status: 403 });
  }

  // ---- burn token BEFORE streaming ----
  await env[ENV.EXPORT_TOKENS].delete(tokenKey);

  /* =========================
     METADATA STATE
  ========================= */

  let exportedCount = 0;
  let truncated = false;
  const errors = [];

  function recordError(code, reason) {
    truncated = true;
    errors.push({ code, reason });
  }

  /* =========================
     STREAM SETUP
  ========================= */

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const url = new URL(request.url);

  (async () => {
    try {
      /* ---------- HEADER META ---------- */
      const headerMeta = {
        type: "meta",
        export_time_utc: formatUtcTimestamp(),
        kv_namespace: ENV.FORMSUBMITS,
        source: {
          hostname: url.hostname,
          path: url.pathname
        }
      };

      await writer.write(
        encoder.encode(
          JSON.stringify(headerMeta, null, 2) +
          "\n\n\n\n"
        )
      );

      /* ---------- DATA STREAM ---------- */
      let cursor;
      do {
        let list;
        try {
          list = await env[ENV.FORMSUBMITS].list({ limit: 500, cursor });
        } catch {
          recordError("KV_LIST_FAILED", "KV list() failed");
          break;
        }

        for (const k of list.keys) {
          try {
            const val = await env[ENV.FORMSUBMITS].get(k.name);
            if (val === null) {
              recordError("KV_GET_NULL", "KV get() returned null");
              continue;
            }

            await writer.write(
              encoder.encode(
                JSON.stringify({ key: k.name, value: val }) + "\n"
              )
            );

            exportedCount++;
          } catch {
            recordError("KV_GET_FAILED", "KV get() threw");
          }
        }

        cursor = list.cursor;
      } while (cursor);

      /* ---------- FOOTER META ---------- */
      const footerMeta = {
        type: "summary",
        total_entries: exportedCount,
        truncated,
        errors
      };

      await writer.write(
        encoder.encode(
          "\n\n\n" +
          JSON.stringify(footerMeta, null, 2) +
          "\n"
        )
      );

    } catch {
      writer.abort();
      return;
    }

    writer.close();
  })();

  const filename =
    `${randomHex()}_${formatFilenameTimestamp()}.jsonl`;

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
