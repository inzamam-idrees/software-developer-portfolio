import {
  SiLaravel, SiReact, SiAngular, SiNodedotjs, SiTypescript, SiPython,
  SiJavascript, SiHtml5, SiCss3, SiNextdotjs, SiRedux, SiExpress, SiNestjs,
  SiPhp, SiCodeigniter, SiIonic, SiTailwindcss, SiBootstrap, SiMongodb,
  SiMysql, SiPostgresql, SiGit, SiDocker, SiFirebase, SiFastapi, SiFlask,
  SiDjango, SiGraphql, SiFigma, SiNginx, SiUbuntu, SiJquery, SiSass,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import { TbApi, TbPlugConnected, TbSpider, TbInfinity, TbSparkles, TbRobot, TbMessageCode, TbDatabaseSearch, TbVectorTriangle, TbWaveSine, TbPointer } from "react-icons/tb";
import { siMui, siPrimeng, siGooglecloud, siOpenai, siClaude, siGooglegemini, siGithubcopilot } from "simple-icons";
import Icon from "./icon";

// ── Brand marks: [component, brand color] keyed by normalized skill name ──
const marks = {
  laravel: [SiLaravel, "#ff2d20"], react: [SiReact, "#149eca"], angular: [SiAngular, "#dd0031"],
  nodejs: [SiNodedotjs, "#5fa04e"], typescript: [SiTypescript, "#3178c6"], python: [SiPython, "#3776ab"],
  javascript: [SiJavascript, "#d4b106"], html: [SiHtml5, "#e34f26"], css: [SiCss3, "#1572b6"],
  nextjs: [SiNextdotjs, "#172033"], redux: [SiRedux, "#764abc"], express: [SiExpress, "#172033"],
  nestjs: [SiNestjs, "#e0234e"], php: [SiPhp, "#777bb4"], codeigniter: [SiCodeigniter, "#dd4814"],
  ionic: [SiIonic, "#3880ff"], tailwindcss: [SiTailwindcss, "#0ea5e9"], bootstrap: [SiBootstrap, "#7952b3"],
  mongodb: [SiMongodb, "#47a248"], mysql: [SiMysql, "#4479a1"], postgresql: [SiPostgresql, "#4169e1"],
  git: [SiGit, "#f05032"], docker: [SiDocker, "#2496ed"], firebase: [SiFirebase, "#dd8a00"],
  fastapi: [SiFastapi, "#009688"], flask: [SiFlask, "#172033"], django: [SiDjango, "#0c4b33"],
  graphql: [SiGraphql, "#e10098"], figma: [SiFigma, "#a259ff"], nginx: [SiNginx, "#009639"],
  ubuntu: [SiUbuntu, "#e95420"], jquery: [SiJquery, "#0769ad"], scss: [SiSass, "#cc6699"],
  aws: [FaAws, "#ff9900"],
  // Concept skills have no brand; these glyphs describe the practice.
  restapis: [TbApi, "#2563eb"], websockets: [TbPlugConnected, "#0f9d8a"], webscraping: [TbSpider, "#475569"],
  cicd: [TbInfinity, "#6a3fe6"], genai: [TbSparkles, "#c026d3"], agenticai: [TbRobot, "#6a3fe6"],
  promptengineering: [TbMessageCode, "#0f9d8a"], rag: [TbDatabaseSearch, "#2563eb"], vectordb: [TbVectorTriangle, "#d97706"],
  vibecoding: [TbWaveSine, "#db2777"],
  // No CC0 Cursor mark ships in the installed icon sets; a neutral pointer glyph stands in.
  cursor: [TbPointer, "#172033"],
};

// Official CC0 marks from simple-icons (also used by Executive); server-rendered SVG paths only.
const simpleMarks = Object.fromEntries([
  ["materialui", siMui], ["primeng", siPrimeng], ["googlecloud", siGooglecloud], ["openai", siOpenai],
  ["claude", siClaude], ["gemini", siGooglegemini], ["githubcopilot", siGithubcopilot],
].map(([key, icon]) => [key, { path: icon.path, color: icon.hex === "000000" ? "#172033" : `#${icon.hex}` }]));

export default function TechIcon({ name }) {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const brand = simpleMarks[key];
  if (brand) return <span className="creative-tech-icon" style={{ color: brand.color }}><svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d={brand.path} /></svg></span>;
  const mark = marks[key];
  if (!mark) return <span className="creative-tech-icon creative-tech-generic"><Icon name="code" /></span>;
  const [Component, color] = mark;
  return <span className="creative-tech-icon" style={{ color }}><Component aria-hidden="true" focusable="false" /></span>;
}
