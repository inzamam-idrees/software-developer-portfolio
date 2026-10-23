import { formatCopy } from "@/lib/portfolio/format-copy.mjs";

export default function SkillLevel({ name, proficiency, template }) {
  const level = proficiency?.[name];
  return level == null ? null : <small className="portfolio-skill-level">{formatCopy(template, { level })}</small>;
}
