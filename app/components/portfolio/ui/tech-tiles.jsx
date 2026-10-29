import {
  SiAngular, SiCss3, SiDocker, SiExpress, SiFigma, SiGit, SiHtml5, SiJavascript,
  SiLaravel, SiMongodb, SiMysql, SiNestjs, SiNextdotjs, SiNodedotjs, SiPhp,
  SiPostgresql, SiPython, SiReact, SiTailwindcss, SiTypescript,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import { FiCode } from "react-icons/fi";

const icons = {
  html: SiHtml5, css: SiCss3, javascript: SiJavascript, typescript: SiTypescript,
  angular: SiAngular, react: SiReact, nextjs: SiNextdotjs, nodejs: SiNodedotjs,
  express: SiExpress, nestjs: SiNestjs, php: SiPhp, laravel: SiLaravel,
  python: SiPython, docker: SiDocker, mongodb: SiMongodb, mysql: SiMysql,
  postgresql: SiPostgresql, git: SiGit, aws: FaAws, tailwindcss: SiTailwindcss,
  figma: SiFigma,
};

const key = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Floating glass tiles for the highlighted technologies in the canonical skills data. */
export default function TechTiles({ tiles, label }) {
  if (!tiles.length) return null;
  return (
    <ul className="tech-tiles" aria-label={label}>
      {tiles.map(({ name, category }, index) => {
        const Icon = icons[key(name)] ?? FiCode;
        return (
          <li key={name} className="tech-tile" style={{ "--i": index }} data-reveal>
            <span className="tech-tile-glass">
              <Icon aria-hidden="true" focusable="false" />
            </span>
            <span className="tech-tile-name">{name}</span>
            {category && <span className="tech-tile-category">{category}</span>}
          </li>
        );
      })}
    </ul>
  );
}
