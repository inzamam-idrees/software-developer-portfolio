import Icon from "./icon";

export default function Heading({ copy, id, icon = "layers", centered = false }) {
  const sentences = copy.heading.split(/(?<=\.)\s+/);
  const words = sentences.length > 1 ? sentences : copy.heading.split(" ");
  const accent = words.pop();
  return <header className={`prism-heading${centered ? " prism-centered" : ""}`}>
    <p className="prism-kicker" data-prism-reveal="heading"><Icon name={icon} />{copy.label}</p>
    <h2 id={id} data-prism-reveal="heading" data-prism-delay={100}>{words.join(" ")} <span className="prism-gradient">{accent}</span></h2>
    {copy.intro && <p data-prism-reveal="heading" data-prism-delay={200}>{copy.intro}</p>}
  </header>;
}
