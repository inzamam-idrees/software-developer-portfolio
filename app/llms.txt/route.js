import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import { buildLlmsText } from "@/lib/seo/llms.mjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const portfolio = await getCurrentPortfolioView();
  return new Response(buildLlmsText(portfolio), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
