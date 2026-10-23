import assert from "node:assert/strict";
import test from "node:test";
import {
  createAdminSession,
  createPasswordHash,
  createPreviewSelection,
  verifyAdminSession,
  verifyPassword,
  verifyPreviewSelection,
} from "../../lib/admin/auth.mjs";

const secret = "phase-five-test-secret-with-at-least-thirty-two-characters";
const now = new Date("2026-10-13T08:00:00.000Z");

test("password hashes verify the right password without storing plaintext", async () => {
  const encoded = await createPasswordHash("correct horse battery staple", {
    salt: Buffer.from("0123456789abcdef", "utf8"),
  });

  assert.match(encoded, /^scrypt\$/);
  assert.equal(encoded.includes("correct horse battery staple"), false);
  assert.equal(
    await verifyPassword("correct horse battery staple", encoded),
    true,
  );
  assert.equal(await verifyPassword("wrong password", encoded), false);
});

test("signed administrator sessions reject tampering and expiry", () => {
  const token = createAdminSession({ secret, now, sessionId: "session-one" });

  assert.equal(verifyAdminSession(token, { secret, now })?.sessionId, "session-one");
  assert.equal(verifyAdminSession(`${token}tampered`, { secret, now }), null);
  assert.equal(
    verifyAdminSession(token, {
      secret,
      now: new Date("2026-10-14T09:00:00.000Z"),
    }),
    null,
  );
});

test("preview selections are bound to the authenticated session", () => {
  const token = createPreviewSelection({
    secret,
    now,
    sessionId: "session-one",
    themeId: "coding",
  });

  assert.equal(
    verifyPreviewSelection(token, {
      secret,
      now,
      sessionId: "session-one",
    })?.themeId,
    "coding",
  );
  assert.equal(
    verifyPreviewSelection(token, {
      secret,
      now,
      sessionId: "another-session",
    }),
    null,
  );
});
