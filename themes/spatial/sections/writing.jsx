import Link from "next/link";
import { getArticles } from "@/lib/articles.mjs";
import ArticleList from "./article-list";

export default async function Writing({ view }) {
  const copy = view.copy.home.writing;
  const result = await getArticles(view.articles.provider.username);
  return (
    <section className="spatial-section" id="writing" aria-labelledby="spatial-writing-title">
      <div className="spatial-frame">
        <h2 id="spatial-writing-title" className="spatial-section-title">
          {copy.heading}
        </h2>
        {result.articles.length ? (
          <ArticleList articles={result.articles.slice(0, 3)} copy={view.copy} />
        ) : (
          <p>{result.status === "empty" ? copy.empty : copy.unavailable}</p>
        )}
        <p className="spatial-actions">
          {result.articles.length > 3 && (
            <Link className="spatial-button" href="/blog">
              {view.copy.blog.heading}
            </Link>
          )}
          <a className="spatial-text-link" href={view.social.dev} target="_blank" rel="noreferrer">
            {copy.profileAction}
          </a>
        </p>
      </div>
    </section>
  );
}

export function WritingFallback({ copy, profileUrl }) {
  return (
    <section className="spatial-section" id="writing" aria-labelledby="spatial-writing-title">
      <div className="spatial-frame">
        <h2 id="spatial-writing-title" className="spatial-section-title">{copy.heading}</h2>
        <p>{copy.loading}</p>
        <p className="spatial-actions"><a className="spatial-text-link" href={profileUrl} target="_blank" rel="noreferrer">{copy.profileAction}</a></p>
      </div>
    </section>
  );
}
