export default function ExecutiveSocialLinks({ links, compact = false }) {
  return (
    <ul className={compact ? "executive-socials compact" : "executive-socials"}>
      {links.map((link) => (
        <li key={link.key}>
          <a href={link.href} target="_blank" rel="noreferrer">
            {link.label}<span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
