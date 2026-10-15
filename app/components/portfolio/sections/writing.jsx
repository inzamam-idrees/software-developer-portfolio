import Link from "next/link";
import { getArticles } from "@/lib/articles.mjs";
import ChapterHeading from "../ui/chapter-heading";
import BlogCard from "../../homepage/blog/blog-card";
export function Writing({ result, profileUrl, copy, blogCopy }) {
  return (
    <section
      id="writing"
      className="chapter container"
      aria-labelledby="writing-heading"
    >
      <ChapterHeading
        id="writing"
        number="06"
        label={copy.label}
        title={copy.heading}
        description={copy.description}
      />
      {result.articles.length ? (
        <div className="writing-grid">
          {result.articles.slice(0, 3).map((blog) => (
            <BlogCard key={blog.id} blog={blog} copy={blogCopy} />
          ))}
        </div>
      ) : (
        <p className="body-copy">
          {result.status === "empty" ? copy.empty : copy.unavailable}
        </p>
      )}
      <div className="actions writing-actions">
        <a
          className="button secondary"
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
        >
          {copy.profileAction}
        </a>
        {result.articles.length > 0 && (
          <Link className="text-link" href="/blog">
            {copy.allArticles}
          </Link>
        )}
      </div>
    </section>
  );
}
export default async function WritingLoader({ articles, social, copy, blogCopy }) {
  return (
    <Writing
      result={await getArticles(articles.provider.username)}
      profileUrl={social.dev}
      copy={copy}
      blogCopy={blogCopy}
    />
  );
}
