import "server-only";

import { cookies } from "next/headers";
import {
  createAdminSession,
  verifyAdminSession,
  verifyPreviewSelection,
} from "./auth.mjs";
export { requestHasSameOrigin, sameOriginUrl } from "./request-security.mjs";

export const ADMIN_SESSION_COOKIE = "portfolio_admin_session";
export const THEME_PREVIEW_COOKIE = "portfolio_theme_preview";

export function getAdminConfiguration(env = process.env) {
  const passwordHash = env.PORTFOLIO_ADMIN_PASSWORD_HASH;
  const sessionSecret = env.PORTFOLIO_ADMIN_SESSION_SECRET;
  return {
    configured:
      typeof passwordHash === "string" &&
      passwordHash.startsWith("scrypt$") &&
      typeof sessionSecret === "string" &&
      sessionSecret.length >= 32,
    passwordHash,
    sessionSecret,
  };
}

export function adminCookieOptions(env = process.env) {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/",
  };
}

export async function getAdminRequestState({ env = process.env } = {}) {
  const configuration = getAdminConfiguration(env);
  if (!configuration.configured) {
    return { configured: false, session: null, preview: null };
  }

  const cookieStore = await cookies();
  const session = verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value, {
    secret: configuration.sessionSecret,
  });
  if (!session) {
    return { configured: true, session: null, preview: null };
  }

  const preview = verifyPreviewSelection(
    cookieStore.get(THEME_PREVIEW_COOKIE)?.value,
    {
      secret: configuration.sessionSecret,
      sessionId: session.sessionId,
    },
  );
  return { configured: true, session, preview };
}

export function issueAdminSession(configuration) {
  return createAdminSession({ secret: configuration.sessionSecret });
}

