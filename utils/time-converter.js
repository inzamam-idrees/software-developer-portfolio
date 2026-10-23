const UNITS = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

// Locale-aware and correctly pluralised ("1 year ago", "yesterday").
export function timeConverter(isoTime, locale = "en", now = Date.now()) {
  const seconds = Math.round((new Date(isoTime).getTime() - now) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === "second") {
      return format.format(Math.trunc(seconds / size), unit);
    }
  }
}
