import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";
import { requirePreview } from "../preview-context";

export default async function PreviewBlog({ params }) {
  const { portfolio, selection } = await requirePreview(params);
  const { default: Slot } = await loadSelectedThemeSlot(selection.theme, "blog");
  return <Slot portfolio={portfolio} />;
}
