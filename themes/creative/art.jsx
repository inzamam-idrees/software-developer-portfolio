// ── Decorative artwork ──
// Purely visual SVG/CSS pieces; every element is hidden from assistive tech.

export function BrandMark() {
  return <svg className="creative-mark" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
    <rect x="4" y="5" width="6" height="18" rx="3" fill="#ffb84d" />
    <rect x="13" y="5" width="6" height="18" rx="3" fill="#7047eb" transform="rotate(18 16 14)" />
    <circle cx="23.5" cy="21.5" r="2.5" fill="#3b82f6" />
  </svg>;
}

// Looping brush scribble inside a w×h box; drawn with pathLength=1 so CSS can animate it.
const scribble = (x, y, w, h, n) => {
  const step = w / n;
  let d = `M${x} ${y + h}`;
  for (let i = 1; i <= n; i += 1) {
    const [fromX, toX, toY] = [x + step * (i - 1), x + step * i, i % 2 ? y : y + h];
    d += ` C${fromX + step * 0.3} ${i % 2 ? y + h : y} ${toX - step * 0.3} ${toY} ${toX} ${toY}`;
  }
  return d;
};

function Scribble({ x, y, w, h, angle, delay }) {
  const center = `${x + w / 2} ${y + h / 2}`;
  return <g className="creative-scribble" transform={`rotate(${angle} ${center})`} style={{ "--delay": `${delay}ms` }}>
    <path d={scribble(x, y, w, h, 6)} pathLength="1" strokeWidth="10" />
    <path d={scribble(x + 10, y + 8, w - 16, h - 12, 5)} pathLength="1" strokeWidth="5" className="creative-scribble-soft" />
    <path d={scribble(x - 4, y + 14, w - 8, h - 20, 7)} pathLength="1" strokeWidth="3" className="creative-scribble-soft" />
  </g>;
}

function Marker({ cx, cy, tone, delay, children }) {
  return <g className="creative-pop" style={{ "--delay": `${delay}ms` }}>
    <g className={`creative-float creative-float-${tone}`}>
      <line x1={cx} y1={cy - 40} x2={cx} y2={cy - 30} className="creative-tick" />
      <line x1={cx} y1={cy + 30} x2={cx} y2={cy + 40} className="creative-tick" />
      <circle cx={cx} cy={cy} r="24" />
      {children}
    </g>
  </g>;
}

export function HeroBackdrop() {
  return <svg className="creative-art-back" viewBox="0 0 520 460" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="creative-mint" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#6ee7d2" />
        <stop offset="1" stopColor="#62d3f0" />
      </linearGradient>
    </defs>
    <path className="creative-shape" fill="url(#creative-mint)" d="M114 100c44-9 258-14 300-5 16 4 21 18 15 32l-46 176c-6 20-22 30-44 30l-150-2c-20 0-34-10-40-28L96 132c-5-16 2-29 18-32z" />
    <g className="creative-arcs" fill="none" strokeLinecap="round">
      <path d="M104 138c-36 20-40 100 18 124" pathLength="1" />
      <path d="M416 138c36 20 40 100-18 124" pathLength="1" />
    </g>
    <g className="creative-scribbles" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Scribble x={48} y={48} w={104} h={42} angle={-34} delay={500} />
      <Scribble x={376} y={44} w={108} h={42} angle={-34} delay={640} />
    </g>
  </svg>;
}

export function HeroForeground() {
  return <svg className="creative-art-front" viewBox="0 0 520 460" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
    <g className="creative-scribbles" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Scribble x={30} y={384} w={110} h={40} angle={-30} delay={780} />
      <Scribble x={384} y={386} w={110} h={40} angle={-24} delay={900} />
    </g>
    <Marker cx={84} cy={300} tone="blue" delay={950}>
      <path d="M88 286l-11 16h8l-4 13 12-17h-8z" fill="#fff" />
    </Marker>
    <Marker cx={442} cy={290} tone="orange" delay={1080}>
      <path d="M436 279l15 11-15 11z" fill="#fff" />
    </Marker>
  </svg>;
}

export function NoteArrow() {
  return <svg className="creative-note-arrow" viewBox="0 0 64 40" aria-hidden="true" focusable="false">
    <path d="M4 30c16 4 34-2 48-18" pathLength="1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M42 10l11 1-2 11" pathLength="1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

// Illustrative cover for projects without a screenshot: abstract interface
// shapes, never presented as a real product capture.
export function ProjectCover({ title, variant }) {
  return <div className="creative-cover" data-variant={variant % 3} aria-hidden="true">
    <div className="creative-cover-window">
      <div className="creative-cover-bar"><i /><i /><i /></div>
      <div className="creative-cover-body">
        <p className="creative-cover-title">{title}</p>
        <div className="creative-cover-lines"><span /><span /><span /></div>
        <div className="creative-cover-tiles"><span /><span /><span /></div>
      </div>
    </div>
  </div>;
}
