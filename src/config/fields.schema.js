// fields.schema.js

var FORMSEAL_SCHEMA = {

  formSelector: "#contact-form",
  submitSelector: "#contact-submit",
  statusSelector: "#contact-status",

  fields: [
    {
      name:      "name",
      required:  true,
      maxLength: 100,
    },
    {
      name:      "email",
      type:      "email",
      required:  true,
      maxLength: 200,
    },
    {
      name:      "message",
      required:  true,
      maxLength: 1000,
    },
  ],

};