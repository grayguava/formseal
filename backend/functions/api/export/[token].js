// functions/api/export/[token].js

import { ENV } from "../../_shared/env.js";
import { authenticate } from "../../_shared/auth.js";

/* =========================
   CONSTANTS
========================= */

const MAX_EXPORT = 50_000; // safety cap, operator-side protection

/* =========================
   HELPERS
========================= */

function formatUtcTimestamp() {
  const d = new Date();
  return d.toISOString().replace("T", " ").replace("Z", " UTC");
}

function formatFilenameTimestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");

  return (
    `${pad(d.getUTCDate())}${pad(d.getUTCMonth() + 1)}${d.getUTCFullYear()}` +
    `-${pad(d.getUTCHours())}.${pad(d.getUTCMinutes())}.${pad(d.getUTCSeconds())}`
  );
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
  // NOTE:
  // Export requires BOTH:
  // - valid admin automation bearer secret
  // - valid, unexpired, single-use export token

  const authResult = await authenticate({ request, env });
  if (!authResult.ok) {
    return authResult.response;
  }

  const { adminId } = authResult.auth;

  const token = params.token;
  if (!token) {
    return new Response("Invalid token", { status: 400 });
  }

  const tokenKey = `export:${token}`;
  const raw = await env[ENV.EXPORT_TOKENS].get(tokenKey);

  if (!raw) {
    return new Response("Invalid or expired token", { status: 404 });
  }

  let record;
  try {
    record = JSON.parse(raw);
  } catch {
    await env[ENV.EXPORT_TOKENS].delete(tokenKey);
    return new Response("Invalid token", { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now > record.exp) {
    await env[ENV.EXPORT_TOKENS].delete(tokenKey);
    return new Response("Expired", { status: 404 });
  }

  if (record.adminId !== adminId) {
    await env[ENV.EXPORT_TOKENS].delete(tokenKey);
    return new Response("Forbidden", { status: 403 });
  }

  // burn token BEFORE streaming
  await env[ENV.EXPORT_TOKENS].delete(tokenKey);

  /* =========================
     STREAM STATE
  ========================= */

  let exportedCount = 0;
  let truncated = false;
  const errors = [];

  function recordError(code, reason) {
    truncated = true;
    errors.push({ code, reason });
  }

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  (async () => {
    try {
      // ---- HEADER META ----
      await writer.write(
        encoder.encode(
          JSON.stringify(
            {
              type: "meta",
              export_time_utc: formatUtcTimestamp(),
              kv_namespace: ENV.FORMSUBMITS
            },
            null,
            2
          ) + "\n\n\n"
        )
      );

      // ---- DATA STREAM ----
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
          if (exportedCount >= MAX_EXPORT) {
            recordError("EXPORT_LIMIT", "Maximum export size reached");
            break;
          }

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
      } while (cursor && exportedCount < MAX_EXPORT);

      // ---- FOOTER META ----
      await writer.write(
        encoder.encode(
          "\n\n" +
            JSON.stringify(
              {
                type: "summary",
                total_entries: exportedCount,
                truncated,
                errors
              },
              null,
              2
            ) +
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
