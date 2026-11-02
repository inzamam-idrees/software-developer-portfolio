import { FaDev, FaFacebookF, FaGithub, FaLinkedinIn, FaStackOverflow, FaXTwitter } from "react-icons/fa6";
import { SiLeetcode } from "react-icons/si";
import ContactForm from "../../homepage/contact/contact-form";

const socialIcons = {
  github: FaGithub,
  linkedIn: FaLinkedinIn,
  x: FaXTwitter,
  stackOverflow: FaStackOverflow,
  leetcode: SiLeetcode,
  facebook: FaFacebookF,
  dev: FaDev,
};
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
    .map((key) => [copy.socialLabels[key], social[key], socialIcons[key]]);
  return (
    <section
      id="contact"
      className="chapter container contact-section"
      aria-labelledby="contact-heading"
    >
      <p className="eyebrow">
        <span className="accent">08</span> / {copy.home.contact.label}
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
      {contact.availability && (
        <p className="availability-badge">
          <span className="availability-dot" aria-hidden="true" />
          {contact.availability}
        </p>
      )}
      <div className="contact-grid">
        <div>
          <p className="body-copy">
            {contact.introduction}
          </p>
          <div className="actions">
            <a className="button primary" href={"mailto:" + contact.email}>
              {copy.home.contact.emailAction}
            </a>
          </div>
          <div className="contact-details">
            <p className="eyebrow muted">{copy.home.contact.basedIn}</p>
            <p>{contact.location}</p>
            <a href={"tel:" + contact.phone}>{contact.phone}</a>
          </div>
          <ul className="contact-socials" aria-label={copy.home.contact.socialLabel}>
            {socialLinks.map(([label, url, Icon]) => (
              <li key={label}>
                <a href={url} target="_blank" rel="noreferrer" aria-label={label} title={label}>
                  <Icon aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        {formEnabled && <ContactForm copy={copy.contactForm} />}
      </div>
    </section>
  );
}
