"use client";

import { useRef, useState } from "react";
import { TbMailForward } from "react-icons/tb";
import { validateContact } from "@/lib/contact.mjs";

const empty = { name: "", email: "", message: "" };

export default function CodingContactForm({ copy }) {
  const [input, setInput] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);

  async function submit(event) {
    event.preventDefault();
    if (sending.current) return;
    const result = validateContact(input);
    setErrors(result.ok ? {} : result.errors);
    setStatus("");
    if (!result.ok) {
      document
        .getElementById(`contact-${Object.keys(result.errors)[0]}`)
        ?.focus();
      return;
    }
    sending.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error("Delivery failed");
      setInput(empty);
      setStatus(copy.sent);
    } catch {
      setStatus(copy.failed);
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="font-medium mb-5 text-[#16f2b3] text-xl uppercase">
        {copy.heading}
      </p>
      <form
        className="max-w-3xl text-white rounded-lg border border-[#464c6a] p-3 lg:p-5"
        onSubmit={submit}
        noValidate
        aria-label={copy.label}
      >
        <p className="text-sm text-[#d3d8e8]">
          {copy.intro}
        </p>
        <div className="mt-6 flex flex-col gap-4">
          {[
            ["name", copy.name, "text", "name"],
            ["email", copy.email, "email", "email"],
          ].map(([field, label, type, autoComplete]) => (
            <div className="flex flex-col gap-2" key={field}>
              <label htmlFor={`contact-${field}`} className="text-base">
                {label}:
              </label>
              <input
                id={`contact-${field}`}
                name={field}
                className="bg-[#10172d] w-full border rounded-md border-[#353a52] focus:border-[#16f2b3] ring-0 outline-0 transition-all duration-300 px-3 py-2"
                type={type}
                autoComplete={autoComplete}
                maxLength={100}
                required
                value={input[field]}
                aria-invalid={Boolean(errors[field])}
                aria-describedby={errors[field] ? `${field}-error` : undefined}
                onChange={(event) =>
                  setInput({ ...input, [field]: event.target.value })
                }
              />
              {errors[field] && (
                <p id={`${field}-error`} className="text-sm text-red-400">
                  {errors[field]}
                </p>
              )}
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <label htmlFor="contact-message" className="text-base">
              {copy.message}:
            </label>
            <textarea
              id="contact-message"
              name="message"
              className="bg-[#10172d] w-full border rounded-md border-[#353a52] focus:border-[#16f2b3] ring-0 outline-0 transition-all duration-300 px-3 py-2"
              maxLength={500}
              required
              rows={4}
              value={input.message}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "message-error" : undefined}
              onChange={(event) =>
                setInput({ ...input, message: event.target.value })
              }
            />
            {errors.message && (
              <p id="message-error" className="text-sm text-red-400">
                {errors.message}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-3">
            <button
              className="flex items-center gap-1 hover:gap-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-5 md:px-12 py-2.5 md:py-3 text-center text-xs md:text-sm font-medium uppercase tracking-wider text-white transition-all duration-200 md:font-semibold"
              type="submit"
              disabled={busy}
            >
              {busy ? (
                <span>{copy.sending}</span>
              ) : (
                <span className="flex items-center gap-1">
                  {copy.send} <TbMailForward size={20} />
                </span>
              )}
            </button>
          </div>
          <p role="status" aria-live="polite" aria-atomic="true">
            {status}
          </p>
        </div>
      </form>
    </div>
  );
}
