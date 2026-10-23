export function describeStore(store) {
  if (!store) return "Content storage is not configured correctly.";
  if (store.kind === "filesystem") {
    return "Saves to local files and is live immediately.";
  }
  if (store.kind === "github") {
    return "Saves as a GitHub commit; changes go live after Netlify redeploys.";
  }
  return "Read-only: content editing is not configured for this deployment.";
}

const STORE_BADGES = Object.freeze({
  filesystem: { title: "Local files", detail: "Saves go live immediately" },
  github: { title: "GitHub commits", detail: "Live after the next deploy" },
  readonly: { title: "Read-only", detail: "Editing is turned off" },
});

/** Short label for the shell's storage badge. */
export function storeBadge(store) {
  if (!store) return { kind: "error", title: "Storage error", detail: "Check the store settings" };
  return { kind: store.kind, ...(STORE_BADGES[store.kind] ?? STORE_BADGES.readonly) };
}
