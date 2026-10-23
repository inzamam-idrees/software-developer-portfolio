import {
  SiHtml5, SiCss3, SiJavascript, SiTypescript, SiAngular, SiReact,
  SiNextdotjs, SiRedux, SiNodedotjs, SiExpress, SiNestjs, SiPhp,
  SiIonic, SiTailwindcss, SiMongodb, SiMysql, SiPostgresql, SiGit,
  SiBootstrap,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import Icon from "./icon";

const icons = {
  html: SiHtml5,
  css: SiCss3,
  javascript: SiJavascript,
  typescript: SiTypescript,
  angular: SiAngular,
  react: SiReact,
  nextjs: SiNextdotjs,
  redux: SiRedux,
  nodejs: SiNodedotjs,
  express: SiExpress,
  nestjs: SiNestjs,
  php: SiPhp,
  ionic: SiIonic,
  tailwindcss: SiTailwindcss,
  mongodb: SiMongodb,
  mysql: SiMysql,
  postgresql: SiPostgresql,
  git: SiGit,
  aws: FaAws,
  bootstrap: SiBootstrap,
};

export default function SkillIcon({ name }) {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const Component = icons[key];
  return Component
    ? <Component aria-hidden="true" focusable="false" />
    : <Icon name="code" />;
}
