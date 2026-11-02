"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { useSceneState } from "../motion/scene-context";

// ── Helpers ──
function reducedMotion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ProjectCarousel({ items, labels }) {
  const sceneRef = useSceneState();
  const track = useRef(null);
  const [active, setActive] = useState(0);

  const select = useCallback(
    (index) => {
      setActive(index);
      if (sceneRef) sceneRef.current.projectFocus = index;
    },
    [sceneRef],
  );

  // The card nearest the track's centre is the active one.
  useEffect(() => {
    const element = track.current;
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const mid = element.scrollLeft + element.clientWidth / 2;
        let best = 0;
        let distance = Infinity;
        [...element.children].forEach((card, index) => {
          const gap = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
          if (gap < distance) {
            distance = gap;
            best = index;
          }
        });
        select(best);
      });
    };
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      element.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [select]);

  const go = (step) => {
    const next = Math.min(items.length - 1, Math.max(0, active + step));
    const card = track.current.children[next];
    card?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <div className="project-carousel" role="group" aria-roledescription="carousel" aria-label={labels.label}>
      <div className="carousel-controls">
        <button type="button" onClick={() => go(-1)} disabled={active === 0} aria-label={labels.previous}>
          <FiArrowLeft aria-hidden="true" />
        </button>
        <p className="carousel-position" aria-live="polite">
          {formatCopy(labels.position, { current: active + 1, total: items.length })}
        </p>
        <button type="button" onClick={() => go(1)} disabled={active === items.length - 1} aria-label={labels.next}>
          <FiArrowRight aria-hidden="true" />
        </button>
      </div>
      <div className="carousel-track" ref={track} tabIndex={0}>
        {items.map((item, index) => (
          <article
            key={item.id}
            className="project-card"
            data-project-screen
            data-active={index === active ? "" : undefined}
            aria-roledescription="slide"
            aria-label={formatCopy(labels.position, { current: index + 1, total: items.length })}
          >
            <div className="project-laptop" aria-hidden="true">
              <Image
                src={item.image ?? `/cinematic/laptop-${index % 4}.webp`}
                alt=""
                width={960}
                height={600}
                sizes="(max-width: 767px) 86vw, 520px"
              />
            </div>
            <div className="project-card-body">
              <p className="eyebrow accent">{item.category}</p>
              <h3>
                <Link href={item.href}>{item.title}</Link>
              </h3>
              <p className="project-card-lead">{item.lead}</p>
              <ul className="technology-list" aria-label={item.technologiesLabel}>
                {item.technologies.slice(0, 5).map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
              <div className="project-links">
                <Link href={item.href}>{labels.details}</Link>
                {item.demo && (
                  <a href={item.demo} target="_blank" rel="noreferrer">
                    {labels.visit} <FiArrowUpRight aria-hidden="true" />
                  </a>
                )}
                {item.source && (
                  <a href={item.source} target="_blank" rel="noreferrer">
                    {labels.source} <FiArrowUpRight aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
