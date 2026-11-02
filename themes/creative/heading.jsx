export default function Heading({ id, label, title, intro, children }) {
  return <header className="creative-heading" data-reveal="up">
    <div>
      {label && <p className="creative-eyebrow">{label}</p>}
      <h2 id={id}>{title}</h2>
      {intro && <p className="creative-heading-intro">{intro}</p>}
    </div>
    {children}
  </header>;
}
