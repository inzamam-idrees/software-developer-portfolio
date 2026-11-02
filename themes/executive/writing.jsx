import { getArticles } from "@/lib/articles.mjs";
import ExecutiveArticleCard from "./article-card";

export default async function ExecutiveWriting({ view }) {
  const { copy } = view;
  const result = await getArticles(view.articles.provider.username);
  const heading = (
    <div className="executive-section-heading"><div><p className="executive-kicker">{copy.blog.kicker}</p><h2 id="executive-writing-title">{copy.blog.heading}</h2></div><a className="executive-text-link" href="/blog">{copy.navigation.writing}</a></div>
  );
  if (!result.articles.length) return <section id="writing" className="executive-section executive-writing-strip" aria-labelledby="executive-writing-title">{heading}<p>{result.status === "empty" ? copy.blog.empty : copy.blog.unavailable}</p></section>;
  return <section id="writing" className="executive-section executive-writing" aria-labelledby="executive-writing-title">{heading}<div className="executive-article-list">{result.articles.slice(0, 3).map((article) => <ExecutiveArticleCard key={article.id} article={article} copy={copy} />)}</div></section>;
}
