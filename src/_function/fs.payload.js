// _function/fs.payload.js

var FormSealPayload = (function () {

  function build(data) {
    if (typeof FORMSEAL_CONFIG === "undefined") {
      throw new Error("[formseal/payload] FORMSEAL_CONFIG is not defined.");
    }

    return {
      _fs: {
        version:      FORMSEAL_CONFIG.version  || "fs.v2.1",
        origin:       FORMSEAL_CONFIG.origin   || "contact-form",
        id:           crypto.randomUUID(),
        submitted_at: new Date().toISOString(),
        client_tz:    Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      data: data,
    };
  }

  return {
    build,
  };

})();