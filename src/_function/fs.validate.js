// _function/fs.validate.js

var FormSealValidate = (function () {

  function validate(data) {
    if (typeof FORMSEAL_SCHEMA === "undefined") {
      throw new Error("[formseal/validate] FORMSEAL_SCHEMA is not defined.");
    }

    var errors = [];

    FORMSEAL_SCHEMA.fields.forEach(function (field) {
      if (field.type === "hidden") return;

      var value = (data[field.name] || "").toString().trim();

      if (field.required && value.length === 0) {
        errors.push({
          name:    field.name,
          message: (field.label || field.name) + " is required.",
        });
        return;
      }

      if (field.maxLength && value.length > field.maxLength) {
        errors.push({
          name:    field.name,
          message: (field.label || field.name) +
                   " must be " + field.maxLength + " characters or fewer.",
        });
      }

      if (field.type === "email" && value.length > 0) {
        var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(value)) {
          errors.push({
            name:    field.name,
            message: (field.label || field.name) + " must be a valid email address.",
          });
        }
      }

      if (field.type === "tel" && value.length > 0) {
        var telRe = /^\+?[\d\s\-().]{6,20}$/;
        if (!telRe.test(value)) {
          errors.push({
            name:    field.name,
            message: (field.label || field.name) + " must be a valid phone number.",
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