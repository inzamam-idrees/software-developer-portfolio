import Link from "next/link";
import { personalData } from "@/utils/data/personal-data";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()} Inzamam Idrees{" "}
          <span className="muted">/ Built with intention.</span>
        </p>
        <nav aria-label="Footer navigation">
          <Link href="/#education">Education</Link>
          <Link href="/blog">Writing</Link>
          <a
            href={personalData.github + "/software-developer-portfolio"}
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
