// /functions/api/status/index.js

import { ENV } from "../../_shared/env.js";

export async function onRequestGet({ env }) {
  return new Response(
    JSON.stringify({
      // existing
      POW_SECRET: !!env[ENV.POW_SECRET],
      RATELIMIT: !!env[ENV.RATELIMIT],
      WRITE_SECRET: !!env[ENV.WRITE_SECRET],
      FORMSUBMITS: !!env[ENV.FORMSUBMITS],

      // export system
      EXPORT_TOKENS: !!env[ENV.EXPORT_TOKENS],
      ADMIN_AUTOMATION_SECRET: !!env[ENV.ADMIN_AUTOMATION_SECRET]
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      }
    }
  );
}
