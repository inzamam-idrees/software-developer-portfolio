import Image from "next/image";
import { personalData } from "@/utils/data/personal-data";
import ChapterHeading from "../ui/chapter-heading";
export default function About() {
  return (
    <section
      id="about"
      className="chapter container"
      aria-labelledby="about-heading"
    >
      <div className="about-grid">
        <div data-reveal>
          <ChapterHeading id="about" number="02" title="A builder at heart." />
          <p className="about-lead">
            The best software makes complexity feel simple.
          </p>
          <div className="about-story">
            <p className="body-copy">
              Over five years, I’ve designed, developed, and maintained
              responsive web applications with Angular, React, Next.js,
              Node.js, Express, and NestJS.
            </p>
            <p className="body-copy">
              I enjoy turning complex product needs into clear interfaces and
              maintainable systems, working with cross-functional teams from
              the first idea through delivery.
            </p>
          </div>
          <a
            className="text-link"
            href={personalData.linkedIn}
            target="_blank"
            rel="noreferrer"
          >
            More about my journey ↗
          </a>
        </div>
        <figure className="portrait">
          <Image
            src={personalData.profile}
            width={480}
            height={560}
            sizes="(max-width: 767px) 90vw, 360px"
            quality={85}
            alt="Inzamam Idrees, Senior Software Engineer"
          />
          <figcaption>
            <span>INZAMAM IDREES</span>
            <span>LAHORE, PAKISTAN</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
