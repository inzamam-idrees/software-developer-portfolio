import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminNav from "@/app/admin/admin-nav";
import { documentFormSchema } from "@/lib/admin/form-schema.mjs";
import { getAdminRequestState } from "@/lib/admin/server.mjs";
import { createContentStore } from "@/lib/content-store/index.mjs";
import { getDocumentDefinition } from "@/lib/portfolio/documents.mjs";
import SchemaForm from "../schema-form";
import { describeStore } from "../store-description.mjs";

export const dynamic = "force-dynamic";

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

  return (
    <main className="admin-panel admin-content" id="main-content">
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">
            <Link href="/admin/content">Portfolio content</Link> / {definition.path}
          </p>
          <h1>{definition.label}</h1>
        </div>
        <AdminNav current="content" />
      </header>
      <p className="admin-hint">{describeStore(store)}</p>
      {failure ? (
        <p className="admin-error" role="alert">
          {failure}
        </p>
      ) : (
        <SchemaForm
          documentId={definition.id}
          label={definition.label}
          jsonSchema={documentFormSchema(definition.id)}
          initialData={loaded.data}
          revision={loaded.revision}
          writable={store.capabilities.writable}
          liveAfterWrite={store.capabilities.liveAfterWrite}
        />
      )}
    </main>
  );
}
