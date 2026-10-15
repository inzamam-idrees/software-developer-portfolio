import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// ── Decorative Coding-theme code syntax (part of the visual design, not copy) ──
export const DECORATIVE_TOKENS = Object.freeze([
  "const",
  "coder",
  "name:",
  "skills:",
  "hireable:",
  "true",
  "false",
  "function",
  "return",
  "this.",
  "skills.length",
  "project",
  "tools:",
  "myRole:",
  "Description:",
  "Demo:",
  "features:",
  "tasks:",
  "N/A",
]);

// Literals that are protocol or keyboard identifiers rather than visible copy.
export const NON_COPY_LITERALS = Object.freeze([
  "Escape",
  "Content-Type",
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

const COPY_ATTRIBUTES = ["aria-label", "alt", "title", "placeholder", "description"];
const hasLetters = /[A-Za-z]/;

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

function isDecorative(text) {
  return DECORATIVE_TOKENS.includes(text.trim());
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`])\/\/[^\n]*/g, (match, lead) =>
      lead + match.slice(lead.length).replace(/[^\n]/g, " "),
    );
}

export function findHardcodedCopy(source) {
  const code = stripComments(source);
  const findings = [];

  // JSX text: characters after a tag's closing ">" or an expression's "}"
  // up to the next "<" or "{".
  const textPattern = /((?<![=\-])>|\})([^<>{}]+)(?=[<{])/g;
  for (const match of code.matchAll(textPattern)) {
    const afterExpression = match[1] === "}";
    const text = match[2]
      .replace(/&(?:amp|lt|gt|quot|apos|nbsp|ldquo|rdquo|rsquo);/g, "&")
      .replace(/\s+/g, " ")
      .trim();
    if (!text || !hasLetters.test(text) || isDecorative(text)) continue;
    if (/[;=]|&&|\|\||\(\s*$|^[\w.]+\.\w+$/.test(text)) continue;
    if (afterExpression && /^(?:else|catch|finally)\b|[[\]",()]/.test(text)) continue;
    findings.push({ line: lineOf(code, match.index), text });
  }

  // Copy-bearing attributes with string or template literals.
  const attributes = COPY_ATTRIBUTES.join("|");
  const literalAttribute = new RegExp(`\\b(${attributes})=("([^"]*)"|\\{\`([^\`]*)\`\\})`, "g");
  for (const match of code.matchAll(literalAttribute)) {
    const value = (match[3] ?? match[4]).replace(/\$\{[^}]*\}/g, "");
    if (!hasLetters.test(value)) continue;
    findings.push({ line: lineOf(code, match.index), text: `${match[1]}=${match[2]}` });
  }

  // String-literal props and children such as title="…" on custom components
  // or {"…"} expressions holding sentences.
  const sentenceLiteral = /\{\s*"([^"]*[A-Za-z][^"]*\s[^"]*)"\s*\}/g;
  for (const match of code.matchAll(sentenceLiteral)) {
    findings.push({ line: lineOf(code, match.index), text: match[1] });
  }

  // Display strings held in JavaScript: quoted literals that start with an
  // uppercase letter (class names, paths, and attribute keywords are lowercase).
  const displayLiteral = /(["'])(\s*[A-Z][^"'\n]*?[A-Za-z][^"'\n]*)\1/g;
  for (const match of code.matchAll(displayLiteral)) {
    const lineStart = code.lastIndexOf("\n", match.index) + 1;
    const lineText = code.slice(lineStart, code.indexOf("\n", match.index));
    if (/^\s*import\b|className=|\b(?:aria-label|alt|title|placeholder|description)=["']/.test(lineText)) continue;
    if (isDecorative(match[2]) || NON_COPY_LITERALS.includes(match[2].trim())) continue;
    if (/new Error\(|"@(?:type|context)"/.test(lineText)) continue;
    if (/\bd=["']/.test(lineText) || /^[A-Za-z0-9]+_[A-Za-z0-9_]+$/.test(match[2])) continue;
    findings.push({ line: lineOf(code, match.index), text: match[2] });
  }

  // Template literals in JavaScript whose static text contains words.
  const templateLiteral = /`([^`]*)`/g;
  for (const match of code.matchAll(templateLiteral)) {
    const lineStart = code.lastIndexOf("\n", match.index) + 1;
    const lineText = code.slice(lineStart, code.indexOf("\n", match.index));
    if (/className=|\b(?:aria-label|alt|title|placeholder|description)=\{|identifier=|key=|path:/.test(lineText)) continue;
    const staticText = match[1].replace(/\$\{[^}]*\}/g, " ").trim();
    if (!/[A-Za-z]{2,}/.test(staticText) || !/\s/.test(match[1].replace(/\$\{[^}]*\}/g, "")) ) continue;
    findings.push({ line: lineOf(code, match.index), text: match[1] });
  }

  return findings;
}

async function listSources(directory, pattern = /\.jsx$/) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return listSources(target, pattern);
      return pattern.test(target) ? [target] : [];
    }),
  );
  return nested.flat();
}

export async function scanThemeSources(root = process.cwd()) {
  const files = [
    ...(await listSources(path.join(root, "themes"))),
    ...(await listSources(path.join(root, "app/components"))),
    ...(await listSources(path.join(root, "app/(portfolio)"), /\.jsx?$/)),
    path.join(root, "app/not-found.jsx"),
    path.join(root, "app/social-image/route.js"),
  ].sort();
  const results = [];
  for (const file of files) {
    const findings = findHardcodedCopy(await readFile(file, "utf8"));
    for (const finding of findings) {
      results.push({ file: path.relative(root, file), ...finding });
    }
  }
  return results;
}
