import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const PREVIEW_TTL_SECONDS = 2 * 60 * 60;

function encoded(value) {
  return Buffer.from(value).toString("base64url");
}

function decoded(value) {
  return Buffer.from(value, "base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function requireSecret(secret) {
  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("Administrator session secret is not configured securely");
  }
  return secret;
}

function signPayload(payload, secret) {
  const body = encoded(JSON.stringify(payload));
  const signature = createHmac("sha256", requireSecret(secret))
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

function verifySignedPayload(token, secret, now) {
  if (typeof token !== "string") return null;
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) return null;

  let expected;
  try {
    expected = createHmac("sha256", requireSecret(secret))
      .update(body)
      .digest("base64url");
  } catch {
    return null;
  }
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(decoded(body).toString("utf8"));
    const nowSeconds = Math.floor(now.getTime() / 1000);
    if (!Number.isInteger(payload.exp) || payload.exp <= nowSeconds) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createPasswordHash(password, { salt } = {}) {
  if (typeof password !== "string" || password.length < 12) {
    throw new Error("Administrator password must contain at least 12 characters");
  }
  const passwordSalt = salt ?? randomBytes(16);
  const derived = await scrypt(password, passwordSalt, 64);
  return `scrypt$${Buffer.from(passwordSalt).toString("base64url")}$${Buffer.from(derived).toString("base64url")}`;
}

export async function verifyPassword(password, encodedHash) {
  if (typeof password !== "string" || typeof encodedHash !== "string") {
    return false;
  }
  const [algorithm, saltValue, hashValue, extra] = encodedHash.split("$");
  if (algorithm !== "scrypt" || !saltValue || !hashValue || extra) return false;
  try {
    const expected = decoded(hashValue);
    const actual = await scrypt(password, decoded(saltValue), expected.length);
    return safeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function createAdminSession({
  secret,
  now = new Date(),
  sessionId = randomBytes(24).toString("base64url"),
}) {
  const issuedAt = Math.floor(now.getTime() / 1000);
  return signPayload(
    {
      kind: "admin-session",
      sessionId,
      iat: issuedAt,
      exp: issuedAt + SESSION_TTL_SECONDS,
    },
    secret,
  );
}

export function verifyAdminSession(token, { secret, now = new Date() }) {
  const payload = verifySignedPayload(token, secret, now);
  if (
    payload?.kind !== "admin-session" ||
    typeof payload.sessionId !== "string" ||
    !payload.sessionId
  ) {
    return null;
  }
  return payload;
}

export function createPreviewSelection({
  secret,
  sessionId,
  themeId,
  now = new Date(),
}) {
  const issuedAt = Math.floor(now.getTime() / 1000);
  return signPayload(
    {
      kind: "theme-preview",
      sessionId,
      themeId,
      iat: issuedAt,
      exp: issuedAt + PREVIEW_TTL_SECONDS,
    },
    secret,
  );
}

export function verifyPreviewSelection(
  token,
  { secret, sessionId, now = new Date() },
) {
  const payload = verifySignedPayload(token, secret, now);
  if (
    payload?.kind !== "theme-preview" ||
    payload.sessionId !== sessionId ||
    typeof payload.themeId !== "string" ||
    !payload.themeId
  ) {
    return null;
  }
  return payload;
}
