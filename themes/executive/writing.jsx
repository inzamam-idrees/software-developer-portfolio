import { getArticles } from "@/lib/articles.mjs";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";

export default async function ExecutiveWriting({ view }) {
  const { copy } = view;
  const result = await getArticles(view.articles.provider.username);
  if (!result.articles.length) return (
    <div className="executive-writing-empty"><p>{result.status === "empty" ? copy.blog.empty : copy.blog.unavailable}</p><p>{copy.blog.emptyBody}</p>{view.social.dev && <a className="executive-text-link" href={view.social.dev} target="_blank" rel="noreferrer">{copy.blog.profileAction} <span aria-hidden="true">↗</span></a>}</div>
  );
  return <div className="executive-article-list">{result.articles.slice(0, 3).map((article, index) => (
    <article key={article.id}>
      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <div><p className="executive-label">{[
        article.published_at && new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(article.published_at)),
        article.reading_time_minutes && formatCopy(copy.blog.readingTime, { minutes: article.reading_time_minutes }),
      ].filter(Boolean).join(" · ")}</p><h3><a href={article.url} target="_blank" rel="noreferrer">{article.title}</a></h3>{article.description && <p>{article.description}</p>}</div>
      <a className="executive-article-arrow" href={article.url} target="_blank" rel="noreferrer" aria-label={formatCopy(copy.articles.readArticle, { title: article.title })}><span aria-hidden="true">↗</span></a>
    </article>
  ))}</div>;
}
