import { canonicalMetadata } from "@/lib/site-origin.mjs";
import { personalData } from "@/utils/data/personal-data";
import { getArticles } from "@/lib/articles.mjs";
import BlogCard from "../components/homepage/blog/blog-card";
export const metadata = {
  ...canonicalMetadata("/blog"),
  title: "Writing | Inzamam Idrees",
};
export default async function BlogPage() {
  const result = await getArticles(personalData.devUsername);
  return (
    <div className="container route-page">
      <p className="eyebrow accent">THE NOTEBOOK</p>
      <h1>Thinking out loud.</h1>
      {result.articles.length ? (
        <div className="writing-grid">
          {result.articles.map((blog) => (
            <BlogCard key={blog.id} blog={blog} headingLevel={2} />
          ))}
        </div>
      ) : (
        <p className="body-copy">
          {result.status === "empty"
            ? "No articles to show here yet. Explore my DEV profile."
            : "Articles are temporarily unavailable. My DEV profile is still a click away."}
        </p>
      )}
      <a
        className="button secondary writing-actions"
        href={"https://dev.to/" + personalData.devUsername}
        target="_blank"
        rel="noreferrer"
      >
        Visit DEV ↗
      </a>
    </div>
  );
}
