import { getArticles } from "@/lib/articles.mjs";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import Icon from "./icon";

export default async function Articles({ view, limit }) {
  const result = view.articles.mode === "manual"
    ? { status: "ready", articles: view.articles.manual.map((item) => ({ ...item, published_at: item.date, reading_time_minutes: item.readingTimeMinutes })) }
    : await getArticles(view.articles.provider.username);
  const items = limit ? result.articles.slice(0, limit) : result.articles;
  const copy = view.copy;
  if (!items.length) return <div className="creative-card creative-empty"><p>{result.status === "unavailable" ? copy.home.writing.unavailable : copy.home.writing.empty}</p>{view.social.dev && <a className="creative-button creative-button-light" href={view.social.dev} target="_blank" rel="noreferrer">{copy.home.writing.profile}<Icon name="arrow" /></a>}</div>;
  return <div className="creative-articles">{items.map((item, index) => <article className="creative-card creative-article" key={item.id} data-reveal="up" style={{ "--i": index % 3 }}>
    {item.cover_image && <div className="creative-article-media">
      {/* Remote dev.to cover; native image avoids remote-pattern configuration. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.cover_image} alt="" loading="lazy" width={1000} height={420} />
    </div>}
    <div className="creative-article-body">
      <p className="creative-meta">{[Number.isFinite(Date.parse(item.published_at)) && new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(item.published_at)), item.reading_time_minutes > 0 && formatCopy(copy.blog.readingTime, { minutes: item.reading_time_minutes })].filter(Boolean).join(" · ")}</p>
      <h3><a className="creative-card-link" href={item.url} target="_blank" rel="noreferrer">{item.title}</a></h3>
      {item.description && <p>{item.description}</p>}
      <span className="creative-article-cue" aria-hidden="true"><Icon name="arrow" /></span>
    </div>
  </article>)}</div>;
}
