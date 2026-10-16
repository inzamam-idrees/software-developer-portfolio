import { formatCopy } from "@/lib/portfolio/format-copy.mjs";

function published(article, locale) {
  if (!article.published_at) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(article.published_at),
  );
}

export default function ArticleList({ articles, copy, locale = "en", headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  return (
    <ol className="spatial-articles">
      {articles.map((article) => (
        <li key={article.id}>
          <p className="spatial-article-meta">
            <span>{published(article, locale) ?? copy.blog.fallbackDate}</span>
            {article.reading_time_minutes && (
              <span>{formatCopy(copy.blog.readingTime, { minutes: article.reading_time_minutes })}</span>
            )}
          </p>
          <Heading>
            <a href={article.url} target="_blank" rel="noreferrer">
              {article.title}
            </a>
          </Heading>
          {article.description && <p>{article.description}</p>}
        </li>
      ))}
    </ol>
  );
}
