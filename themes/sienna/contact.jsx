import ContactForm from "@/app/components/homepage/contact/contact-form";
import { SectionHeading } from "./sections";
import Icon from "./icon";

// ── Contact (reference .contact: details beside a form card) ──
// The form needs both the global switch and the document switch; the details
// and social links stay visible without it.
export default function Contact({ view }) {
  const { copy, contact } = view;
  const labels = copy.home.contact;
  const form = view.settings.features.contactForm && contact.form.enabled;
  const items = [
    contact.location && { id: "address", icon: "location", title: labels.address, body: <address className="sienna-contact-info">{contact.location}</address> },
    contact.phone && { id: "phone", icon: "phone", title: labels.phone, body: <a className="sienna-contact-info" href={"tel:" + contact.phone.replace(/[^+\d]/g, "")}>{contact.phone}</a> },
    contact.email && { id: "email", icon: "email", title: labels.email, body: <a className="sienna-contact-info" href={"mailto:" + contact.email}>{contact.email}</a> },
  ].filter(Boolean);
  return <section className={form ? "sienna-section sienna-contact" : "sienna-section sienna-contact sienna-contact-single"} id="contact" aria-labelledby="sienna-contact-title">
    <SectionHeading id="sienna-contact-title" label={labels.label} title={contact.heading} text={contact.introduction}>
      {contact.availability && <p className="sienna-availability" data-reveal="up"><span aria-hidden="true" />{contact.availability}</p>}
      <ul className="sienna-contact-list">
        {items.map((item) => <li key={item.id} className="sienna-contact-item" data-reveal="up">
          <span className="sienna-contact-icon"><Icon name={item.icon} /></span>
          <div><h3 className="sienna-h4 sienna-contact-title">{item.title}</h3>{item.body}</div>
        </li>)}
      </ul>
      {!!view.socialLinks.length && <ul className="sienna-contact-social" aria-label={labels.social}>
        {view.socialLinks.map((item) => <li key={item.key}>
          <a className="sienna-contact-social-link" href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
            <span className="sienna-tooltip" aria-hidden="true">{item.label}</span>
            <Icon name={item.key} />
          </a>
        </li>)}
      </ul>}
    </SectionHeading>
    {form && <div className="sienna-contact-form" data-reveal="up">
      <ContactForm copy={copy.contactForm} rows={5} placeholders={{ name: copy.contactForm.namePlaceholder, email: copy.contactForm.emailPlaceholder, message: copy.contactForm.messagePlaceholder }} submitIcon={<Icon name="mail" />} />
    </div>}
  </section>;
}
