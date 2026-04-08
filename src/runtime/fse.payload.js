// fse.payload.js
// Assembles the payload envelope { version, id, submitted_at, data }.
// No DOM access. No crypto. Depends on: FSE (global).

var FSEPayload = (function () {

  function build(data) {
    if (typeof FSE === "undefined") {
      throw new Error("[fse/payload] FSE is not defined.");
    }

    return {
      version:      "fse.v1.0",
      origin:       FSE.origin || "contact-form",
      id:           crypto.randomUUID(),
      submitted_at: new Date().toISOString(),
      data:         data,
    };
  }

  return {
    build,
  };

})();
