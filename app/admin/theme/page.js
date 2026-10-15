import AdminNav from "@/app/admin/admin-nav";
import { createContentStore } from "@/lib/content-store/index.mjs";
import { getAdminRequestState } from "@/lib/admin/server.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import { listPreviewableThemes } from "@/lib/themes/selection.mjs";
import { redirect } from "next/navigation";

const ACTIVATION_ERRORS = Object.freeze({
  READ_ONLY: "Activation is not configured for this deployment: the content store is read-only.",
  CONFLICT: "The active theme changed elsewhere. Reload and try again.",
  UNAUTHORIZED_STORE: "The storage credentials were rejected. Check GITHUB_CONTENT_TOKEN.",
  STORE_UNAVAILABLE: "Content storage is unavailable. Try again later.",
  INVALID_THEME: "That theme does not exist.",
  UNAVAILABLE_THEME: "That theme is not available for activation.",
});

function activationStore() {
  try {
    return createContentStore();
  } catch {
    return null;
  }
}

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
  const store = activationStore();
  const canActivate = Boolean(store?.capabilities.writable);
  const activationError = resolvedParams.error
    ? ACTIVATION_ERRORS[resolvedParams.error] ?? "Activation failed. Try again."
    : null;

  return (
    <main className="admin-panel admin-theme-manager" id="main-content">
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">Private theme management</p>
          <h1>Theme review &amp; activation</h1>
        </div>
        <AdminNav current="theme" />
      </header>

      {activationError && (
        <p className="admin-error" role="alert">
          {activationError}
        </p>
      )}

      {!canActivate && (
        <p className="admin-notice">
          This deployment is read-only, so themes can be previewed but not activated.
          Configure PORTFOLIO_CONTENT_STORE to enable activation.
        </p>
      )}

      {activatedTheme && (
        <aside className="admin-notice" role="status" aria-live="polite">
          {resolvedParams.pending
            ? <>Theme &ldquo;{activatedTheme.label}&rdquo; was committed and goes live after the next deploy.</>
            : <>Theme &ldquo;{activatedTheme.label}&rdquo; has been activated and is now live for all visitors.</>}
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
                      <button type="submit" disabled={!canActivate}>
                        Activate {theme.label}
                      </button>
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
          Activating a theme saves it through the configured content store. Local
          files update the public layout immediately; GitHub storage publishes after
          the next deploy. Read-only deployments cannot activate themes.
        </p>
      </section>
    </main>
  );
}
