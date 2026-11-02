export default function ExecutiveCertificates({ items, copy, verifiedCount }) {
  if (!items.length) return null;
  const shared = copy.contentSections.certificates;
  const labels = copy.certificates;
  return <section id="certificates" className="executive-section executive-certificates" aria-labelledby="executive-certificates-title">
    <header className="executive-section-heading"><div><h2 id="executive-certificates-title">{shared.heading}</h2><p>{shared.description}</p></div></header>
    <div className={verifiedCount < 2 ? "executive-certificate-list" : "executive-certificate-grid"}>{items.map((item) => <article className="executive-certificate" key={item.id}>
      <div className="executive-certificate-heading">
        <h3>{item.title}</h3><p className="executive-certificate-issuer">{item.issuer}</p>
        {item.description && <p>{item.description}</p>}
      </div>
      <div className="executive-certificate-meta">
        {item.status && <p className="executive-certificate-status">{shared.statuses[item.status]}</p>}
        {item.issuedDate && <p className="executive-certificate-date"><span>{labels.issued}</span> <time dateTime={item.issuedDate}>{new Intl.DateTimeFormat("en", {dateStyle:"medium",timeZone:"UTC"}).format(new Date(`${item.issuedDate}T00:00:00Z`))}</time></p>}
        {item.credentialId && <p className="executive-certificate-id">{shared.credentialId}: {item.credentialId}</p>}
        {item.credentialUrl && <a className="executive-text-link" href={item.credentialUrl} target="_blank" rel="noreferrer">{labels.verify}</a>}
      </div>
      {!!item.competencies?.length && <div className="executive-certificate-skills"><h4>{shared.competencies}</h4><ul className="executive-tech-list">{item.competencies.map((skill) => <li key={skill}>{skill}</li>)}</ul></div>}
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={item.title} width={640} height={400} loading="lazy" />
      )}
    </article>)}</div>
  </section>;
}
