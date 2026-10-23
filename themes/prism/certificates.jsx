import Image from "next/image";
import Heading from "./heading";
import Icon from "./icon";

export default function Certificates({ items, copy }) {
  if (!items.length) return null;
  return <section id="certificates" className="prism-section prism-section-tint" aria-labelledby="prism-certificates-title">
    <div className="prism-frame">
      <Heading copy={copy} id="prism-certificates-title" centered icon="certificates" />
      {items.some((item) => item.title.startsWith("[TODO:")) && <p className="prism-placeholder-note">{copy.placeholder}</p>}
      <div className="prism-credentials-grid">{items.map((item, index) => <article className="prism-card prism-certificate" key={item.id} data-prism-reveal="card" data-prism-delay={index * 100} data-prism-tilt={7}>
        <div className="prism-certificate-top">
          <div className="prism-certificate-issuer"><span className="prism-symbol"><Icon name="certificates" /></span><div><p className="prism-label">{item.issuer}</p>{item.issuedDate && <time dateTime={item.issuedDate}>{item.issuedDate.slice(0, 4)}</time>}</div></div>
          {item.status && <span className="prism-certificate-status" data-status={item.status}><Icon name={item.status === "in-progress" ? "clock" : "shield"} />{copy.statuses[item.status]}</span>}
        </div>
        <h3>{item.title}</h3>
        {item.description && <p className="prism-certificate-description">{item.description}</p>}
        {!!item.competencies?.length && <div className="prism-certificate-competencies"><p className="prism-label">{copy.competencies}</p><ul className="prism-tags">{item.competencies.map((skill) => <li key={skill}>{skill}</li>)}</ul></div>}
        {item.credentialId && <p className="prism-certificate-id">{copy.credentialId}: {item.credentialId}</p>}
        {item.image && <Image src={item.image} alt={item.title} width={640} height={400} unoptimized className="prism-certificate-image" />}
        {item.credentialUrl && <a className="prism-button prism-certificate-link" href={item.credentialUrl} target="_blank" rel="noopener noreferrer">{copy.credential}<Icon name="arrow" /></a>}
      </article>)}</div>
    </div>
  </section>;
}
