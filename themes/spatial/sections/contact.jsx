import CopyEmail from "../client/copy-email";
import ContactForm from "@/app/components/homepage/contact/contact-form";

export default function Contact({ view }) {
  const { contact, copy, social, settings } = view;
  const home = copy.home.contact;
  const socials = Object.entries(copy.socialLabels)
    .filter(([key]) => social[key])
    .map(([key, label]) => ({ key, label, href: social[key] }));
  return (
    <section className="spatial-section spatial-contact" id="contact" aria-labelledby="spatial-contact-title">
      <div className="spatial-frame spatial-contact-grid">
        <div className="spatial-contact-copy">
          <h2 id="spatial-contact-title" className="spatial-section-title">
            {contact.heading}
          </h2>
          <p className="spatial-lead">{contact.introduction}</p>
          <dl className="spatial-contact-details">
            <div>
              <dt>{home.emailLabel}</dt>
              <dd>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
                <CopyEmail email={contact.email} copy={home} />
              </dd>
            </div>
            <div>
              <dt>{home.basedIn}</dt>
              <dd>{contact.location}</dd>
            </div>
            {socials.length > 0 && (
              <div>
                <dt>{home.socialLabel}</dt>
                <dd>
                  <ul className="spatial-social">
                    {socials.map((item) => (
                      <li key={item.key}>
                        <a href={item.href} target="_blank" rel="noreferrer">
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </div>
        {settings.features.contactForm && contact.form.enabled && (
          <div className="spatial-contact-form">
            <ContactForm copy={copy.contactForm} />
          </div>
        )}
      </div>
    </section>
  );
}
