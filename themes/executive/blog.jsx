import { getArticles } from "@/lib/articles.mjs";
import { createExecutivePresentation } from "./presentation.mjs";

function articleMeta(article) {
  return [
    article.published_at && new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(article.published_at)),
    article.reading_time_minutes && `${article.reading_time_minutes} min read`,
  ].filter(Boolean).join(" · ");
}

export default async function ExecutiveBlog({ portfolio }) {
  const view = createExecutivePresentation(portfolio);
  const result = await getArticles(view.articles.provider.username);
  return (
    <div className="executive-page executive-route-page">
      <header className="executive-route-header"><p className="executive-kicker">Writing</p><h1>Notes on building software.</h1><p>Articles and practical observations from product engineering work.</p></header>
      {result.articles.length ? (
        <div className="executive-article-list">{result.articles.map((article, index) => (
          <article key={article.id}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><p className="executive-label">{articleMeta(article)}</p><h2><a href={article.url} target="_blank" rel="noreferrer">{article.title}</a></h2>{article.description && <p>{article.description}</p>}</div><a className="executive-article-arrow" href={article.url} target="_blank" rel="noreferrer" aria-label={`Read ${article.title}`}><span aria-hidden="true">↗</span></a></article>
        ))}</div>
      ) : (
        <div className="executive-empty-state"><p className="executive-kicker">Notebook update</p><h2>{result.status === "empty" ? "No published articles yet." : "Articles are temporarily unavailable."}</h2><p>My DEV profile remains available for the latest writing.</p><a className="executive-button secondary" href={view.social.dev} target="_blank" rel="noreferrer">Visit DEV Community <span aria-hidden="true">↗</span></a></div>
      )}
    </div>
  );
}
