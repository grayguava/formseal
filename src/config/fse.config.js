// fse.config.js
// Unified configuration for formseal-embed.
//
// Edit this file or use the CLI:
//   fse configure endpoint <url>
//   fse configure publicKey <base64url>
//   fse configure field add <name> [options]
//   fse configure field remove <name>
//   fse configure field required <name> <true|false>
//   fse configure field maxLength <name> <number>

var FSE = {

  // -- Endpoint --
  // POST target. Receives raw ciphertext.
  endpoint: "https://your-api.example.com/submit",

  // -- Origin --
  // Identifier for this form deployment.
  origin: "contact-form",

  // -- Encryption --
  // Recipient x25519 public key in base64url (32 bytes)
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

  // -- Success behaviour --
  onSuccess: {
    redirect:    false,
    redirectUrl: "/thank-you",
    message:     "Thanks! Your message has been sent.",
  },

  // -- Error behaviour --
  onError: {
    message: "Something went wrong. Please try again.",
  },

  // -- Fields --
  // Loaded from fields.jsonl at runtime
  fields: FSE_FIELDS,

};
