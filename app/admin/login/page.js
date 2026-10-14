import { getAdminRequestState } from "@/lib/admin/server.mjs";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLoginPage({ searchParams }) {
  const admin = await getAdminRequestState();
  if (admin.session) redirect("/admin/theme");
  const query = await searchParams;

  return (
    <main className="admin-panel admin-login" id="main-content">
      <p className="admin-eyebrow">Private portfolio controls</p>
      <h1>Administrator sign in</h1>
      <p>
        Sign in to preview registered themes. Preview never changes the public
        active theme.
      </p>
      {!admin.configured && (
        <p className="admin-notice" role="status">
          Administrator access is not configured on this deployment.
        </p>
      )}
      {query?.error === "credentials" && (
        <p className="admin-error" role="alert">
          Unable to sign in with those credentials.
        </p>
      )}
      <form action="/admin/session" method="post">
        <label htmlFor="admin-password">Administrator password</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
          disabled={!admin.configured}
        />
        <button type="submit" disabled={!admin.configured}>
          Sign in
        </button>
      </form>
      <Link href="/">Return to the public portfolio</Link>
    </main>
  );
}
