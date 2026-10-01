export default function BlogCard({ blog, headingLevel = 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="writing-card">
      <p className="eyebrow muted">
        {blog.published_at
          ? new Date(blog.published_at).toISOString().slice(0, 10)
          : "FROM THE NOTEBOOK"}
        {blog.reading_time_minutes
          ? " / " + blog.reading_time_minutes + " MIN READ"
          : ""}
      </p>
      <div className="writing-copy">
        <Heading>
          <a href={blog.url} target="_blank" rel="noreferrer">
            <span>{blog.title}</span>
            <span className="writing-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        </Heading>
        {blog.description && <p className="body-copy">{blog.description}</p>}
      </div>
    </article>
  );
}
