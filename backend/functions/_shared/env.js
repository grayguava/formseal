// functions/_shared/env.js

export const ENV = {
  // existing
  POW_SECRET: "GUAVA_POW_SECRET", //SECRET VAR
  WRITE_SECRET: "GUAVA_WRITE_SECRET", //SECRET VAR

  RATELIMIT: "GUAVA_RATELIMIT", //KV NAMESPACE
  FORMSUBMITS: "GUAVA_FORMSUBMITS", //KV NAMESPACE

  // export system
  EXPORT_TOKENS: "GUAVA_EXPORT_TOKENS", //KV NAMESPACE
  
  // automation (NEW)
  ADMIN_AUTOMATION_SECRET: "GUAVA_ADMIN_AUTOMATION_SECRET" // >32 bytes random secret (variable)
};
