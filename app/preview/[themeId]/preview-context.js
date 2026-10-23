import { notFound, redirect } from "next/navigation";
import { getPreviewRenderContext } from "@/lib/portfolio/render-context.mjs";

/** Resolves the previewed theme, or leaves the route for anyone not signed in. */
export async function requirePreview(params) {
  const { themeId } = await params;
  const context = await getPreviewRenderContext(themeId);
  if (context.status === "unauthorized") redirect("/admin/login");
  if (context.status !== "ok") notFound();
  return context;
}
