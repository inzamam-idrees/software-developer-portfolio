import { randomBytes } from "node:crypto";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { createPasswordHash } from "./auth.mjs";

function replaceSetting(source, name, value) {
  const pattern = new RegExp(`^(?:export\\s+)?${name}\\s*=.*$`, "gm");
  let replaced = false;
  const result = source.replace(pattern, () => {
    if (replaced) return "";
    replaced = true;
    return `${name}="${value}"`;
  });
  return replaced ? result : `${result}${result && !result.endsWith("\n") ? "\n" : ""}${name}="${value}"\n`;
}

export async function resetLocalAdminPassword({ root, password, confirmation }) {
  if (password !== confirmation) throw new Error("Passwords do not match. Nothing changed.");
  const hash = await createPasswordHash(password);
  const file = path.join(root, ".env.local");
  let source;
  try { source = await readFile(file, "utf8"); }
  catch (error) { if (error.code !== "ENOENT") throw error; source = ""; }
  // Next expands dollar signs in dotenv files, including quoted values.
  source = replaceSetting(source, "PORTFOLIO_ADMIN_PASSWORD_HASH", hash.replaceAll("$", "\\$"));
  source = replaceSetting(source, "PORTFOLIO_ADMIN_SESSION_SECRET", randomBytes(48).toString("base64url"));
  const temporary = `${file}.${randomBytes(12).toString("hex")}.tmp`;
  try {
    await writeFile(temporary, source, { mode: 0o600, flag: "wx" });
    await rename(temporary, file);
  } finally {
    await unlink(temporary).catch((error) => { if (error.code !== "ENOENT") throw error; });
  }
}
