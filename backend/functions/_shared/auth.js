// functions/_shared/auth.js

import { ENV } from "./env.js";

/**
 * Authentication is ADMIN / AUTOMATION ONLY.
 * Any request reaching this code without a valid
 * automation bearer token is rejected.
 */

function verifyAutomation(request, env) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false };
  }

  const token = authHeader.slice(7);

  if (!env[ENV.ADMIN_AUTOMATION_SECRET]) {
    // Misconfiguration: fail closed
    return { ok: false };
  }

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

export async function authenticate({ request, env }) {
  const res = verifyAutomation(request, env);

  if (!res.ok) {
    return {
      ok: false,
      response: new Response("Unauthorized", { status: 403 })
    };
  }

  return res;
}
