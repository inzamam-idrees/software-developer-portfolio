import { personalData } from "@/utils/data/personal-data";
import ContactForm from "../../homepage/contact/contact-form";
export default function Contact() {
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
          Let’s build
          <br />
          <span className="serif-word">something meaningful.</span>
        </h2>
        <a className="contact-email" href={"mailto:" + personalData.email}>
          {personalData.email} ↗
        </a>
      </div>
      <div className="contact-grid">
        <div>
          <p className="body-copy">
            Have a product to build, a system to improve, or an idea to explore?
            Tell me what you have in mind.
          </p>
          <div className="contact-details">
            <p className="eyebrow muted">BASED IN</p>
            <p>{personalData.address}</p>
            <a href={"tel:" + personalData.phone}>{personalData.phone}</a>
          </div>
          <div className="contact-socials">
            {[
              ["GitHub", personalData.github],
              ["LinkedIn", personalData.linkedIn],
              ["X", personalData.twitter],
              ["Stack Overflow", personalData.stackOverflow],
              ["LeetCode", personalData.leetcode],
              ["Facebook", personalData.facebook],
            ].map(([label, url]) => (
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
