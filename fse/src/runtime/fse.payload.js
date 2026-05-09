// fse.payload.js
// Assembles the payload envelope { version, id, submitted_at, data }.

var FSEPayload = (function () {

  function build(data) {
    var internal = window.__fse_internal__;
    var FSE = internal ? internal.FSE : window.FSE;
    if (!FSE) {
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
