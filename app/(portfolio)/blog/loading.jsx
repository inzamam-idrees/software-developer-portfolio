import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";

export default async function Loading() {
  const { settings } = await getCurrentPortfolioView();
  const copy = settings.copy.shared.blogLoading;
  return (
    <div className="container route-page" role="status">
      <p className="eyebrow accent">{copy.eyebrow}</p>
      <p className="body-copy">{copy.message}</p>
    </div>
  );
}
