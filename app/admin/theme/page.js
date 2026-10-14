import { getAdminRequestState } from "@/lib/admin/server.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import { listPreviewableThemes } from "@/lib/themes/selection.mjs";
import { redirect } from "next/navigation";

export default async function ThemeManagementPage({ searchParams }) {
  const admin = await getAdminRequestState();
  if (!admin.session) redirect("/admin/login");

  const resolvedParams = searchParams ? await searchParams : {};
  const portfolio = await getCurrentPortfolioView();
  const activeThemeId = portfolio.settings.theme.activeTheme;
  const themes = listPreviewableThemes();
  const activeTheme = themes.find((theme) => theme.id === activeThemeId);
  const activatedTheme = themes.find(
    (theme) => theme.id === resolvedParams.activated,
  );

  return (
    <main className="admin-panel admin-theme-manager" id="main-content">
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">Private theme management</p>
          <h1>Theme review &amp; activation</h1>
        </div>
        <form action="/admin/logout" method="post">
          <button className="admin-secondary" type="submit">
            Sign out
          </button>
        </form>
      </header>

      {activatedTheme && (
        <aside className="admin-notice" role="status" aria-live="polite">
          Theme &ldquo;{activatedTheme.label}&rdquo; has been activated and is now
          live for all visitors.
        </aside>
      )}

      <section className="admin-status" aria-labelledby="public-theme-title">
        <p id="public-theme-title">Current public theme</p>
        <strong>{activeTheme?.label || activeThemeId}</strong>
        <span>
          {activeTheme?.label || activeThemeId} is currently active for all public
          visitors.
        </span>
      </section>

      {admin.preview && (
        <aside className="admin-preview-status" aria-label="Preview status">
          <span>Private preview: {admin.preview.themeId}</span>
          <form action="/admin/theme/preview" method="post">
            <input type="hidden" name="action" value="end" />
            <button className="admin-secondary" type="submit">
              End preview
            </button>
          </form>
        </aside>
      )}

      <section aria-labelledby="themes-title">
        <div className="admin-section-heading">
          <h2 id="themes-title">Available themes</h2>
          <p>
            Preview themes privately or activate any theme to publish it
            immediately.
          </p>
        </div>
        <div className="admin-theme-grid">
          {themes.map((theme) => {
            const isActive = theme.id === activeThemeId;
            return (
              <article className="admin-theme-card" key={theme.id}>
                <div>
                  <h3>{theme.label}</h3>
                  <p>
                    {isActive
                      ? "Active publicly"
                      : "Available for preview and activation"}
                  </p>
                </div>
                <div className="admin-card-actions">
                  <form action="/admin/theme/preview" method="post">
                    <input type="hidden" name="themeId" value={theme.id} />
                    <button className="admin-secondary" type="submit">
                      Preview {theme.label}
                    </button>
                  </form>
                  {isActive ? (
                    <button
                      type="button"
                      disabled
                      aria-label={`${theme.label} is currently active`}
                    >
                      Active
                    </button>
                  ) : (
                    <form action="/admin/theme/activate" method="post">
                      <input type="hidden" name="themeId" value={theme.id} />
                      <button type="submit">Activate {theme.label}</button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="admin-activation" aria-labelledby="activation-title">
        <h2 id="activation-title">Activation</h2>
        <p>
          Activating a theme updates the public layout across all routes immediately.
          Select any available theme above to activate it.
        </p>
      </section>
    </main>
  );
}
