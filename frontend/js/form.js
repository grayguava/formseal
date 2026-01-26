// form.js

import { FORMSEAL_CONFIG } from "./config.js";
import { generatePoW, benchmarkHashSpeed } from "./pow.js";
import { sealJSONToPublicKey } from "./crypto.js";
import { buildContactPayload } from "./payload.js";

let cachedBenchMs = null;
let cachedChallenge = null;
let challengeFetchedAt = 0;

const CHALLENGE_MAX_AGE_MS = 30000;


async function refreshChallengeIfStale() {
  if (cachedBenchMs == null) return false;
  if (!cachedChallenge) return false;

  const age = Date.now() - challengeFetchedAt;
  if (age <= CHALLENGE_MAX_AGE_MS) return true;

  try {
    const r = await fetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bench_ms: cachedBenchMs })
    });

    if (!r.ok) throw new Error("refresh failed");

    cachedChallenge = await r.json();
    challengeFetchedAt = Date.now();
    return true;

  } catch (err) {
    console.error("Challenge refresh failed:", err);
    return false;
  }
}


document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("secureForm");
  const btn  = document.getElementById("secureSubmit");
  const loader = document.getElementById("fullLoader");
  

  if (!form || !btn) {
    console.error("Secure form elements not found");
    return;
  }
  

  function showLoader() {
    if (loader) loader.classList.remove("hidden");
  }

  function hideLoader() {
    if (loader) loader.classList.add("hidden");
  }

  // -------------------------------
  // PRE-BENCHMARK + CHALLENGE FETCH
  // -------------------------------
  (async () => {
    try {
      const runs = [];
      for (let i = 0; i < 5; i++) {
        runs.push(await benchmarkHashSpeed());
      }

      runs.sort((a, b) => a - b);
      cachedBenchMs = runs[Math.floor(runs.length / 2)];
      const benchMs = cachedBenchMs;

      
      const r = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bench_ms: benchMs })
      });

      if (!r.ok) throw new Error("challenge fetch failed");

      cachedChallenge = await r.json();
      challengeFetchedAt = Date.now();

    } catch (err) {
      console.error("Pre-challenge failed:", err);
    }
  })();

  btn.addEventListener("click", e => e.stopPropagation());

  // -------------------------------
  // SUBMIT HANDLER
  // -------------------------------
  form.addEventListener("submit", async e => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!form.reportValidity()) {
     return;
    }

    btn.disabled = true;
    showLoader();

    const reenable = () => { btn.disabled = false; };

    // honeypot
    if (form.website.value) {
      reenable();
      return;
    }

    const ready = await refreshChallengeIfStale();
    if (!ready) {
      hideLoader();
     alert("System not ready yet. Please try again.");
     reenable();
      return;
      }

    const challenge = cachedChallenge;


    let payload;
    try {
      payload = buildContactPayload(
        form,
        FORMSEAL_CONFIG.payloadVersion
      );
    } catch (err) {
      alert(err.message);
      reenable();
      return;
    }

    let cipherB64;
    try {
      cipherB64 = await sealJSONToPublicKey(
        payload,
        FORMSEAL_CONFIG.x25519PublicKey
      );
    } catch {
      hideLoader();
      alert("Encryption failed.");
      reenable();
      return;
    }

    let pow;
    try {
      pow = await generatePoW(
        cipherB64,
        challenge.ts,
        challenge.salt,
        challenge.difficulty
      );
    } catch (err) {
      hideLoader();
      console.error("PoW error:", err);
      alert("Proof-of-work failed.");
      reenable();
      return;
    }

    let res;
    try {
      res = await fetch(FORMSEAL_CONFIG.submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({
          ciphertext: cipherB64,
          nonce: pow.nonce,
          ts: pow.ts,
          salt: challenge.salt,
          difficulty: challenge.difficulty
        })
      });
    } catch {
      hideLoader();
      alert("Network error.");
      reenable();
      return;
    }

    if (!res.ok) {
      hideLoader();
      alert("Failed to send message.");
      reenable();
      return;
    }
    
    sessionStorage.setItem("form_submitted", "yes");
      window.location.href = "/thank-you/";

  });
});
