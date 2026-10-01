export default function BlogCard({blog}) {
 return <article className="writing-card"><p className="eyebrow muted">{blog.published_at?new Date(blog.published_at).toISOString().slice(0,10):'FROM THE NOTEBOOK'}{blog.reading_time_minutes?' / '+blog.reading_time_minutes+' MIN READ':''}</p><h3><a href={blog.url} target="_blank" rel="noreferrer">{blog.title}<span aria-hidden="true"> ↗</span></a></h3>{blog.description&&<p className="body-copy">{blog.description}</p>}</article>;
}
