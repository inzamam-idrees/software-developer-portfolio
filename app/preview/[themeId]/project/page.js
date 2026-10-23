import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";
import { requirePreview } from "../preview-context";

export default async function PreviewProjects({ params }) {
  const { portfolio, selection } = await requirePreview(params);
  const { default: Slot } = await loadSelectedThemeSlot(selection.theme, "projects");
  return <Slot portfolio={portfolio} />;
}
