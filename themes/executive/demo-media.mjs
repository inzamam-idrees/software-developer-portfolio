// Temporary sample screenshots for projects whose canonical `image` is still null.
// Delete this fallback once every project supplies its own screenshot.
const DEMO_BASE = "https://placehold.co/960x600/151b20/e7b65f/png";

export function demoScreenshot(title) {
  return `${DEMO_BASE}?text=${encodeURIComponent(title).replace(/%20/g, "+")}`;
}
