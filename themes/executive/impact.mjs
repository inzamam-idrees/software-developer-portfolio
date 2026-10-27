import { createElement } from "react";

/** No wrapper or whitespace is rendered for an unknown result. */
export function ExecutiveImpact({ outcome, label }) {
  if (typeof outcome !== "string" || !outcome.trim()) return null;
  return createElement("p", { className: "executive-role-impact" },
    createElement("strong", null, label), outcome);
}
