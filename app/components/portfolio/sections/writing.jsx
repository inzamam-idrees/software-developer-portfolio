import Link from "next/link";
import { personalData } from "@/utils/data/personal-data";
import { getArticles } from "@/lib/articles.mjs";
import ChapterHeading from "../ui/chapter-heading";
import BlogCard from "../../homepage/blog/blog-card";
export function Writing({ result }) {
  return (
    <section
      id="writing"
      className="chapter container"
      aria-labelledby="writing-heading"
    >
      <ChapterHeading
        id="writing"
        number="06"
        title="Notes from the work."
        description="Ideas, observations, and lessons from building software."
      />
      {result.articles.length ? (
        <div className="writing-grid">
          {result.articles.slice(0, 3).map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <p className="body-copy">
          {result.status === "empty"
            ? "My writing lives on DEV. Explore the notebook there."
            : "The notebook is temporarily unavailable here. You can visit my DEV profile directly."}
        </p>
      )}
      <div className="actions writing-actions">
        <a
          className="button secondary"
          href={"https://dev.to/" + personalData.devUsername}
          target="_blank"
          rel="noreferrer"
        >
          Visit my notebook ↗
        </a>
        {result.articles.length > 0 && (
          <Link className="text-link" href="/blog">
            All articles ↗
          </Link>
        )}
      </div>
    </section>
  );
}
export default async function WritingLoader() {
  return <Writing result={await getArticles(personalData.devUsername)} />;
}
