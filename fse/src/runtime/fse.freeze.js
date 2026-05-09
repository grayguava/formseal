// fse.freeze.js
// Bootstrap freeze layer - must be last runtime file loaded

(function () {
  "use strict";

  function deepFreeze(obj) {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(function (prop) {
      var value = obj[prop];
      if (
        value &&
        (typeof value === "object" || typeof value === "function") &&
        !Object.isFrozen(value)
      ) {
        deepFreeze(value);
      }
    });
    return obj;
  }

  function cloneDeep(obj) {
    if (typeof structuredClone === "function") {
      return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
  }

  var internal = {
    FSE: cloneDeep(window.FSE),
  };

  deepFreeze(internal);

  try {
    Object.defineProperty(window, "__fse_internal__", {
      value: internal,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  } catch (e) {}

  try {
    Object.freeze(FSECrypto);
    Object.freeze(FSEPayload);
    Object.freeze(FSEValidate);
    Object.freeze(FSEForm);
  } catch (e) {}

  try {
    if (!window.hasOwnProperty("FSECrypto") || Object.getOwnPropertyDescriptor(window, "FSECrypto").configurable) {
      Object.defineProperty(window, "FSECrypto", {
        value: FSECrypto,
        writable: false,
        configurable: false,
        enumerable: false,
      });
    }
  } catch (e) {}

  try {
    if (!window.hasOwnProperty("FSEPayload") || Object.getOwnPropertyDescriptor(window, "FSEPayload").configurable) {
      Object.defineProperty(window, "FSEPayload", {
        value: FSEPayload,
        writable: false,
        configurable: false,
        enumerable: false,
      });
    }
  } catch (e) {}

  try {
    if (!window.hasOwnProperty("FSEValidate") || Object.getOwnPropertyDescriptor(window, "FSEValidate").configurable) {
      Object.defineProperty(window, "FSEValidate", {
        value: FSEValidate,
        writable: false,
        configurable: false,
        enumerable: false,
      });
    }
  } catch (e) {}

  try {
    if (!window.hasOwnProperty("FSEForm") || Object.getOwnPropertyDescriptor(window, "FSEForm").configurable) {
      Object.defineProperty(window, "FSEForm", {
        value: FSEForm,
        writable: false,
        configurable: false,
        enumerable: false,
      });
    }
  } catch (e) {}

})();