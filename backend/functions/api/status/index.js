// /functions/api/status/index.js

import { ENV } from "../../_shared/env.js";

export async function onRequestGet({ env }) {
  return new Response(
    JSON.stringify({
      POW_SECRET: !!env[ENV.POW_SECRET],
      RATELIMIT: !!env[ENV.RATELIMIT],
      WRITE_SECRET: !!env[ENV.WRITE_SECRET],
      FORMSUBMITS: !!env[ENV.FORMSUBMITS]
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
