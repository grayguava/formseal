// fse.log.js
// Centralised logger — reads consoleLogging from FSE config.

var FSE_LOG = (function () {

  function allowLog() {
    var cfg = window.FSE || {};
    return cfg.logging !== false;
  }

  return {
    error: function (msg, fix) {
      console.error("[formseal] Error: " + msg);
      if (fix) console.error("[formseal] Fix: " + fix);
    },
    warn: function (msg, fix) {
      if (!allowLog()) return;
      console.warn("[formseal] Warning: " + msg);
      if (fix) console.warn("[formseal] Fix: " + fix);
    },
    info: function (msg) {
      if (!allowLog()) return;
      console.log("[formseal] " + msg);
    },
  };

})();
