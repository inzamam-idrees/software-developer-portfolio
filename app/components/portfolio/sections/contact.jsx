import ContactForm from "../../homepage/contact/contact-form";
export default function Contact({ contact, social }) {
  const headingWords = contact.heading.split(" ");
  const headingLead = headingWords.slice(0, 2).join(" ");
  const headingEmphasis = headingWords.slice(2).join(" ");
  const socialLinks = [
    ["GitHub", social.github],
    ["LinkedIn", social.linkedIn],
    ["X", social.x],
    ["Stack Overflow", social.stackOverflow],
    ["LeetCode", social.leetcode],
    ["Facebook", social.facebook],
  ].filter(([, url]) => Boolean(url));
  return (
    <section
      id="contact"
      className="chapter container contact-section"
      aria-labelledby="contact-heading"
    >
      <p className="eyebrow">
        <span className="accent">07</span> / CONTACT
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
            <p className="eyebrow muted">BASED IN</p>
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
        <ContactForm />
      </div>
    </section>
  );
}
