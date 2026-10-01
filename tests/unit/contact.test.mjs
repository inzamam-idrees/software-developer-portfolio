import test from "node:test";
import assert from "node:assert/strict";
import {
  validateContact,
  escapeHtml,
  buildMail,
  handleContact,
} from "../../lib/contact.mjs";
const valid = {
  name: "Test User",
  email: "test@example.com",
  message: "A project inquiry.",
};
const req = (value) =>
  new Request("http://localhost/api/contact", {
    method: "POST",
    body: JSON.stringify(value),
  });
test("rejects malformed contact inputs", () => {
  for (const value of [
    null,
    [],
    {},
    { ...valid, name: " " },
    { ...valid, name: 42 },
    { ...valid, name: "x".repeat(101) },
    { ...valid, email: "bad" },
    { ...valid, email: "a\r\nb@example.com" },
    { ...valid, message: "x".repeat(501) },
    { ...valid, message: "" },
  ])
    assert.equal(validateContact(value).ok, false);
  assert.equal(validateContact(valid).ok, true);
});
test("escapes markup and owns email headers", () => {
  assert.equal(escapeHtml("<script>\"&'"), "&lt;script&gt;&quot;&amp;&#39;");
  const mail = buildMail(
    { ...valid, message: "<script>unsafe</script>" },
    "owner@example.com",
  );
  assert.equal(mail.from, "owner@example.com");
  assert.equal(mail.to, "owner@example.com");
  assert.equal(mail.replyTo, valid.email);
  assert.ok(!mail.html.includes("<script>"));
});
test("invalid payloads never deliver", async () => {
  let calls = 0;
  const deps = {
    sender: "owner@example.com",
    sendMail: async () => {
      calls++;
    },
  };
  assert.equal((await handleContact(req({}), deps)).status, 400);
  assert.equal(
    (
      await handleContact(
        new Request("http://localhost", { method: "POST", body: "{" }),
        deps,
      )
    ).status,
    400,
  );
  assert.equal(calls, 0);
});
test("delivery returns truthful status codes", async () => {
  assert.equal(
    (await handleContact(req(valid), { sender: "", sendMail: async () => {} }))
      .status,
    503,
  );
  assert.equal(
    (
      await handleContact(req(valid), {
        sender: "owner@example.com",
        sendMail: async () => {
          throw Error("transport down");
        },
      })
    ).status,
    502,
  );
  assert.equal(
    (
      await handleContact(req(valid), {
        sender: "owner@example.com",
        sendMail: async () => {},
      })
    ).status,
    200,
  );
});

test("patched mail transport serializes only the configured recipient without network delivery", async () => {
  const { default: nodemailer } = await import("nodemailer");
  const transport = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
  });
  const mail = buildMail(
    {
      name: "Test Visitor",
      email: "visitor@example.com",
      message: "A safe inquiry.",
    },
    "owner@example.com",
  );
  const info = await transport.sendMail(mail);
  assert.equal(info.envelope.from, "owner@example.com");
  assert.deepEqual(info.envelope.to, ["owner@example.com"]);
  assert.match(info.message.toString(), /Reply-To: visitor@example.com/);
  transport.close();
});
