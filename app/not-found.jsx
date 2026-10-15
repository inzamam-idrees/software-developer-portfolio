import Link from "next/link";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";

export default async function NotFound() {
  const { settings } = await getCurrentPortfolioView();
  const copy = settings.copy.shared.notFound;
  return (
    <div className="container not-found">
      <p className="eyebrow accent">{copy.eyebrow}</p>
      <h1>{copy.heading}</h1>
      <p>{copy.body}</p>
      <Link className="button primary" href="/">
        {copy.action}
      </Link>
    </div>
  );
}
