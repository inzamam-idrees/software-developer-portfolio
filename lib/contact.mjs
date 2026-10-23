const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateContact(value) {
  const errors = {},
    data = {};
  for (const [field, max] of [
    ["name", 100],
    ["email", 100],
    ["message", 500],
  ]) {
    const input =
      value && !Array.isArray(value) && typeof value[field] === "string"
        ? value[field]
        : "";
    data[field] = input.trim();
    if (!data[field])
      errors[field] =
        field === "name"
          ? "Please enter your name."
          : field === "email"
            ? "Please enter your email address."
            : "Please enter a message.";
    else if (input.length > max)
      errors[field] = `Please use ${max} characters or fewer.`;
    else if (field !== "message" && /[\r\n]/.test(input))
      errors[field] = "Please use a single line.";
  }
  if (data.email && !emailPattern.test(data.email))
    errors.email = "Please enter a valid email address.";
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, data };
}
export function escapeHtml(value) {
  const escaped = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (char) => escaped[char]);
}
export function buildMail(data, sender) {
  return {
    from: sender,
    to: sender,
    replyTo: data.email,
    subject: `Portfolio inquiry from ${data.name}`,
    text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
    html: `<h2>Portfolio inquiry</h2><p>${escapeHtml(data.name)} (${escapeHtml(data.email)})</p><p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>`,
  };
}
export async function handleContact(request, { sendMail, sender }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Invalid request." },
      { status: 400 },
    );
  }
  const result = validateContact(payload);
  if (!result.ok)
    return Response.json(
      { success: false, errors: result.errors },
      { status: 400 },
    );
  if (!sender || !sendMail)
    return Response.json(
      { success: false, message: "Please email me directly." },
      { status: 503 },
    );
  try {
    await sendMail(buildMail(result.data, sender));
    return Response.json({ success: true, message: "Message sent." });
  } catch {
    return Response.json(
      { success: false, message: "Could not send your message." },
      { status: 502 },
    );
  }
}
