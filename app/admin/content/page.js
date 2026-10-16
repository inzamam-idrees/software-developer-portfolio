import Link from "next/link";
import { redirect } from "next/navigation";
import AdminShell from "@/app/admin/admin-shell";
import Icon from "@/app/admin/icons";
import { getAdminRequestState } from "@/lib/admin/server.mjs";
import { createContentStore } from "@/lib/content-store/index.mjs";
import { documentRegistry } from "@/lib/portfolio/documents.mjs";
import { describeStore } from "./store-description.mjs";

export const metadata = { title: "Content" };

const groups = [
  ["content", "Portfolio content", "Profile, projects, experience and the other facts every theme renders."],
  ["settings", "Site settings", "Site identity, navigation, SEO, features and the active theme."],
  ["copy", "Theme copy", "Interface wording: shared labels and each theme's own text."],
];

export default async function ContentIndexPage() {
  const admin = await getAdminRequestState();
  if (!admin.session) redirect("/admin/login");

  let store = null;
  let storeError = null;
  try {
    store = createContentStore();
  } catch (error) {
    storeError = error.message;
  }
  const writable = Boolean(store?.capabilities.writable);

  return (
    <AdminShell current="content">
      <header className="admin-page-head">
        <h1>Content</h1>
        <p>
          Every fact and label on the site lives in one of these documents. Each save is
          validated against the whole portfolio before it is written.
        </p>
      </header>

      <p
        className="admin-callout"
        data-tone={storeError ? "error" : writable ? "neutral" : "warning"}
        role={storeError ? "alert" : undefined}
      >
        <Icon name={writable ? "check" : storeError ? "alert" : "lock"} />
        <span>
          <strong>Storage: {store ? store.kind : "unavailable"}.</strong>{" "}
          {storeError ?? describeStore(store)}
        </span>
      </p>

      {groups.map(([group, title, summary]) => {
        const documents = documentRegistry.filter((definition) => definition.group === group);
        return (
          <section className="admin-doc-group" key={group} id={`group-${group}`} aria-labelledby={`group-${group}-title`}>
            <div className="admin-doc-group-head">
              <h2 className="admin-section-title" id={`group-${group}-title`}>
                {title}
                <span className="admin-count">{documents.length}</span>
              </h2>
              <p>{summary}</p>
            </div>
            <ul className="admin-document-list">
              {documents.map((definition) => (
                <li key={definition.id}>
                  <Link
                    href={`/admin/content/${definition.id}`}
                    aria-label={definition.label}
                    aria-describedby={`doc-${definition.id}-path`}
                  >
                    <span className="admin-doc-name">{definition.label}</span>
                    <code className="admin-doc-path" id={`doc-${definition.id}-path`}>
                      {definition.path}
                    </code>
                    <Icon name="arrowRight" className="admin-icon admin-doc-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </AdminShell>
  );
}
