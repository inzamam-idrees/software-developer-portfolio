import Image from "next/image";
import { BsHeartFill } from "react-icons/bs";
import { FaCommentAlt } from "react-icons/fa";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { timeConverter } from "@/utils/time-converter";

export default function CodingBlogCard({ blog, copy }) {
  return (
    <article
      className="border border-[#1d293a] hover:border-[#464c6a] transition-all duration-500 bg-[#1b203e] rounded-lg relative group overflow-hidden"
      data-coding-blog-card="true"
    >
      {blog.cover_image && (
        <a
          className="block h-44 lg:h-52 w-auto overflow-hidden rounded-t-lg"
          href={blog.url}
          target="_blank"
          rel="noreferrer"
          aria-label={formatCopy(copy.articles.readArticle, { title: blog.title })}
        >
          <Image
            src={blog.cover_image}
            height={1080}
            width={1920}
            alt=""
            className="h-full w-full object-cover group-hover:scale-110 transition-all duration-300"
          />
        </a>
      )}
      <div className="p-2 sm:p-3 flex flex-col">
        <div
          className="flex justify-between items-center gap-3 text-[#16f2b3] text-sm"
          data-coding-blog-engagement="true"
        >
          <p>{blog.published_at
              ? timeConverter(blog.published_at)
              : copy.blog.fallbackDate}</p>
          <div className="flex items-center gap-3 shrink-0">
            <p className="flex items-center gap-1">
              <BsHeartFill aria-hidden="true" />
              <span>{blog.public_reactions_count}</span>
            </p>
            {blog.comments_count > 0 && (
              <p className="flex items-center gap-1">
                <FaCommentAlt aria-hidden="true" />
                <span>{blog.comments_count}</span>
              </p>
            )}
          </div>
        </div>
        <h2 className="my-2 lg:my-3 text-lg text-white sm:text-xl font-medium hover:text-violet-500">
          <a href={blog.url} target="_blank" rel="noreferrer">
            {blog.title}
          </a>
        </h2>
        {blog.reading_time_minutes && (
          <p className="mb-2 text-sm text-[#16f2b3]">
            {formatCopy(copy.blog.readingTime, {
              minutes: blog.reading_time_minutes,
            })}
          </p>
        )}
        {blog.description && (
          <p className="text-sm lg:text-base text-[#d3d8e8] pb-3 lg:pb-6 line-clamp-3">
            {blog.description}
          </p>
        )}
      </div>
    </article>
  );
}
