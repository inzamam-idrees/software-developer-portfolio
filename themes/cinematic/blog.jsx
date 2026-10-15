import BlogCard from "@/app/components/homepage/blog/blog-card";
import { getArticles } from "@/lib/articles.mjs";
import { createCinematicView } from "./view.mjs";

export default async function CinematicBlog({ portfolio }) {
  const { articles, social, copy } = createCinematicView(portfolio);
  const result = await getArticles(articles.provider.username);

  return (
    <div className="container route-page">
      <p className="eyebrow accent">{copy.blog.eyebrow}</p>
      <h1>{copy.blog.heading}</h1>
      {result.articles.length ? (
        <div className="writing-grid">
          {result.articles.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              copy={copy.blog}
              headingLevel={2}
            />
          ))}
        </div>
      ) : (
        <p className="body-copy">
          {result.status === "empty" ? copy.blog.empty : copy.blog.unavailable}
        </p>
      )}
      <a
        className="button secondary writing-actions"
        href={social.dev}
        target="_blank"
        rel="noreferrer"
      >
        {copy.blog.profileAction}
      </a>
    </div>
  );
}
