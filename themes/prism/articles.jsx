import { getArticles } from "@/lib/articles.mjs";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import Icon from "./icon";

export default async function Articles({ view, limit }) {
  const result = view.articles.mode === "manual"
    ? { status: "ready", articles: view.articles.manual.map((item) => ({ ...item, published_at: item.date, reading_time_minutes: item.readingTimeMinutes })) }
    : await getArticles(view.articles.provider.username);
  const items = limit ? result.articles.slice(0, limit) : result.articles;
  const copy = view.copy;
  if (!items.length) return <div className="prism-card prism-empty"><p>{result.status === "unavailable" ? copy.home.writing.unavailable : copy.home.writing.empty}</p>{view.social.dev && <a className="prism-button" href={view.social.dev} target="_blank" rel="noreferrer">{copy.home.writing.profile}<Icon name="arrow" /></a>}</div>;
  return <div className="prism-articles">{items.map((item) => <article className="prism-card" key={item.id} data-prism-reveal data-prism-tilt>
    <span className="prism-symbol"><Icon name="writing" /></span>
    <p className="prism-label">{[Number.isFinite(Date.parse(item.published_at)) && new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(item.published_at)), item.reading_time_minutes > 0 && formatCopy(copy.blog.readingTime, { minutes: item.reading_time_minutes })].filter(Boolean).join(" · ")}</p>
    <h3><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></h3><p>{item.description}</p>
    <a className="prism-icon-button" href={item.url} aria-label={formatCopy(copy.articles.readArticle, { title: item.title })} target="_blank" rel="noreferrer"><Icon name="arrow" /></a>
  </article>)}</div>;
}
