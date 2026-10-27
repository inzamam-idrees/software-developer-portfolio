import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminShell from "@/app/admin/admin-shell";
import Icon from "@/app/admin/icons";
import { documentFormSchema } from "@/lib/admin/form-schema.mjs";
import { getAdminRequestState } from "@/lib/admin/server.mjs";
import { createContentStore } from "@/lib/content-store/index.mjs";
import { getDocumentDefinition } from "@/lib/portfolio/documents.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import SchemaForm from "../schema-form";
import { describeStore } from "../store-description.mjs";

export const dynamic = "force-dynamic";

const GROUP_TITLES = Object.freeze({
  content: "Portfolio content",
  settings: "Site settings",
  copy: "Theme copy",
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    return { title: `Edit ${getDocumentDefinition(id).label}` };
  } catch {
    return { title: "Document not found" };
  }
}

export default async function ContentDocumentPage({ params }) {
  const admin = await getAdminRequestState();
  if (!admin.session) redirect("/admin/login");

  const { id } = await params;
  let definition;
  try {
    definition = getDocumentDefinition(id);
  } catch {
    notFound();
  }

  let store = null;
  let loaded = null;
  let failure = null;
  try {
    store = createContentStore();
    loaded = await store.read(definition.id);
  } catch (error) {
    failure = error.message;
  }

  const portfolio = await getCurrentPortfolioView();

  return (
    <AdminShell current="content">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/admin/content">Content</Link>
          </li>
          <li>
            <Link href={`/admin/content#group-${definition.group}`}>
              {GROUP_TITLES[definition.group] ?? definition.group}
            </Link>
          </li>
          <li aria-current="page">{definition.label}</li>
        </ol>
      </nav>
      <header className="admin-page-head admin-editor-head">
        <h1>{definition.label}</h1>
        <p>
          <code className="admin-doc-path">{definition.path}</code>
        </p>
        <p>{describeStore(store)}</p>
      </header>
      {failure ? (
        <p className="admin-callout" data-tone="error" role="alert">
          <Icon name="alert" />
          <span>{failure}</span>
        </p>
      ) : (
        <SchemaForm
          documentId={definition.id}
          label={definition.label}
          jsonSchema={documentFormSchema(definition.id, { fieldCopy: portfolio.settings.copy.shared.adminFields })}
          initialData={loaded.data}
          revision={loaded.revision}
          writable={store.capabilities.writable}
          liveAfterWrite={store.capabilities.liveAfterWrite}
        />
      )}
    </AdminShell>
  );
}
