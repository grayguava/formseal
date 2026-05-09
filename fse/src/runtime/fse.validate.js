// fse.validate.js
// Validates a data object against FSE.fields validation rules.

var FSEValidate = (function () {

  function validate(data) {
    var internal = window.__fse_internal__;
    var FSE = internal ? internal.FSE : window.FSE;
    if (!FSE) {
      throw new Error("[fse/validate] FSE is not defined.");
    }

    var fields = FSE.fields || {};
    var errors = [];

    Object.keys(fields).forEach(function (name) {
      var field = fields[name];
      var value = (data[name] || "").toString().trim();

      if (field.required && value.length === 0) {
        errors.push({
          name:    name,
          message: name + " is required.",
        });
        return;
      }

      if (field.maxLength && value.length > field.maxLength) {
        console.warn(
          "[fse/validate] Field '" + name + "' exceeds maxLength (" +
          value.length + " > " + field.maxLength + "). Submission blocked."
        );
        errors.push({
          name:    name,
          message: name + " must be " + field.maxLength + " characters or fewer.",
        });
      }

      if (field.type === "email" && value.length > 0) {
        var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(value)) {
          errors.push({
            name:    name,
            message: name + " must be a valid email address.",
          });
        }
      }

      if (field.type === "tel" && value.length > 0) {
        var telRe = /^\+?[\d\s\-().]{6,20}$/;
        if (!telRe.test(value)) {
          errors.push({
            name:    name,
            message: name + " must be a valid phone number.",
          });
        }
      }
    });

    return {
      valid:  errors.length === 0,
      errors: errors,
    };
  }

  return {
    validate,
  };

})();
