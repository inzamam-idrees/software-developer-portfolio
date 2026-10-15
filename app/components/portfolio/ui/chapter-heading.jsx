export default function ChapterHeading({ id, number, label, title, description }) {
  return (
    <div className="chapter-heading">
      <p className="eyebrow">
        <span className="accent">{number}</span> / {label}
      </p>
      <h2 id={id + "-heading"}>{title}</h2>
      {description && <p className="section-intro">{description}</p>}
    </div>
  );
}
