// fse.config.js

var FSE = {

  endpoint: "YOUR_POST_API_LINK_HERE",
  origin: "contact-form",
  publicKey: "PASTE_YOUR_BASE64URL_PUBLIC_KEY_HERE",

  // -- Form selectors --
  form:   "#contact-form",
  submit: "#contact-submit",
  status: "#contact-status",

  // -- Submit button states --
  submitStates: {
    idle:    "Send message",
    sending: "Sending...",
    sent:    "Sent",
  },

  // -- Success behavior --
  onSuccess: {
    redirect:    false,
    redirectUrl: "/thank-you",
    message:     "Thanks! Your message has been sent.",
  },

  // -- Error behavior --
  onError: {
    message: "Something went wrong. Please try again.",
  },

  // -- Fields --
  // Loaded from fields.jsonl at runtime
  fields: FSE_FIELDS,

};
