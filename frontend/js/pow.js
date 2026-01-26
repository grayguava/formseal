export async function benchmarkHashSpeed(iterations = 2000) {
  const enc = new TextEncoder();
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    await crypto.subtle.digest(
      "SHA-256",
      enc.encode(`bench-${i}`)
    );
  }

  const elapsed = performance.now() - start;
  return elapsed / iterations; // ms per hash
}



export async function generatePoW(ciphertext, ts, salt, difficulty) {

  const enc = new TextEncoder();
  let iter = 0;
  const start = Date.now();
  
  const MAX_TIME_MS = 3000 + difficulty * 700;



  
  while (true) {
    
    const nonce = crypto.randomUUID();

    const input = enc.encode(
      `${nonce}|${ciphertext}|${ts}|${salt}|${difficulty}`
    );

    const hashBuf = await crypto.subtle.digest("SHA-256", input);
    const hash = new Uint8Array(hashBuf);

   if (hasLeadingZeroBits(hash, difficulty)) {
  return { nonce, ts };
}


    // Yield to avoid freezing UI
    if (++iter % 25 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }

    // Dev failsafe
   if (Date.now() - start > MAX_TIME_MS) {
   throw new Error("PoW timeout");
    }


  }
}

 function hasLeadingZeroBits(bytes, bits) {
  let remaining = bits;

  for (const b of bytes) {
    if (remaining <= 0) return true;

    if (remaining >= 8) {
      if (b !== 0) return false;
      remaining -= 8;
    } else {
      return (b >> (8 - remaining)) === 0;
    }
  }
  return true;
}


