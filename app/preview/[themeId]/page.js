import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";
import { requirePreview } from "./preview-context";

export default async function PreviewHome({ params }) {
  const { portfolio, selection } = await requirePreview(params);
  const { default: Slot } = await loadSelectedThemeSlot(selection.theme, "home");
  return <Slot portfolio={portfolio} />;
}
