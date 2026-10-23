import ContactForm from "../../homepage/contact/contact-form";
export default function Contact({ contact, social, copy, formEnabled }) {
  const headingWords = contact.heading.split(" ");
  const headingLead = headingWords.slice(0, 2).join(" ");
  const headingEmphasis = headingWords.slice(2).join(" ");
  const socialLinks = [
    "github",
    "linkedIn",
    "x",
    "stackOverflow",
    "leetcode",
    "facebook",
    "dev",
  ]
    .filter((key) => Boolean(social[key]))
    .map((key) => [copy.socialLabels[key], social[key]]);
  return (
    <section
      id="contact"
      className="chapter container contact-section"
      aria-labelledby="contact-heading"
    >
      <p className="eyebrow">
        <span className="accent">07</span> / {copy.home.contact.label}
      </p>
      <div className="contact-heading">
        <h2 id="contact-heading">
          {headingLead}
          <br />
          <span className="serif-word">{headingEmphasis}</span>
        </h2>
        <a className="contact-email" href={"mailto:" + contact.email}>
          {contact.email} ↗
        </a>
      </div>
      <div className="contact-grid">
        <div>
          <p className="body-copy">
            {contact.introduction}
          </p>
          <div className="contact-details">
            <p className="eyebrow muted">{copy.home.contact.basedIn}</p>
            <p>{contact.location}</p>
            <a href={"tel:" + contact.phone}>{contact.phone}</a>
          </div>
          <div className="contact-socials">
            {socialLinks.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer">
                {label} ↗
              </a>
            ))}
          </div>
        </div>
        {formEnabled && <ContactForm copy={copy.contactForm} />}
      </div>
    </section>
  );
}
