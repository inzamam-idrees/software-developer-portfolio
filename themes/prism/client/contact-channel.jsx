"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import Icon from "../icon";

export default function ContactChannel({ kind, label, value, href, copy }) {
  const [status, setStatus] = useState("");
  const [target, setTarget] = useState(null);
  const host = useRef(null);
  useEffect(() => setTarget(host.current.closest(".prism-root")), []);
  useEffect(() => {
    if (!status) return;
    const timeout = setTimeout(() => setStatus(""), 2500);
    return () => clearTimeout(timeout);
  }, [status]);
  async function copyValue() {
    try { await navigator.clipboard.writeText(value); setStatus(formatCopy(copy.copied, { label })); }
    catch { setStatus(copy.failed); }
  }
  return <><div ref={host} className="prism-channel prism-card">
    <span className="prism-symbol"><Icon name={kind} /></span><div><p className="prism-label">{label}</p><a href={href}>{value}</a></div>
    <button type="button" className="prism-icon-button" onClick={copyValue} data-prism-magnetic aria-label={formatCopy(copy.copy, { label })}><Icon name={status.startsWith(formatCopy(copy.copied, { label })) ? "check" : "copy"} /></button>
  </div>{target && createPortal(<p className="prism-copy-status" role="status" aria-live="polite">{status}</p>, target)}</>;
}
