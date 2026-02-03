// functions/_shared/auth.js

import { ENV } from "./env.js";

/**
 * AuthContext shape:
 * {
 *   adminId: string,
 *   mode: "browser" | "automation"
 * }
 */

/**
 * Detect whether this request is automation or browser.
 * Detection is EXPLICIT, never heuristic.
 */
function detectMode(request) {
  const authHeader = request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return "automation";
  }

  return "browser";
}

/**
 * Verify automation auth (explicit secret).
 */
function verifyAutomation(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false };
  }

  const token = authHeader.slice(7);

  if (token !== env[ENV.ADMIN_AUTOMATION_SECRET]) {
    return { ok: false };
  }

  return {
    ok: true,
    auth: {
      adminId: "primary-admin",
      mode: "automation"
    }
  };
}

/**
 * Browser auth placeholder.
 * Actual verification remains in the endpoint for now.
 * This keeps STEP 2 non-breaking.
 */
function browserAuthPlaceholder() {
  return {
    ok: true,
    auth: {
      adminId: "primary-admin",
      mode: "browser"
    }
  };
}

/**
 * Main entrypoint.
 * For now:
 * - automation is fully verified
 * - browser is accepted but NOT yet validated here
 */
export async function authenticate({ request, env }) {
  const mode = detectMode(request);

  if (mode === "automation") {
    const res = verifyAutomation(request, env);
    if (!res.ok) {
      return {
        ok: false,
        response: new Response("Unauthorized", { status: 403 })
      };
    }
    return res;
  }

  // Browser auth stays in endpoint (for now)
  return browserAuthPlaceholder();
}
