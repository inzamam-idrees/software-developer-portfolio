import { getArticles } from "@/lib/articles.mjs";
import ExecutiveArticleCard from "./article-card";
import { createExecutivePresentation } from "./presentation.mjs";

export default async function ExecutiveBlog({ portfolio }) {
  const view = createExecutivePresentation(portfolio);
  const copy = view.copy;
  const result = await getArticles(view.articles.provider.username);
  return (
    <div className="executive-page executive-route-page">
      <header className="executive-route-header"><p className="executive-kicker">{copy.blog.kicker}</p><h1>{copy.blog.heading}</h1><p>{copy.blog.intro}</p></header>
      {result.articles.length ? (
        <div className="executive-article-list">{result.articles.map((article) => <ExecutiveArticleCard key={article.id} article={article} copy={copy} level="h2" />)}</div>
      ) : (
        <div className="executive-empty-state"><p className="executive-kicker">{copy.blog.emptyKicker}</p><h2>{result.status === "empty" ? copy.blog.empty : copy.blog.unavailable}</h2><p>{copy.blog.emptyBody}</p><a className="executive-button secondary" href={view.social.dev} target="_blank" rel="noreferrer">{copy.blog.profileAction} <span aria-hidden="true">↗</span></a></div>
      )}
    </div>
  );
}
