import { emitKeypressEvents } from "node:readline";
import { fileURLToPath } from "node:url";
import { resetLocalAdminPassword } from "../lib/admin/local-password-reset.mjs";

function hiddenPrompt(label) {
  return new Promise((resolve, reject) => {
    let value = "";
    const wasRaw = process.stdin.isRaw;
    process.stdout.write(label);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const finish = (error) => {
      process.stdin.off("keypress", onKey);
      process.stdin.setRawMode(Boolean(wasRaw));
      process.stdin.pause();
      process.stdout.write("\n");
      if (error) reject(error); else resolve(value);
    };
    const onKey = (text, key = {}) => {
      if (key.ctrl && key.name === "c") { finish(new Error("Reset cancelled. Nothing changed.")); return; }
      if (key.name === "return" || key.name === "enter") { finish(); return; }
      if (key.name === "backspace" || key.name === "delete") { value = [...value].slice(0, -1).join(""); return; }
      if (!key.ctrl && !key.meta && text && !/[\x00-\x1f\x7f]/.test(text)) value += text;
    };
    process.stdin.on("keypress", onKey);
  });
}

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY || process.argv.length > 2) {
    throw new Error("Run npm run admin:password in your own interactive terminal. Password arguments and piped input are not accepted.");
  }
  emitKeypressEvents(process.stdin);
  process.stdout.write("Reset local portfolio admin password (12 characters minimum).\nTyping is hidden. No password is printed or stored as plaintext. Ctrl+C cancels.\n");
  const password = await hiddenPrompt("New password: ");
  const confirmation = await hiddenPrompt("Confirm password: ");
  await resetLocalAdminPassword({ root: fileURLToPath(new URL("../", import.meta.url)), password, confirmation });
  process.stdout.write("Local password reset. Only the hash was saved in .env.local.\nRestart your local server, then sign in at /admin/login. Previous sessions will no longer work.\n");
}

main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
