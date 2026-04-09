// globals.js
// Single entry point. Drop this one script tag in your HTML.
//
// Usage:
//   <script src="formseal-embed/globals.js"></script>

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
          console.error("[fse] " + res.status + " loading " + url + ". Aborting.");
          return null;
        }
        return res.text();
      })
      .then(function (code) {
        if (code === null || code === undefined) return;
        
        if (FILES[index] === "config/fields.jsonl") {
          FSE_FIELDS = parseFieldsJsonl(code);
        } else {
          var s = document.createElement("script");
          if (FILES[index] === "config/fse.config.js") {
            code = "var FSE_FIELDS = " + JSON.stringify(FSE_FIELDS) + ";\n" + code;
          }
          s.textContent = code;
          document.head.appendChild(s);
        }
        loadNext(index + 1);
      })
      .catch(function (err) {
        console.error("[fse] Failed to load " + url + ":", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { loadNext(0); });
  } else {
    loadNext(0);
  }

})();