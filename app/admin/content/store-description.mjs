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
