"use client";

import { useEffect, useRef } from "react";
import { usePrismMotion } from "./controls";
import Icon from "../icon";

export default function Dialog({ open, onClose, label, closeLabel, className = "", heading, children }) {
  const ref = useRef(null);
  const animation = useRef(null);
  const closing = useRef(false);
  const { paused, reduced } = usePrismMotion();
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    closing.current = false;
    if (!paused && !reduced && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animation.current = dialog.animate(className.includes("prism-drawer")
        ? [{ transform: "translateX(100%)" }, { transform: "none" }]
        : [{ opacity: 0, transform: "translateY(20px) scale(.9)" }, { opacity: 1, transform: "none" }],
      { duration: className.includes("prism-drawer") ? 500 : 300, easing: "cubic-bezier(.16,1,.3,1)" });
    }
    return () => {
      animation.current?.cancel();
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);
  useEffect(() => { if (paused || reduced) animation.current?.finish(); }, [paused, reduced]);
  async function dismiss() {
    if (closing.current) return;
    closing.current = true;
    if (!paused && !reduced) {
      animation.current?.cancel();
      animation.current = ref.current.animate(className.includes("prism-drawer")
        ? [{ transform: "none" }, { transform: "translateX(100%)" }]
        : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(20px) scale(.9)" }],
      { duration: 200, easing: "ease-in" });
      await animation.current.finished.catch(() => {});
    }
    onClose();
  }
  function trapFocus(event) {
    if (event.key !== "Tab") return;
    const items = [...ref.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]')]
      .filter((item) => item.getClientRects().length > 0);
    const first = items[0];
    const last = items.at(-1);
    if (!first) { event.preventDefault(); ref.current.focus(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return <dialog onKeyDown={trapFocus} tabIndex={-1} ref={ref} className={`prism-dialog ${className}`} aria-label={label} aria-modal="true"
    onCancel={(event) => { event.preventDefault(); dismiss(); }}
    onClick={(event) => { if (event.target === ref.current) dismiss(); }}>
    <div className="prism-dialog-content">
      {heading ? <>
        <header className="prism-dialog-header"><h2>{heading}</h2><button type="button" className="prism-icon-button prism-dialog-close" onClick={dismiss} aria-label={closeLabel} autoFocus><Icon name="close" /></button></header>
        <div className="prism-dialog-scroll">{children}</div>
      </> : <>
        <button type="button" className="prism-icon-button prism-dialog-close" onClick={dismiss} aria-label={closeLabel} autoFocus><Icon name="close" /></button>
        {children}
      </>}
    </div>
  </dialog>;
}
