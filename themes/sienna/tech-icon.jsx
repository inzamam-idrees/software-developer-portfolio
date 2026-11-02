import {
  SiLaravel, SiReact, SiAngular, SiNodedotjs, SiTypescript, SiPython, SiJavascript, SiHtml5, SiCss3,
  SiNextdotjs, SiRedux, SiExpress, SiNestjs, SiPhp, SiCodeigniter, SiIonic, SiTailwindcss, SiBootstrap,
  SiMongodb, SiMysql, SiPostgresql, SiGit, SiDocker, SiFirebase, SiFastapi, SiFlask, SiDjango, SiGraphql,
  SiFigma, SiNginx, SiUbuntu, SiJquery, SiSass,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import { TbApi, TbPlugConnected, TbSpider, TbInfinity, TbSparkles, TbRobot, TbMessageCode, TbDatabaseSearch, TbVectorTriangle, TbWaveSine, TbPointer } from "react-icons/tb";
import { siMui, siPrimeng, siGooglecloud, siOpenai, siClaude, siGooglegemini, siGithubcopilot } from "simple-icons";
import Icon from "./icon";

// ── Skill tile marks ──
// Brand marks in brand colour, like the reference's logo tiles (drawn as SVG,
// no reference images). `null` colour = monochrome mark in the text colour so it
// stays visible in both modes.
const marks = {
  laravel: [SiLaravel, "#ff2d20"], react: [SiReact, "#61dafb"], angular: [SiAngular, "#dd0031"],
  nodejs: [SiNodedotjs, "#5fa04e"], typescript: [SiTypescript, "#3178c6"], python: [SiPython, "#3776ab"],
  javascript: [SiJavascript, "#f7df1e"], html: [SiHtml5, "#e34f26"], css: [SiCss3, "#1572b6"],
  nextjs: [SiNextdotjs, null], redux: [SiRedux, "#764abc"], express: [SiExpress, null],
  nestjs: [SiNestjs, "#e0234e"], php: [SiPhp, "#777bb4"], codeigniter: [SiCodeigniter, "#ef4223"],
  ionic: [SiIonic, "#3880ff"], tailwindcss: [SiTailwindcss, "#06b6d4"], bootstrap: [SiBootstrap, "#7952b3"],
  mongodb: [SiMongodb, "#47a248"], mysql: [SiMysql, "#4479a1"], postgresql: [SiPostgresql, "#4169e1"],
  git: [SiGit, "#f05032"], docker: [SiDocker, "#2496ed"], firebase: [SiFirebase, "#ffca28"],
  fastapi: [SiFastapi, "#009688"], flask: [SiFlask, null], django: [SiDjango, "#44b78b"],
  graphql: [SiGraphql, "#e10098"], figma: [SiFigma, "#a259ff"], nginx: [SiNginx, "#009639"],
  ubuntu: [SiUbuntu, "#e95420"], jquery: [SiJquery, "#0769ad"], scss: [SiSass, "#cc6699"],
  aws: [FaAws, "#ff9900"],
  // Practices without a brand: descriptive glyphs.
  restapis: [TbApi, null], websockets: [TbPlugConnected, null], webscraping: [TbSpider, null],
  cicd: [TbInfinity, null], genai: [TbSparkles, null], agenticai: [TbRobot, null],
  promptengineering: [TbMessageCode, null], rag: [TbDatabaseSearch, null], vectordb: [TbVectorTriangle, null],
  vibecoding: [TbWaveSine, null],
  // No CC0 Cursor mark ships in the installed icon sets; a neutral pointer glyph stands in.
  cursor: [TbPointer, null],
};

const simpleMarks = Object.fromEntries([
  ["materialui", siMui], ["primeng", siPrimeng], ["googlecloud", siGooglecloud], ["openai", siOpenai],
  ["claude", siClaude], ["gemini", siGooglegemini], ["githubcopilot", siGithubcopilot],
].map(([key, icon]) => [key, { path: icon.path, color: icon.hex === "000000" ? null : `#${icon.hex}` }]));

export default function TechIcon({ name }) {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const brand = simpleMarks[key];
  if (brand) return <svg className="sienna-tech-icon" style={brand.color ? { color: brand.color } : undefined} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d={brand.path} /></svg>;
  const mark = marks[key];
  if (!mark) return <Icon name="code" className="sienna-tech-icon" />;
  const [Component, color] = mark;
  return <Component className="sienna-tech-icon" style={color ? { color } : undefined} aria-hidden="true" focusable="false" />;
}
