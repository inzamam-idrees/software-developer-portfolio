import { getSiteOrigin } from "@/lib/site-origin.mjs";

export default function PersonJsonLd({ portfolio }) {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: portfolio.profile.name,
    jobTitle: portfolio.profile.designation,
    address: portfolio.profile.location,
    sameAs: Object.values(portfolio.social).filter(Boolean),
    ...(getSiteOrigin() ? { url: getSiteOrigin() } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(person).replace(/</g, "\\u003c"),
      }}
    />
  );
}
