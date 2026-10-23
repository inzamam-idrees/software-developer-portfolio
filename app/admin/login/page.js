import { getAdminRequestState } from "@/lib/admin/server.mjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "../icons";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }) {
  const admin = await getAdminRequestState();
  if (admin.session) redirect("/admin/theme");
  const query = await searchParams;
  const failed = query?.error === "credentials";

  return (
    <main className="admin-login" id="main-content">
      <div className="admin-login-card">
        <p className="admin-brand admin-login-brand">
          <Icon name="mark" className="admin-brand-mark" />
          <span>Portfolio admin</span>
        </p>
        <h1>Sign in</h1>
        <p className="admin-login-lede">
          Preview and publish themes, and edit the portfolio&rsquo;s content. Previews stay
          private to this session.
        </p>
        {!admin.configured && (
          <p className="admin-callout" data-tone="warning" role="status">
            <Icon name="lock" />
            <span>Administrator access is not configured on this deployment.</span>
          </p>
        )}
        {failed && (
          <p className="admin-callout" data-tone="error" role="alert" id="admin-login-error">
            <Icon name="alert" />
            <span>Unable to sign in with those credentials.</span>
          </p>
        )}
        <form className="admin-login-form" action="/admin/session" method="post">
          <label className="admin-label" htmlFor="admin-password">
            Administrator password
          </label>
          <input
            className="admin-input"
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={12}
            required
            autoFocus={admin.configured}
            aria-invalid={failed ? "true" : undefined}
            aria-describedby={failed ? "admin-login-error" : undefined}
            disabled={!admin.configured}
          />
          <button className="admin-button" data-variant="primary" type="submit" disabled={!admin.configured}>
            Sign in
            <Icon name="arrowRight" />
          </button>
        </form>
      </div>
      <Link className="admin-login-back" href="/">
        Return to the public portfolio
      </Link>
    </main>
  );
}
