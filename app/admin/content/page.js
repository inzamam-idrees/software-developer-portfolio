import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "@/app/admin/admin-nav";
import { getAdminRequestState } from "@/lib/admin/server.mjs";
import { createContentStore } from "@/lib/content-store/index.mjs";
import { documentRegistry } from "@/lib/portfolio/documents.mjs";
import { describeStore } from "./store-description.mjs";

const groups = [
  ["content", "Portfolio content"],
  ["settings", "Site settings"],
  ["copy", "Theme copy"],
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

  return (
    <main className="admin-panel admin-content" id="main-content">
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">Private content management</p>
          <h1>Portfolio content</h1>
        </div>
        <AdminNav current="content" />
      </header>

      <section className="admin-status" aria-labelledby="store-title">
        <p id="store-title">Content storage</p>
        <strong>{store ? store.kind : "unavailable"}</strong>
        <span>{storeError ?? describeStore(store)}</span>
      </section>

      {groups.map(([group, title]) => (
        <section key={group} aria-labelledby={`group-${group}`}>
          <div className="admin-section-heading">
            <h2 id={`group-${group}`}>{title}</h2>
          </div>
          <ul className="admin-document-list">
            {documentRegistry
              .filter((definition) => definition.group === group)
              .map((definition) => (
                <li key={definition.id}>
                  <Link href={`/admin/content/${definition.id}`}>{definition.label}</Link>
                  <span>{definition.path}</span>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
