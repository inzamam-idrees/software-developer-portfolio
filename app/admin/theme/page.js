import AdminShell from "@/app/admin/admin-shell";
import Icon from "@/app/admin/icons";
import { createContentStore } from "@/lib/content-store/index.mjs";
import { getAdminRequestState } from "@/lib/admin/server.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import { listPreviewableThemes } from "@/lib/themes/selection.mjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { previewPath } from "@/lib/admin/preview-links.mjs";
import ActivateControl from "./activate-control";
import { ThemeThumbnail, themePurpose } from "./theme-guide";

export const metadata = { title: "Themes" };

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
  const labelFor = (id) => themes.find((theme) => theme.id === id)?.label ?? id;
  const activatedTheme = themes.find(
    (theme) => theme.id === resolvedParams.activated,
  );
  const previewThemeId = admin.preview?.themeId ?? null;
  const store = activationStore();
  const canActivate = Boolean(store?.capabilities.writable);
  const activationError = resolvedParams.error
    ? ACTIVATION_ERRORS[resolvedParams.error] ?? "Activation failed. Try again."
    : null;

  return (
    <AdminShell current="theme">
      <header className="admin-page-head">
        <h1>Themes</h1>
        <p>
          Preview any theme privately in this browser, then publish one to every
          visitor.
        </p>
      </header>

      {activationError && (
        <p className="admin-callout" data-tone="error" role="alert">
          <Icon name="alert" />
          <span>{activationError}</span>
        </p>
      )}

      {activatedTheme && (
        <p className="admin-callout" data-tone="success" role="status" aria-live="polite">
          <Icon name="check" />
          <span>
            {resolvedParams.pending
              ? <>Theme &ldquo;{activatedTheme.label}&rdquo; was committed and goes live after the next deploy.</>
              : <>Theme &ldquo;{activatedTheme.label}&rdquo; has been activated and is now live for all visitors.</>}
          </span>
        </p>
      )}

      <section className="admin-overview" aria-label="Theme status">
        <div className="admin-overview-cell">
          <p className="admin-overview-label" id="public-theme-title">
            Current public theme
          </p>
          <p className="admin-overview-value">
            <span className="admin-pulse" aria-hidden="true" />
            {labelFor(activeThemeId)}
          </p>
          <p className="admin-overview-note">Live for all public visitors.</p>
        </div>
        <div className="admin-overview-cell">
          <p className="admin-overview-label">How previews work</p>
          <p className="admin-overview-note">
            A preview opens at its own address, <code>/preview/&lt;theme&gt;</code>, visible
            only while you are signed in. The public site keeps showing the live theme,
            even in this browser.
          </p>
          {previewThemeId && (
            <form action="/admin/theme/preview" method="post">
              <input type="hidden" name="action" value="end" />
              <button className="admin-button" data-variant="secondary" data-size="small" type="submit">
                End preview
              </button>
            </form>
          )}
        </div>
      </section>

      {!canActivate && (
        <p className="admin-callout" data-tone="warning">
          <Icon name="lock" />
          <span>
            This deployment is read-only, so themes can be previewed but not activated.
            Configure <code>PORTFOLIO_CONTENT_STORE</code> to enable activation.
          </span>
        </p>
      )}

      <section aria-labelledby="themes-title">
        <h2 className="admin-section-title" id="themes-title">
          Available themes
        </h2>
        <ul className="admin-theme-grid">
          {themes.map((theme) => {
            const isActive = theme.id === activeThemeId;
            return (
              <li key={theme.id}>
                <article
                  className="admin-theme-card"
                  data-active={isActive || undefined}
                  aria-labelledby={`theme-${theme.id}-title`}
                >
                  <div className="admin-theme-visual">
                    <ThemeThumbnail themeId={theme.id} />
                    <div className="admin-theme-badges">
                      {isActive && (
                        <span className="admin-badge" data-tone="success">
                          <span className="admin-pulse" aria-hidden="true" />
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="admin-theme-body">
                    <h3 id={`theme-${theme.id}-title`}>{theme.label}</h3>
                    <p>{themePurpose(theme.id)}</p>
                  </div>
                  <div className="admin-theme-actions">
                    <Link
                      className="admin-button"
                      data-variant="secondary"
                      href={previewPath(theme.id)}
                    >
                      <Icon name="eye" />
                      Preview {theme.label}
                    </Link>
                    {isActive ? (
                      <p className="admin-theme-live">
                        <Icon name="check" />
                        Published to all visitors
                      </p>
                    ) : (
                      <ActivateControl themeId={theme.id} label={theme.label} disabled={!canActivate} />
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="admin-footnote" aria-labelledby="activation-title">
        <h2 id="activation-title">How activation works</h2>
        <p>
          Activating saves the theme through the configured content store. Local files
          update the public site immediately; GitHub storage publishes after the next
          deploy. Read-only deployments cannot activate themes. Previews never change
          what visitors see.
        </p>
      </aside>
    </AdminShell>
  );
}
