import ExecutiveIcon from "./icon";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";

export function articleMeta(article, readingTime) {
  return [
    article.published_at && new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(article.published_at)),
    article.reading_time_minutes && formatCopy(readingTime, { minutes: article.reading_time_minutes }),
  ].filter(Boolean).join(" / ");
}

export default function ExecutiveArticleCard({ article, copy, level: Heading = "h3" }) {
  return (
    <article className="executive-article">
      {article.cover_image && (
        // Provider cover image fills the card; the text sits on a scrim.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="executive-article-cover" src={article.cover_image} alt="" width={640} height={320} loading="lazy" />
      )}
      <div className="executive-article-body">
        <p className="executive-label">{articleMeta(article, copy.blog.readingTime)}</p>
        <Heading><a href={article.url} target="_blank" rel="noreferrer">{article.title}</a></Heading>
        {article.description && <p className="executive-article-summary">{article.description}</p>}
        <a className="executive-article-arrow" href={article.url} target="_blank" rel="noreferrer" aria-label={formatCopy(copy.articles.readArticle, { title: article.title })}><ExecutiveIcon /></a>
      </div>
    </article>
  );
}
