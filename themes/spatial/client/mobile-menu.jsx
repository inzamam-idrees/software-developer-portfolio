"use client";
import { useRef } from "react";

// Closes the disclosure menu once a link is chosen, so it does not cover the page.
export default function MobileMenu({ summary, label, children }) {
  const details = useRef(null);
  const close = (event) => {
    if (event.target.closest("a") && details.current) details.current.open = false;
  };
  return (
    <details ref={details} className="spatial-mobile-nav">
      <summary>{summary}</summary>
      <nav aria-label={label} onClick={close}>
        {children}
      </nav>
    </details>
  );
}
