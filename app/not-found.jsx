import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container not-found">
      <p className="eyebrow accent">404 / END OF PATH</p>
      <h1>Nothing here.</h1>
      <p>Let’s get you back to the work.</p>
      <Link className="button primary" href="/">
        Return home ↗
      </Link>
    </div>
  );
}
