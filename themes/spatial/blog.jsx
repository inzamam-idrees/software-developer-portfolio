import { getArticles } from "@/lib/articles.mjs";
import ArticleList from "./sections/article-list";
import { createSpatialView } from "./view.mjs";

export default async function SpatialBlog({ portfolio }) {
  const view = createSpatialView(portfolio);
  const { copy } = view;
  const result = await getArticles(view.articles.provider.username);
  return (
    <div className="spatial-frame spatial-route">
      <header className="spatial-route-head">
        <h1>{copy.blog.heading}</h1>
        <p>{copy.blog.intro}</p>
      </header>
      {result.articles.length ? (
        <ArticleList
          articles={result.articles}
          copy={copy}
          locale={view.settings.site.locale}
          headingLevel={2}
        />
      ) : (
        <p className="spatial-lead">
          {result.status === "empty" ? copy.blog.empty : copy.blog.unavailable}
        </p>
      )}
      <a className="spatial-button" href={view.social.dev} target="_blank" rel="noreferrer">
        {copy.blog.profileAction}
      </a>
    </div>
  );
}
