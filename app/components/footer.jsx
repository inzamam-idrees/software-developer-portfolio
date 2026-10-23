import Link from "next/link";
export default function Footer({ profile, site, copy }) {
  const footer = copy.footer;
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()} {profile.name}{" "}
          <span className="muted">{footer.tagline}</span>
        </p>
        <nav aria-label={copy.navigation.footer}>
          <Link href="/#education">{footer.education}</Link>
          <Link href="/blog">{footer.writing}</Link>
          <a
            href={site.repositoryUrl}
            target="_blank"
            rel="noreferrer"
          >
            {footer.source}
          </a>
          <Link href="/#hero">{footer.backToTop}</Link>
        </nav>
      </div>
    </footer>
  );
}
