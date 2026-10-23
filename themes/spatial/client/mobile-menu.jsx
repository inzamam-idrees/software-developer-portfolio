"use client";
import { useEffect, useRef } from "react";

// Closes the disclosure menu once a link is chosen, so it does not cover the page.
export default function MobileMenu({ summary, label, children }) {
  const details = useRef(null);
  useEffect(() => {
    const close = (event) => {
      const anchor = event.target.closest?.("a");
      if (anchor && details.current?.contains(anchor)) details.current.open = false;
    };
    const escape = (event) => {
      if (event.key !== "Escape" || !details.current?.open) return;
      details.current.open = false;
      details.current.querySelector("summary")?.focus();
    };
    // Preview navigation intercepts clicks at document capture; close before it.
    window.addEventListener("click", close, true);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("click", close, true);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <details ref={details} className="spatial-mobile-nav">
      <summary>{summary}</summary>
      <nav aria-label={label}>
        {children}
      </nav>
    </details>
  );
}
