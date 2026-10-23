export default function ProfileRoles({ profile, label }) {
  const roles = (profile.roles ?? []).filter((role) => role !== profile.designation);
  if (!roles.length) return null;
  return <ul className="portfolio-role-list" aria-label={label}>{roles.map((role) => <li key={role}>{role}</li>)}</ul>;
}
