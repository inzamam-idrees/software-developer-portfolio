import JsonLd from "@/app/components/seo/json-ld";
import { getArticles } from "@/lib/articles.mjs";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import { getPortfolioRenderContext } from "@/lib/portfolio/render-context.mjs";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { blogStructuredData } from "@/lib/seo/structured-data.mjs";
import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";

// dev.to articles are fetched with the same window (lib/articles.mjs).
export const revalidate = 3600;

function blogPage(settings) {
  return {
    path: "/blog",
    title: formatCopy(settings.copy.shared.routes.blogTitle, {
      siteName: settings.site.name,
    }),
    description: settings.seo.pages.blog.description,
  };
}

export async function generateMetadata() {
  const { settings } = await getCurrentPortfolioView();
  return pageMetadata(settings, blogPage(settings));
}

export default async function BlogPage() {
  const { portfolio, selection } = await getPortfolioRenderContext();
  const { default: ThemeBlog } = await loadSelectedThemeSlot(selection.theme, "blog");
  const { articles } = await getArticles(portfolio.articles.provider.username);
  return (
    <>
      <JsonLd
        data={blogStructuredData(portfolio, articles, blogPage(portfolio.settings))}
      />
      <ThemeBlog portfolio={portfolio} />
    </>
  );
}
