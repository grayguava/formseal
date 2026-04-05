// _function/fs.form.js

var FormSealForm = (function () {

  function requireGlobal(name) {
    if (typeof window[name] === "undefined") {
      throw new Error("[formseal/form] " + name + " is not defined.");
    }
    return window[name];
  }

  function collectData(formEl, schema) {
    var data = {};
    schema.fields.forEach(function (field) {
      var input = formEl.querySelector("[name='" + field.name + "']");
      if (!input) return;
      data[field.name] = input.value.trim();
    });
    return data;
  }

  function clearFieldErrors(schema) {
    schema.fields.forEach(function (field) {
      var el = document.querySelector("[data-fs-error='" + field.name + "']");
      if (el) el.textContent = "";
      var input = document.querySelector("[name='" + field.name + "']");
      if (input) input.removeAttribute("aria-invalid");
    });
  }

  function showFieldErrors(errors) {
    var focused = false;
    errors.forEach(function (err) {
      var el    = document.querySelector("[data-fs-error='" + err.name + "']");
      var input = document.querySelector("[name='" + err.name + "']");
      if (el) el.textContent = err.message;
      if (input) {
        input.setAttribute("aria-invalid", "true");
        if (!focused) { input.focus(); focused = true; }
      }
    });
  }

  function setStatus(cfg, message, isError, responseData) {
    if (cfg.statusSelector) {
      var el = document.querySelector(cfg.statusSelector);
      if (el) {
        el.textContent = message;
        el.setAttribute("data-fs-status", isError ? "error" : "success");
      }
    }
    var cb = window.formsealCallbacks;
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
    if (cfg.statusSelector) {
      var el = document.querySelector(cfg.statusSelector);
      if (el) {
        el.textContent = "";
        el.removeAttribute("data-fs-status");
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
    var cfg    = requireGlobal("FORMSEAL_CONFIG");
    var schema = requireGlobal("FORMSEAL_SCHEMA");

    var formEl = document.querySelector(schema.formSelector);
    if (!formEl) {
      console.error("[formseal/form] Form not found: " + schema.formSelector);
      return;
    }

    var submitBtn = document.querySelector(schema.submitSelector);
    if (!submitBtn) {
      console.error("[formseal/form] Submit button not found: " + schema.submitSelector);
      return;
    }

    setButtonState(submitBtn, "idle", cfg);


    formEl.addEventListener("submit", async function (e) {
      e.preventDefault();

      var hp = formEl.querySelector("[name='_hp']");
      if (hp && hp.value) return;

      clearFieldErrors(schema);
      clearStatus(cfg);

      var data = collectData(formEl, schema);
      var result = FormSealValidate.validate(data);
      if (!result.valid) {
        showFieldErrors(result.errors);
        return;
      }

      setButtonState(submitBtn, "sending", cfg);

      try {
        var payload = FormSealPayload.build(data);
        var ciphertext = await FormSealCrypto.sealJSON(
          payload,
          cfg.recipientPublicKey
        );

        var res = await fetch(cfg.endpoint, {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "omit",
          body:        JSON.stringify({ ciphertext: ciphertext }),
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
        console.error("[formseal/form] Submit error:", err);
        setButtonState(submitBtn, "idle", cfg);
        setStatus(cfg, cfg.onError.message, true, null);
      }
    });
  }

  return {
    mount,
  };

})();