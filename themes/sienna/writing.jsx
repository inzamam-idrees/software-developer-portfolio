import { Suspense } from "react";
import Link from "next/link";
import { getArticles } from "@/lib/articles.mjs";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { SectionHeading } from "./sections";
import Icon from "./icon";

// ── Articles (dev.to via lib/articles.mjs, or manual entries) ──
function articleMeta(item, copy) {
  const date = Number.isFinite(Date.parse(item.published_at))
    && new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(item.published_at));
  const minutes = item.reading_time_minutes > 0 && formatCopy(copy.blog.readingTime, { minutes: item.reading_time_minutes });
  return [date, minutes].filter(Boolean).join(" · ");
}

export async function Articles({ view, limit }) {
  const copy = view.copy;
  const result = view.articles.mode === "manual"
    ? { status: "ready", articles: view.articles.manual.map((item) => ({ ...item, published_at: item.date, reading_time_minutes: item.readingTimeMinutes })) }
    : await getArticles(view.articles.provider.username);
  const items = limit ? result.articles.slice(0, limit) : result.articles;
  const writing = copy.home.writing;
  if (!items.length) return <div className="sienna-card sienna-empty">
    <p className="sienna-section-text">{result.status === "unavailable" ? writing.unavailable : writing.empty}</p>
    {view.social.dev && <a className="sienna-btn sienna-btn-primary" href={view.social.dev} target="_blank" rel="noopener noreferrer">{writing.profile}</a>}
  </div>;
  return <ul className="sienna-article-grid">{items.map((item, index) => <li key={item.id} data-reveal="up" style={{ "--i": index % 3 }}>
    <article className="sienna-card sienna-article">
      {item.cover_image && <figure className="sienna-article-cover">
        {/* Remote dev.to cover; a native image avoids remote-pattern configuration. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.cover_image} alt="" width={1000} height={420} loading="lazy" decoding="async" />
      </figure>}
      <div className="sienna-article-body">
        <p className="sienna-article-meta">{articleMeta(item, copy)}</p>
        <h3 className="sienna-h4"><a className="sienna-article-link" href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a></h3>
        {item.description && <p className="sienna-info-text">{item.description}</p>}
        <span className="sienna-article-cue" aria-hidden="true"><Icon name="open" /></span>
      </div>
    </article>
  </li>)}</ul>;
}

// ── Home teaser ──
export function Writing({ view }) {
  if (!view.settings.features.articles) return null;
  const writing = view.copy.home.writing;
  return <section className="sienna-section sienna-writing" id="writing" aria-labelledby="sienna-writing-title">
    <SectionHeading id="sienna-writing-title" label={writing.label} title={writing.heading} />
    <Suspense fallback={<p className="sienna-section-text">{view.copy.blogLoading.message}</p>}>
      <Articles view={view} limit={3} />
    </Suspense>
    <Link className="sienna-btn sienna-btn-primary sienna-section-more" href="/blog">{writing.all}</Link>
  </section>;
}
