import Link from "next/link";

const sections = [
  ["theme", "Themes", "/admin/theme"],
  ["content", "Content", "/admin/content"],
];

export default function AdminNav({ current }) {
  return (
    <nav className="admin-nav" aria-label="Administration">
      <ul>
        {sections.map(([id, label, href]) => (
          <li key={id}>
            <Link href={href} aria-current={current === id ? "page" : undefined}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <form action="/admin/logout" method="post">
        <button className="admin-secondary" type="submit">
          Sign out
        </button>
      </form>
    </nav>
  );
}
