import { renderMonogram } from "@/lib/seo/icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default function AppleIcon() {
  return renderMonogram(size);
}
