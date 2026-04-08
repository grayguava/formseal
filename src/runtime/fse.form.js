// fse.form.js
// Submit pipeline controller. Touches the DOM only for:
//   - reading field values (by name attribute)
//   - managing submit button state
//   - writing validation errors to [data-fse-error="fieldname"] elements
//   - writing status messages to the statusSelector element
//
// The dev owns all form markup. Formseal-embed owns none of it.
//
// Depends on: FSE, FSECrypto, FSEPayload, FSEValidate (all globals).

var FSEForm = (function () {

  function requireGlobal(name) {
    if (typeof window[name] === "undefined") {
      throw new Error("[fse/form] " + name + " is not defined.");
    }
    return window[name];
  }

  function collectData(formEl, fields) {
    var data = {};
    Object.keys(fields).forEach(function (name) {
      var input = formEl.querySelector("[name='" + name + "']");
      if (!input) return;
      data[name] = input.value.trim();
    });
    return data;
  }

  function clearFieldErrors(fields) {
    Object.keys(fields).forEach(function (name) {
      var el = document.querySelector("[data-fse-error='" + name + "']");
      if (el) el.textContent = "";
      var input = document.querySelector("[name='" + name + "']");
      if (input) input.removeAttribute("aria-invalid");
    });
  }

  function showFieldErrors(errors) {
    var focused = false;
    errors.forEach(function (err) {
      var el    = document.querySelector("[data-fse-error='" + err.name + "']");
      var input = document.querySelector("[name='" + err.name + "']");
      if (el) el.textContent = err.message;
      if (input) {
        input.setAttribute("aria-invalid", "true");
        if (!focused) { input.focus(); focused = true; }
      }
    });
  }

  function setStatus(cfg, message, isError, responseData) {
    if (cfg.status) {
      var el = document.querySelector(cfg.status);
      if (el) {
        el.textContent = message;
        el.setAttribute("data-fse-status", isError ? "error" : "success");
      }
    }

    var cb = window.fseCallbacks;
    if (cb) {
      if (!isError && typeof cb.onSuccess === "function") {
        cb.onSuccess(responseData);
      }
      if (isError && typeof cb.onError === "function") {
        cb.onError(new Error(message));
      }
    }
  }

  function clearStatus(cfg) {
    if (cfg.status) {
      var el = document.querySelector(cfg.status);
      if (el) {
        el.textContent = "";
        el.removeAttribute("data-fse-status");
      }
    }
  }

  function setButtonState(btn, state, cfg) {
    var states = cfg.submitStates || {};
    switch (state) {
      case "sending":
        btn.disabled    = true;
        btn.textContent = states.sending || "Sending...";
        break;
      case "sent":
        btn.disabled    = true;
        btn.textContent = states.sent || "Sent";
        break;
      case "idle":
      default:
        btn.disabled    = false;
        btn.textContent = states.idle || "Send";
        break;
    }
  }

  function mount() {
    var cfg    = requireGlobal("FSE");
    var fields = cfg.fields || {};

    var formEl = document.querySelector(cfg.form);
    if (!formEl) {
      console.error("[fse/form] Form not found: " + cfg.form);
      return;
    }

    var submitBtn = document.querySelector(cfg.submit);
    if (!submitBtn) {
      console.error("[fse/form] Submit button not found: " + cfg.submit);
      return;
    }

    setButtonState(submitBtn, "idle", cfg);

    formEl.addEventListener("submit", async function (e) {
      e.preventDefault();

      var hp = formEl.querySelector("[name='_hp']");
      if (hp && hp.value) return;

      clearFieldErrors(fields);
      clearStatus(cfg);

      var data = collectData(formEl, fields);

      var result = FSEValidate.validate(data);
      if (!result.valid) {
        showFieldErrors(result.errors);
        return;
      }

      setButtonState(submitBtn, "sending", cfg);

      try {
        var payload = FSEPayload.build(data);

        var ciphertext = await FSECrypto.sealJSON(
          payload,
          cfg.publicKey
        );

        var res = await fetch(cfg.endpoint, {
          method:      "POST",
          headers:    { "Content-Type": "text/plain" },
          credentials: "omit",
          body:       ciphertext,
        });

        if (!res.ok) {
          throw new Error("Server responded with " + res.status);
        }

        var responseData = await res.json().catch(function () { return {}; });

        setButtonState(submitBtn, "sent", cfg);
        formEl.reset();

        if (cfg.onSuccess.redirect) {
          window.location.href = cfg.onSuccess.redirectUrl;
        } else {
          setStatus(cfg, cfg.onSuccess.message, false, responseData);
        }

      } catch (err) {
        console.error("[fse/form] Submit error:", err);
        setButtonState(submitBtn, "idle", cfg);
        setStatus(cfg, cfg.onError.message, true, null);
      }
    });
  }

  return {
    mount,
  };

})();
