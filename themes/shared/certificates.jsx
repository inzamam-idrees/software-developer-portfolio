import Image from "next/image";
import { FiAward, FiArrowUpRight, FiClock, FiCheckCircle, FiShield } from "react-icons/fi";

export default function Certificates({ items, copy, theme }) {
  if (!items?.length) return null;
  const titleId = `${theme}-certificates-title`;
  return <section id="certificates" className="portfolio-content-section portfolio-certificates" aria-labelledby={titleId}>
    <header className="portfolio-content-heading"><h2 id={titleId}>{copy.heading}</h2><p>{copy.description}</p></header>
    {items.some((item) => item.title.startsWith("[TODO:")) && <p>{copy.placeholder}</p>}
    <div className="portfolio-certificate-grid">{items.map((item) => <article className="portfolio-certificate" key={item.id}>
      <div className="portfolio-certificate-top"><div className="portfolio-certificate-issuer"><FiAward aria-hidden="true" /><div><p>{item.issuer}</p>{item.issuedDate && <time dateTime={item.issuedDate}>{item.issuedDate.slice(0,4)}</time>}</div></div>{item.status && <span className="portfolio-certificate-status" data-status={item.status}>{item.status === "in-progress" ? <FiClock aria-hidden="true" /> : item.status === "verified" ? <FiShield aria-hidden="true" /> : <FiCheckCircle aria-hidden="true" />}{copy.statuses[item.status]}</span>}</div>
      <h3>{item.title}</h3>{item.description && <p>{item.description}</p>}
      {!!item.competencies?.length && <div className="portfolio-certificate-skills"><h4>{copy.competencies}</h4><ul>{item.competencies.map((skill) => <li key={skill}>{skill}</li>)}</ul></div>}
      {item.credentialId && <p className="portfolio-certificate-id">{copy.credentialId}: {item.credentialId}</p>}
      {item.image && <Image className="portfolio-certificate-image" src={item.image} alt={item.title} width={640} height={400} unoptimized />}
      {item.credentialUrl && <a className="portfolio-content-action" href={item.credentialUrl} target="_blank" rel="noopener noreferrer">{copy.credential}<FiArrowUpRight aria-hidden="true" /></a>}
    </article>)}</div>
  </section>;
}
