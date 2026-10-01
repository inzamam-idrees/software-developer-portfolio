import SceneFallback from "../scene/scene-fallback";
import { personalData } from "@/utils/data/personal-data";
import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";
export default function Hero() {
  return (
    <section id="hero" className="hero container" aria-labelledby="hero-title">
      <div className="hero-top hero-metadata">
        <p className="eyebrow">
          <span className="status-dot" aria-hidden="true" />
          OVER 5 YEARS <span aria-hidden="true">/</span> FULL-STACK ENGINEERING
        </p>
        <p className="eyebrow hero-coordinate">
          {personalData.designation} <span aria-hidden="true">/</span>{" "}
          LAHORE, PAKISTAN
        </p>
      </div>
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-name">INZAMAM IDREES</p>
          <h1 id="hero-title" data-reveal>
            Engineering
            <br />
            with <span className="serif-word">intention.</span>
          </h1>
          <p className="hero-description" data-reveal>
            I build thoughtful interfaces and the systems behind them. From a
            first interaction to a scalable application.
          </p>
          <div className="actions" data-reveal>
            <a className="button primary" href="#projects">
              Explore my work <FiArrowDownRight aria-hidden="true" />
            </a>
            <a
              className="button secondary"
              href={personalData.resume}
              target="_blank"
              rel="noreferrer"
            >
              Résumé <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <SceneFallback />
          <span className="visual-caption">
            SYSTEM_01 <span>INTERFACE → INFRASTRUCTURE</span>
          </span>
        </div>
      </div>
      <div className="hero-bottom">
        <p>
          Frontend precision.
          <br />
          <span className="muted">Full-stack perspective.</span>
        </p>
        <div className="hero-tech">ANGULAR / REACT / NEXT.JS / NODE.JS</div>
        <a href="#projects" className="scroll-cue">
          SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
