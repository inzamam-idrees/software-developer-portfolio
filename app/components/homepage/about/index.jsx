// @flow strict

import Image from "next/image";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import Expandable from "../expandable";

// ── Helpers ──
const LEAD_SENTENCES = 2;

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function toParagraphs(sentences, size) {
  const paragraphs = [];
  for (let index = 0; index < sentences.length; index += size) {
    paragraphs.push(sentences.slice(index, index + size).join(" "));
  }
  return paragraphs;
}

function AboutSection({ personalData, copy }) {
  const sentences = splitSentences(personalData.description);
  const lead = sentences.slice(0, LEAD_SENTENCES).join(" ");
  const rest = toParagraphs(sentences.slice(LEAD_SENTENCES), 2);

  return (
    <section id="about" aria-labelledby="about-title" className="my-12 lg:my-16 relative">
      <div className="hidden lg:flex flex-col items-center absolute top-16 -right-8" aria-hidden="true">
        <span className="bg-[#1a1443] w-fit text-white rotate-90 p-2 px-5 text-xl rounded-md">
          {copy.rail}
        </span>
        <span className="h-36 w-[2px] bg-[#1a1443]"></span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="order-2 lg:order-1 max-w-[65ch]">
          <h2 id="about-title" className="font-medium mb-5 text-[#16f2b3] text-xl">
            {copy.heading}
          </h2>
          <p className="text-gray-200 text-sm lg:text-lg leading-relaxed">
            {lead}
          </p>
          {rest.length > 0 && (
            <Expandable
              showLabel={copy.readMore}
              hideLabel={copy.readLess}
              className="mt-4 space-y-4 text-gray-200 text-sm lg:text-lg leading-relaxed"
            >
              {rest.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Expandable>
          )}
        </div>
        <div className="flex justify-center items-start order-1 lg:order-2">
          <Image
            src={personalData.profile}
            width={280}
            height={280}
            sizes="280px"
            alt={formatCopy(copy.portraitAlt, { name: personalData.name })}
            className="h-auto w-[240px] lg:w-[280px] aspect-square object-cover rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
