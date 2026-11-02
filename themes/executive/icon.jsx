/** Decorative glyphs share one stroke language; surrounding controls supply names. */
function glyph(kind) {
  switch (kind) {
    case "download": return <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" />;
    case "pause": return <path d="M9 5v14M15 5v14" />;
    case "play": return <path d="m8 5 11 7-11 7Z" />;
    case "up": return <path d="M12 19V5m-6 6 6-6 6 6" />;
    case "mail": return <path d="M4 6h16v12H4zM4 7l8 6 8-6" />;
    case "pin": return <path d="M12 21s-6-5.400-6-11a6 6 0 0 1 12 0c0 5.600-6 11-6 11Zm0-8.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5Z" />;
    case "briefcase": return <path d="M4 8h16v11H4zM9 8V5h6v3M4 13h16" />;
    case "layers": return <path d="m12 3 9 5-9 5-9-5ZM3 13l9 5 9-5M3 17.500l9 5 9-5" />;
    case "award": return <path d="M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM8.500 13.500 7 21l5-3 5 3-1.500-7.500" />;
    case "code": return <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />;
    case "cap": return <path d="m2 9 10-5 10 5-10 5ZM6 11.500V16c0 1.500 3 3 6 3s6-1.500 6-3v-4.500M22 9v6" />;
    case "user": return <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0" />;
    case "spark": return <path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" />;
    case "external": return <path d="M8 16 17 7m-8 0h8v8" />;
    default: return <path d="M5 12h14M13 6l6 6-6 6" />;
  }
}

export default function ExecutiveIcon({ kind = "arrow" }) {
  return <svg className="executive-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{glyph(kind)}</svg>;
}
