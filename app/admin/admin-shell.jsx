import Link from "next/link";
import { createContentStore } from "@/lib/content-store/index.mjs";
import Icon from "./icons";
import { storeBadge } from "./content/store-description.mjs";

// ── Navigation ──
const SECTIONS = [
  { id: "theme", label: "Themes", href: "/admin/theme", icon: "themes" },
  { id: "content", label: "Content", href: "/admin/content", icon: "content" },
];

const CONTENT_GROUPS = [
  ["content", "Portfolio content"],
  ["settings", "Site settings"],
  ["copy", "Theme copy"],
];

function currentStore() {
  try {
    return createContentStore();
  } catch {
    return null;
  }
}

/** Shared frame for every signed-in admin page: brand, navigation, storage state, sign-out. */
export default function AdminShell({ current, children }) {
  const badge = storeBadge(currentStore());
  return (
    <div className="admin-app">
      <a className="admin-skip" href="#main-content">
        Skip to content
      </a>
      <header className="admin-sidebar">
        <Link className="admin-brand" href="/admin/theme">
          <Icon name="mark" className="admin-brand-mark" />
          <span>Portfolio admin</span>
        </Link>

        <nav className="admin-nav" aria-label="Administration">
          <ul>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <Link
                  href={section.href}
                  aria-current={current === section.id ? "page" : undefined}
                >
                  <Icon name={section.icon} />
                  <span>{section.label}</span>
                </Link>
                {section.id === "content" && (
                  <ul className="admin-subnav">
                    {CONTENT_GROUPS.map(([group, label]) => (
                      <li key={group}>
                        <Link href={`/admin/content#group-${group}`}>{label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-sidebar-foot">
          <p className="admin-store" data-store={badge.kind}>
            <span className="admin-store-dot" aria-hidden="true" />
            <span>
              <strong>{badge.title}</strong>
              <span>{badge.detail}</span>
            </span>
          </p>
          <Link className="admin-foot-link" href="/">
            <Icon name="external" />
            <span>View site</span>
          </Link>
          <form action="/admin/logout" method="post">
            <button className="admin-foot-link" type="submit">
              <Icon name="signOut" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </header>
      <main className="admin-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
