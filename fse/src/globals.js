// globals.js

(function () {
  "use strict";

  var scripts = document.querySelectorAll("script[src]");
  var selfSrc = "";
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src.indexOf("globals.js") !== -1) {
      selfSrc = scripts[i].src;
      break;
    }
  }
  var base = selfSrc.substring(0, selfSrc.lastIndexOf("/") + 1);

  var FILES = [
    "vendor/sodium.js",
    "config/fields.jsonl",
    "config/fse.config.js",
    "runtime/fse.crypto.js",
    "runtime/fse.payload.js",
    "runtime/fse.validate.js",
    "runtime/fse.form.js",
    "runtime/fse.freeze.js",
  ];

  var FSE_FIELDS = {};

  function parseFieldsJsonl(code) {
    var lines = code.trim().split('\n');
    var fields = {};
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      try {
        var obj = JSON.parse(line);
        var key = Object.keys(obj)[0];
        if (key) {
          fields[key] = obj[key];
        }
      } catch (e) {}
    }
    return fields;
  }

  function loadNext(index) {
    if (index >= FILES.length) {
      try {
        sodium.ready.then(function () {
          try {
            FSEForm.mount();
            logSummary();
          } catch (err) {
            console.error("[fse] Mount failed:", err);
          }
        }).catch(function (err) {
          console.error("[fse] sodium.ready failed:", err);
        });
      } catch (err) {
        console.error("[fse] sodium is not available:", err);
      }
      return;
    }

    var url = base + FILES[index];

    fetch(url)
      .then(function (res) {
        if (!res.ok) {
          console.error("[fse] HTTP " + res.status + " loading " + url + ". Aborting.");
          return null;
        }
        return res.text();
      })
      .then(function (code) {
        if (code === null || code === undefined) return;

        if (FILES[index] === "config/fields.jsonl") {
          FSE_FIELDS = parseFieldsJsonl(code);
          loadNext(index + 1);
        } else {
          var s = document.createElement("script");
          if (FILES[index] === "config/fse.config.js") {
            code = "var FSE_FIELDS = " + JSON.stringify(FSE_FIELDS) + ";\n" + code;
          }
          s.textContent = code;
          document.head.appendChild(s);
          loadNext(index + 1);
        }
      })
      .catch(function (err) {
        console.error("[fse] Failed to load " + url + ":", err);
      });
  }

  function logSummary() {
    var internal = window.__fse_internal__;
    var cfg = internal ? internal.FSE : window.FSE;
    if (!cfg) {
      console.log("[fse] Initialized but config not found");
      return;
    }
    var fields = cfg.fields || {};
    var fieldCount = Object.keys(fields).length;
    var endpoint = cfg.endpoint || "(not set)";
    var form = cfg.form || "(not set)";
    var status = "OK";
    if (!window.isSecureContext) {
      var loc = window.location;
      if (!(loc.hostname === "localhost" || loc.hostname === "127.0.0.1")) {
        status = "WARNING: HTTP (secure context required)";
      }
    }
    console.log(
      "[fse] Initialized | endpoint: " + endpoint + " | fields: " + fieldCount + " | form: " + form + " | " + status
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { loadNext(0); });
  } else {
    loadNext(0);
  }

})();