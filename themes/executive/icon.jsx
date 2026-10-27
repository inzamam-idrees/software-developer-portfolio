/** Decorative glyphs share one stroke language; surrounding controls supply names. */
export default function ExecutiveIcon({ kind = "arrow" }) {
  return <svg className="executive-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "download" ? <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" /> : kind === "pause" ? <path d="M9 5v14M15 5v14" /> : kind === "play" ? <path d="m8 5 11 7-11 7Z" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
  </svg>;
}
