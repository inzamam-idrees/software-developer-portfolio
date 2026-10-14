import { getAdminRequestState } from "@/lib/admin/server.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import { listPreviewableThemes } from "@/lib/themes/selection.mjs";
import { redirect } from "next/navigation";

export default async function ThemeManagementPage() {
  const admin = await getAdminRequestState();
  if (!admin.session) redirect("/admin/login");

  const portfolio = await getCurrentPortfolioView();
  const activeThemeId = portfolio.settings.theme.activeTheme;
  const themes = listPreviewableThemes();

  return (
    <main className="admin-panel admin-theme-manager" id="main-content">
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">Private theme management</p>
          <h1>Theme review</h1>
        </div>
        <form action="/admin/logout" method="post">
          <button className="admin-secondary" type="submit">Sign out</button>
        </form>
      </header>

      <section className="admin-status" aria-labelledby="public-theme-title">
        <p id="public-theme-title">Current public theme</p>
        <strong>{themes.find((theme) => theme.id === activeThemeId)?.label}</strong>
        <span>Cinematic remains public until a later, explicitly approved activation phase.</span>
      </section>

      {admin.preview && (
        <aside className="admin-preview-status" aria-label="Preview status">
          <span>Private preview: {admin.preview.themeId}</span>
          <form action="/admin/theme/preview" method="post">
            <input type="hidden" name="action" value="end" />
            <button className="admin-secondary" type="submit">End preview</button>
          </form>
        </aside>
      )}

      <section aria-labelledby="themes-title">
        <div className="admin-section-heading">
          <h2 id="themes-title">Available themes</h2>
          <p>Each preview uses the validated canonical portfolio content.</p>
        </div>
        <div className="admin-theme-grid">
          {themes.map((theme) => (
            <article className="admin-theme-card" key={theme.id}>
              <div>
                <h3>{theme.label}</h3>
                <p>{theme.id === activeThemeId ? "Active publicly" : "Available for private review"}</p>
              </div>
              <form action="/admin/theme/preview" method="post">
                <input type="hidden" name="themeId" value={theme.id} />
                <button type="submit">Preview {theme.label}</button>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-activation" aria-labelledby="activation-title">
        <h2 id="activation-title">Activation</h2>
        <p>
          Activation is intentionally unavailable until persistent shared storage,
          atomic writes, concurrency control, backups, and production authorization
          are established.
        </p>
        <button type="button" disabled>Activation unavailable</button>
      </section>
    </main>
  );
}
