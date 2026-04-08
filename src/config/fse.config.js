// fse.config.js
// Unified configuration for formseal-embed.
//
// Edit this file or use the CLI:
//   fse configure endpoint <url>
//   fse configure key <base64url>
//   fse configure field add <name> [options]
//   fse configure field remove <name>
//   fse configure field required <name> <true|false>
//   fse configure field maxLength <name> <number>

var FSE = {

  // -- Endpoint --
  // POST target. Receives: { ciphertext: "<base64url>" }
  endpoint: "https://your-api.example.com/submit",

  // -- Origin --
  // Identifier for this form deployment. Useful when you have multiple forms.
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
  // Key = field name (matches [name] attribute in HTML)
  // Value = validation rules
  fields: {
    name: {
      required:  true,
      maxLength: 100,
    },
    email: {
      type:      "email",
      required:  true,
      maxLength: 200,
    },
    message: {
      required:  true,
      maxLength: 1000,
    },
  },

};
