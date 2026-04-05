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
    "config/fields.schema.js",
    "config/formseal.config.js",
    "_function/fs.crypto.js",
    "_function/fs.payload.js",
    "_function/fs.validate.js",
    "_function/fs.form.js",
  ];

  function loadNext(index) {
    if (index >= FILES.length) {
      try {
        sodium.ready.then(function () {
          try {
            FormSealForm.mount();
          } catch (err) {
            console.error("[formseal] Mount failed:", err);
          }
        }).catch(function (err) {
          console.error("[formseal] sodium.ready failed:", err);
        });
      } catch (err) {
        console.error("[formseal] sodium is not available:", err);
      }
      return;
    }

    var url = base + FILES[index];

    fetch(url)
      .then(function (res) {
        if (!res.ok) {
          console.error("[formseal] " + res.status + " loading " + url + ". Aborting.");
          return null;
        }
        return res.text();
      })
      .then(function (code) {
        if (code === null || code === undefined) return;
        var s = document.createElement("script");
        s.textContent = code;
        document.head.appendChild(s);
        loadNext(index + 1);
      })
      .catch(function (err) {
        console.error("[formseal] Failed to load " + url + ":", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { loadNext(0); });
  } else {
    loadNext(0);
  }

})();