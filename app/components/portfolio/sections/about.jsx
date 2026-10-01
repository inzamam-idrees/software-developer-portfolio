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
          <p className="body-copy">{personalData.description}</p>
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
