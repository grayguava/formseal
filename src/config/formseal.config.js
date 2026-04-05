// formseal.config.js

var FORMSEAL_CONFIG = {

  version: "fs.v2.1",
  origin:  "contact-form",
  endpoint: "https://fsdumpster.pages.dev/api/ingest",
  recipientPublicKey: "tfx6LEHHB8L6MTCShnj54hXs2N2QhGULdUDnYKXw_n8",
  
  submitStates: {
    idle:    "Send message",
    sending: "Sending...", 
    sent:    "Sent",     
  },

  statusSelector: "#contact-status",


  onSuccess: {
    redirect:    false,
    redirectUrl: "/thank-you",
    message:     "Thanks! Your message has been sent.",
  },

  onError: {
    message: "Something went wrong. Please try again.",
  },

};