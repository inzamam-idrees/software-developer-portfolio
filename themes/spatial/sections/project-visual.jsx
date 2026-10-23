import Image from "next/image";

export default function ProjectVisual({ project }) {
  if (project.image) return <Image src={project.image} alt={project.title} width={1200} height={720} sizes="(max-width: 699px) 90vw, 60vw" />;
  const seed = [...project.slug].reduce((value, letter) => (value * 31 + letter.charCodeAt(0)) >>> 0, 0);
  const technologies = project.technologies.slice(0, 4);
  const offset = seed % 24;
  return (
    <svg viewBox="0 0 720 440" className="spatial-project-diagram" aria-hidden="true">
      <g className="spatial-diagram-orbits" transform={`translate(360 220) rotate(${offset - 12})`}>
        <ellipse rx="268" ry="112" /><ellipse rx="268" ry="172" /><ellipse rx="160" ry="204" />
        <path d="M-310 0H310M0-210V210" />
      </g>
      {technologies.map((technology, index) => {
        const x = 140 + (index % 2) * 330;
        const y = 90 + Math.floor(index / 2) * 230;
        return <g key={technology}>
          <path className="spatial-diagram-link" d={`M360 220 Q${x} 220 ${x + 50} ${y + 25}`} />
          <rect className="spatial-diagram-node" x={x - 50} y={y - 5} width="170" height="60" rx="14" />
          <text x={x + 35} y={y + 31} textAnchor="middle">{technology}</text>
        </g>;
      })}
      <g className="spatial-diagram-core" transform="translate(360 220)">
        <rect x="-56" y="-56" width="112" height="112" rx="26" transform={`rotate(${offset - 12})`} />
        <path d="m-18-13-14 13 14 13m36-26 14 13-14 13M8-23-8 23" />
      </g>
    </svg>
  );
}
