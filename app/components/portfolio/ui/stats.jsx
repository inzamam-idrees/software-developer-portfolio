export default function Stats({ stats, className = "" }) {
  if (!stats.length) return null;
  return (
    <dl className={`stats ${className}`.trim()}>
      {stats.map(({ value, label }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
