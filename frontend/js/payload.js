// payload.js

export function buildContactPayload(form, version) {
  const data = {
    fullname: form.fullname.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
    client_tz:
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    client_time:
      new Date().toISOString()
  };

  if (!data.fullname || !data.email || !data.message) {
    throw new Error("All fields must be filled.");
  }

  if (data.message.length > 1000) {
    throw new Error("Message too long.");
  }

  return {
    _fs: {
      origin: "contact-form",
      version
    },
    data
  };
}
