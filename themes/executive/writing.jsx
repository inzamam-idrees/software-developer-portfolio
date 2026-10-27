import { getArticles } from "@/lib/articles.mjs";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";

export default async function ExecutiveWriting({ view }) {
  const { copy } = view;
  const result = await getArticles(view.articles.provider.username);
  if (result.articles.length < 3) return <section id="writing" className="executive-section executive-writing-strip" aria-labelledby="executive-writing-title"><h2 id="executive-writing-title">{copy.blog.heading}</h2><div>{result.articles.length ? <a className="executive-text-link" href={result.articles[0].url} target="_blank" rel="noreferrer">{result.articles[0].title}</a> : <p>{result.status === "empty" ? copy.blog.empty : copy.blog.unavailable}</p>}<a className="executive-text-link" href="/blog">{copy.navigation.writing}</a></div></section>;
  return <section id="writing" className="executive-section executive-writing" aria-labelledby="executive-writing-title"><h2 id="executive-writing-title">{copy.blog.heading}</h2><div className="executive-article-list">{result.articles.slice(0, 3).map((article) => (
    <article key={article.id}>

      <div><p className="executive-label">{[
        article.published_at && new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(article.published_at)),
        article.reading_time_minutes && formatCopy(copy.blog.readingTime, { minutes: article.reading_time_minutes }),
      ].filter(Boolean).join(" / ")}</p><h3><a href={article.url} target="_blank" rel="noreferrer">{article.title}</a></h3>{article.description && <p>{article.description}</p>}</div>
      <a className="executive-article-arrow" href={article.url} target="_blank" rel="noreferrer" aria-label={formatCopy(copy.articles.readArticle, { title: article.title })}><span aria-hidden="true">↗</span></a>
    </article>
  ))}</div></section>;
}
