import Link from "next/link";
export default function Footer({ profile, site }) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()} {profile.name}{" "}
          <span className="muted">/ Built with intention.</span>
        </p>
        <nav aria-label="Footer navigation">
          <Link href="/#education">Education</Link>
          <Link href="/blog">Writing</Link>
          <a
            href={site.repositoryUrl}
            target="_blank"
            rel="noreferrer"
          >
            Source ↗
          </a>
          <Link href="/#hero">Back to top ↑</Link>
        </nav>
      </div>
    </footer>
  );
}
