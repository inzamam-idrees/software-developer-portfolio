import BlogCard from "@/app/components/homepage/blog/blog-card";
import { getArticles } from "@/lib/articles.mjs";
import { createCinematicView } from "./view.mjs";

export default async function CinematicBlog({ portfolio }) {
  const { articles, social } = createCinematicView(portfolio);
  const result = await getArticles(articles.provider.username);

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
        href={social.dev}
        target="_blank"
        rel="noreferrer"
      >
        Visit DEV ↗
      </a>
    </div>
  );
}
