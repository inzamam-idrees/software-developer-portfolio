import { getArticles } from "@/lib/articles.mjs";
import { createCodingView } from "./view.mjs";
import CodingBlogList from "./blog-list";

export default async function CodingBlog({ portfolio }) {
  const view = createCodingView(portfolio);
  const result = await getArticles(view.articles.provider.username);

  return result.articles.length ? (
    <CodingBlogList
      blogs={result.articles}
      copy={view.copy}
      showMore={false}
      routeTitle={view.copy.blog.routeHeading}
    />
  ) : (
    <section className="my-12 lg:my-24 text-white">
      <h1 className="text-3xl text-[#16f2b3] mb-5">
        {view.copy.blog.emptyHeading}
      </h1>
      <p>
        {result.status === "empty"
          ? view.copy.blog.empty
          : view.copy.blog.unavailable}{" "}
        <a
          className="text-[#16f2b3] hover:text-pink-500"
          href={view.social.dev}
          target="_blank"
          rel="noreferrer"
        >
          {view.copy.blog.profileAction}
        </a>
      </p>
    </section>
  );
}
