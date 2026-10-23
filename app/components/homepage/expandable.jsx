"use client";

import { useId, useState } from "react";

/**
 * Reveals extra content in place, directly after what is already visible,
 * with the toggle below it. Without JavaScript the <noscript> rule keeps
 * the content readable.
 */
function Expandable({ showLabel, hideLabel, className = "", children }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <>
      <noscript>
        <style>{`[data-expandable]{display:block!important}[data-expandable-toggle]{display:none}`}</style>
      </noscript>
      <div id={id} hidden={!open} data-expandable className={className}>
        {children}
      </div>
      <button
        type="button"
        className="coding-expand-toggle"
        aria-expanded={open}
        aria-controls={id}
        data-expandable-toggle
        onClick={() => setOpen((current) => !current)}
      >
        {open ? hideLabel : showLabel}
      </button>
    </>
  );
}

export default Expandable;
