import { PLAN_VIEWBOX, planPoint } from "../graph.mjs";

export default function ModelPlan({ graph, label }) {
  const points = new Map(
    graph.nodes.map((node) => [node.id, planPoint(node.position)]),
  );
  return (
    <svg
      className="spatial-plan"
      viewBox={PLAN_VIEWBOX.join(" ")}
      role="img"
      aria-label={label}
    >
      <g className="spatial-plan-edges">
        {graph.edges.map(([source, target]) => {
          const [x1, y1] = points.get(source);
          const [x2, y2] = points.get(target);
          return (
            <line key={`${source}>${target}`} x1={x1} y1={y1} x2={x2} y2={y2} />
          );
        })}
      </g>
      {graph.nodes.map((node) => {
        const [x, y] = points.get(node.id);
        if (node.kind === "category") {
          return (
            <rect
              key={node.id}
              className="spatial-plan-category"
              x={x - 0.22}
              y={y - 0.22}
              width={0.44}
              height={0.44}
            />
          );
        }
        if (node.kind === "role") {
          return (
            <polygon
              key={node.id}
              className="spatial-plan-role"
              points={[
                [x, y - 0.26],
                [x + 0.26, y],
                [x, y + 0.26],
                [x - 0.26, y],
              ].join(" ")}
            />
          );
        }
        return (
          <circle
            key={node.id}
            className={`spatial-plan-${node.kind}`}
            cx={x}
            cy={y}
            r={node.kind === "project" ? 0.26 : 0.1}
          />
        );
      })}
    </svg>
  );
}
