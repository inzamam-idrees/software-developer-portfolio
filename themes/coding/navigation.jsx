"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const items = [
  ["ABOUT", "/#about"],
  ["EXPERIENCE", "/#experience"],
  ["SKILLS", "/#skills"],
  ["EDUCATION", "/#education"],
  ["BLOGS", "/blog"],
  ["PROJECTS", "/#projects"],
];

export default function CodingNavigation({ profile }) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const button = useRef(null);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <nav
      className="coding-navigation bg-transparent"
      aria-label="Main navigation"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <div className="relative flex items-center justify-between py-5">
        <div className="flex flex-shrink-0 items-center">
          <Link
            href="/"
            className="coding-wordmark text-[#16f2b3] text-3xl font-bold"
            onClick={() => setOpen(false)}
          >
            {profile.name}
          </Link>
        </div>
        <button
          ref={button}
          className="coding-menu-toggle lg:hidden"
          type="button"
          aria-controls="coding-mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          data-ready={ready}
          disabled={!ready}
          onClick={() => setOpen((current) => !current)}
        >
          <span aria-hidden="true">{open ? "Close −" : "Menu +"}</span>
        </button>
        <ul
          className="hidden text-sm lg:flex lg:flex-row lg:space-x-1"
          id="navbar-default"
        >
          {items.map(([label, href]) => (
            <li key={href}>
              <Link
                className="block px-4 py-2 no-underline outline-none hover:no-underline"
                href={href}
              >
                <span className="text-sm text-white transition-colors duration-300 hover:text-pink-600">
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <ul
          className={`coding-mobile-menu lg:hidden ${open ? "is-open" : ""}`}
          id="coding-mobile-menu"
          hidden={!open}
        >
          {items.map(([label, href]) => (
            <li key={href}>
              <Link href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
