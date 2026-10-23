import Image from "next/image";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";

export default function About({ view }) {
  const { profile, about, copy, displayLocation } = view;
  return (
    <section className="spatial-section" id="about" aria-labelledby="spatial-about-title">
      <div className="spatial-frame spatial-letter">
        <h2 id="spatial-about-title" className="spatial-section-title">
          {copy.home.about.heading}
        </h2>
        <div className="spatial-letter-body">
          <Image
            className="spatial-portrait"
            src={profile.image}
            alt={formatCopy(copy.home.about.portraitAlt, { name: profile.name })}
            width={88}
            height={88}
          />
          <p className="spatial-lead">{about.summary}</p>
          <p>{profile.longIntroduction}</p>
          {!profile.longIntroduction.includes(about.personalStatement) && <p>{about.personalStatement}</p>}
          <p>{about.engineeringPhilosophy}</p>
          <p className="spatial-signoff">
            <span>{profile.name}</span>
            <span>{displayLocation}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
