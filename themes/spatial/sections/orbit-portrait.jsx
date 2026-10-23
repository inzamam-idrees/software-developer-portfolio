import { createHash } from "node:crypto";
import Image from "next/image";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import portraitCharcoal from "../assets/portrait-charcoal-v2.png";
import { sourceUrlHash } from "../assets/portrait-alpha-source.mjs";

function Orbit({ foreground = false }) {
  return (
    <svg className={`spatial-portrait-orbit ${foreground ? "is-front" : "is-back"}`} viewBox="0 0 720 900" aria-hidden="true" focusable="false">
      {foreground && <defs><clipPath id="spatial-portrait-front"><rect x="0" y="470" width="720" height="430" /></clipPath></defs>}
      <g transform="rotate(-16 360 470)">
        <g clipPath={foreground ? "url(#spatial-portrait-front)" : undefined}>
          <ellipse className="spatial-portrait-orbit-line" cx="360" cy="470" rx="370" ry="150" />
          <ellipse className="spatial-portrait-orbit-echo" cx="360" cy="470" rx="380" ry="158" />
          <g transform="translate(360 470) scale(1 .4054)">
            <g className="spatial-portrait-satellite is-one"><circle cx="370" cy="0" r="9" /></g>
            <g className="spatial-portrait-satellite is-two"><circle cx="-370" cy="0" r="6" /></g>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default function OrbitPortrait({ profile, copy, location }) {
  const useVariant = createHash("sha256").update(profile.image).digest("hex") === sourceUrlHash;
  return (
    <figure className="spatial-orbit-portrait">
      <div className="spatial-portrait-scene" data-cutout={useVariant ? "true" : "false"}>
        <Orbit />
        <Image
          className="spatial-orbit-photo"
          src={useVariant ? portraitCharcoal : profile.image}
          alt={formatCopy(copy.home.about.portraitAlt, { name: profile.name })}
          width={800}
          height={800}
          sizes="(max-width: 699px) 90vw, (max-width: 1023px) 42vw, 500px"
          priority
        />
        <Orbit foreground />
      </div>
      <figcaption><span>{profile.name}</span><span>{location}</span></figcaption>
    </figure>
  );
}
