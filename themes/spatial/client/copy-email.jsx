"use client";
import { useEffect, useRef, useState } from "react";

export default function CopyEmail({ email, copy }) {
  const [status, setStatus] = useState("");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copyAddress = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setStatus(copy.copied);
    } catch {
      setStatus(copy.copyFailed);
    }
    timer.current = setTimeout(() => setStatus(""), 4000);
  };
  return <div className="spatial-copy-email"><button className="spatial-text-link" type="button" onClick={copyAddress}>{copy.copyEmail}<span aria-hidden="true">⧉</span></button><span role="status">{status}</span></div>;
}
