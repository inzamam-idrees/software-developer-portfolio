// ── Admin-only theme descriptions ──
// Describes each theme's design intent for the picker; no portfolio facts live here.
const PURPOSES = Object.freeze({
  coding: "Developer-centric and code-inspired, with a strong technical personality.",
  cinematic: "Premium editorial layout with coordinated motion and optional 3D.",
  executive: "Recruiter-first and highly readable, focused on career evidence.",
  spatial: "An interactive system model: skills graph, project ring and experience spine.",
  prism: "Portrait-led glass panels, warm gradients and an interactive project showcase.",
});

export function themePurpose(themeId) {
  return PURPOSES[themeId] ?? "A registered portfolio theme.";
}

// ── Schematic thumbnails ──
function CodingSketch() {
  return (
    <>
      <rect width="160" height="100" fill="#0d1224" />
      <rect x="10" y="10" width="140" height="8" rx="2" fill="#1a2240" />
      <circle cx="16" cy="14" r="1.6" fill="#ff6b6b" />
      <circle cx="22" cy="14" r="1.6" fill="#ffd166" />
      <circle cx="28" cy="14" r="1.6" fill="#16f2b3" />
      <rect x="14" y="28" width="34" height="4" rx="1" fill="#c084fc" />
      <rect x="52" y="28" width="52" height="4" rx="1" fill="#16f2b3" />
      <rect x="22" y="38" width="64" height="4" rx="1" fill="#7dd3fc" />
      <rect x="22" y="48" width="44" height="4" rx="1" fill="#f472b6" />
      <rect x="70" y="48" width="30" height="4" rx="1" fill="#e2e8f0" opacity=".5" />
      <rect x="14" y="58" width="12" height="4" rx="1" fill="#c084fc" />
      <rect x="110" y="34" width="38" height="52" rx="4" fill="#1a2240" />
      <rect x="116" y="42" width="26" height="3" rx="1" fill="#16f2b3" />
      <rect x="116" y="50" width="20" height="3" rx="1" fill="#e2e8f0" opacity=".4" />
      <rect x="14" y="76" width="40" height="10" rx="5" fill="#16f2b3" opacity=".9" />
    </>
  );
}

function CinematicSketch() {
  return (
    <>
      <rect width="160" height="100" fill="#0b0e11" />
      <circle cx="122" cy="44" r="30" fill="#f2b880" opacity=".18" />
      <circle cx="122" cy="44" r="16" fill="#f2b880" opacity=".35" />
      <rect x="14" y="30" width="78" height="10" rx="1" fill="#f4f1eb" />
      <rect x="14" y="44" width="58" height="10" rx="1" fill="#f4f1eb" />
      <rect x="14" y="62" width="44" height="3" rx="1" fill="#f4f1eb" opacity=".45" />
      <rect x="14" y="76" width="30" height="8" rx="4" fill="#f2b880" />
      <rect x="14" y="14" width="18" height="2" fill="#f4f1eb" opacity=".6" />
      <rect x="128" y="14" width="18" height="2" fill="#f4f1eb" opacity=".6" />
    </>
  );
}

function ExecutiveSketch() {
  return (
    <>
      <rect width="160" height="100" fill="#fbfaf7" />
      <rect x="0" y="0" width="160" height="14" fill="#1f2a44" />
      <rect x="12" y="5" width="30" height="4" rx="1" fill="#fbfaf7" />
      <rect x="12" y="24" width="64" height="7" rx="1" fill="#1f2a44" />
      <rect x="12" y="36" width="50" height="3" rx="1" fill="#6b7280" />
      <rect x="12" y="50" width="62" height="2" fill="#d6d3cc" />
      {[58, 68, 78].map((y) => (
        <g key={y}>
          <rect x="12" y={y} width="20" height="3" rx="1" fill="#9a6b2f" />
          <rect x="36" y={y} width="38" height="3" rx="1" fill="#374151" />
        </g>
      ))}
      <rect x="88" y="24" width="60" height="62" rx="3" fill="#f0ede6" />
      <rect x="96" y="32" width="30" height="4" rx="1" fill="#1f2a44" />
      <rect x="96" y="42" width="44" height="3" rx="1" fill="#6b7280" />
      <rect x="96" y="50" width="38" height="3" rx="1" fill="#6b7280" />
      <rect x="96" y="70" width="34" height="8" rx="2" fill="#1f2a44" />
    </>
  );
}

function SpatialSketch() {
  const nodes = [
    [52, 30], [80, 22], [108, 34], [40, 58], [80, 50], [118, 64], [64, 78], [98, 80],
  ];
  const links = [[0, 1], [1, 2], [0, 4], [1, 4], [2, 5], [3, 4], [4, 5], [3, 6], [4, 7], [6, 7], [5, 7]];
  return (
    <>
      <rect width="160" height="100" fill="#070b16" />
      <ellipse cx="80" cy="52" rx="62" ry="34" fill="none" stroke="#5eead4" strokeOpacity=".22" />
      {links.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="#7dd3fc"
          strokeOpacity=".45"
        />
      ))}
      {nodes.map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r={index === 4 ? 5 : 3} fill={index === 4 ? "#5eead4" : "#a5b4fc"} />
      ))}
    </>
  );
}

function PrismSketch() {
  return <>
    <rect width="160" height="100" fill="#130e10" />
    <rect x="10" y="8" width="140" height="11" rx="6" fill="#2c2023" />
    <rect x="14" y="33" width="76" height="9" rx="2" fill="#f6a6b6" />
    <rect x="14" y="49" width="60" height="3" rx="1" fill="#c7b6ad" />
    <rect x="14" y="58" width="70" height="3" rx="1" fill="#c7b6ad" />
    <rect x="14" y="73" width="36" height="12" rx="4" fill="#963346" />
    <rect x="104" y="27" width="42" height="60" rx="12" fill="#4e383e" stroke="#f3a987" />
    <circle cx="125" cy="45" r="9" fill="#e6cf91" />
    <path d="M110 77Q110 55 125 55Q140 55 140 77" fill="#a17e74" />
  </>;
}

const SKETCHES = Object.freeze({
  coding: CodingSketch,
  cinematic: CinematicSketch,
  executive: ExecutiveSketch,
  spatial: SpatialSketch,
  prism: PrismSketch,
});

export function ThemeThumbnail({ themeId }) {
  const Sketch = SKETCHES[themeId];
  return (
    <svg className="admin-theme-thumb" viewBox="0 0 160 100" aria-hidden="true" focusable="false">
      {Sketch ? <Sketch /> : <rect width="160" height="100" fill="#e5e7eb" />}
    </svg>
  );
}
