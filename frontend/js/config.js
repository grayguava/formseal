// config.js

export const FORMSEAL_CONFIG = {
  /* =========================
     Frontend / shared config
     ========================= */

 // Change only if you fork the payload format
payloadVersion: "fs.v2.1",

// Paste your x25519 pulic key instead of the null placeholder
  x25519PublicKey:
    "null",

  // FRONTEND MUST ONLY TALK TO VERIFY
  submitUrl: "/api/verify",

  // PoW policy bounds (client-side sanity only)
  powMinDifficulty: 12,
  powMaxDifficulty: 18,
  powWindowSec: 60,

  // Optional UX tuning
  powTimeoutBaseMs: 3000,
  powTimeoutPerDifficultyMs: 700
};

