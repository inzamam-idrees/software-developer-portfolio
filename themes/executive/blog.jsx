import { getArticles } from "@/lib/articles.mjs";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { createExecutivePresentation } from "./presentation.mjs";

function articleMeta(article, readingTime) {
  return [
    article.published_at && new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(article.published_at)),
    article.reading_time_minutes && formatCopy(readingTime, { minutes: article.reading_time_minutes }),
  ].filter(Boolean).join(" / ");
}

export default async function ExecutiveBlog({ portfolio }) {
  const view = createExecutivePresentation(portfolio);
  const copy = view.copy;
  const result = await getArticles(view.articles.provider.username);
  return (
    <div className="executive-page executive-route-page">
      <header className="executive-route-header"><p className="executive-kicker">{copy.blog.kicker}</p><h1>{copy.blog.heading}</h1><p>{copy.blog.intro}</p></header>
      {result.articles.length ? (
        <div className="executive-article-list">{result.articles.map((article) => (
          <article key={article.id}><div><p className="executive-label">{articleMeta(article, copy.blog.readingTime)}</p><h2><a href={article.url} target="_blank" rel="noreferrer">{article.title}</a></h2>{article.description && <p>{article.description}</p>}</div><a className="executive-article-arrow" href={article.url} target="_blank" rel="noreferrer" aria-label={formatCopy(copy.articles.readArticle, { title: article.title })}><span aria-hidden="true">↗</span></a></article>
        ))}</div>
      ) : (
        <div className="executive-empty-state"><p className="executive-kicker">{copy.blog.emptyKicker}</p><h2>{result.status === "empty" ? copy.blog.empty : copy.blog.unavailable}</h2><p>{copy.blog.emptyBody}</p><a className="executive-button secondary" href={view.social.dev} target="_blank" rel="noreferrer">{copy.blog.profileAction} <span aria-hidden="true">↗</span></a></div>
      )}
    </div>
  );
}
