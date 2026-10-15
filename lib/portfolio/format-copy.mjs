export function formatCopy(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (!Object.hasOwn(values, key) || values[key] == null) {
      throw new Error(`Missing copy value: ${key}`);
    }
    return String(values[key]);
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function splitHeadline(headline, connector) {
  const separator = new RegExp(`\\s+${escapeRegExp(connector)}\\s+`, "i");
  const match = separator.exec(headline);
  if (!match) return [headline];
  return [
    headline.slice(0, match.index),
    headline.slice(match.index + match[0].length),
  ];
}
