"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PREVIEW_PAGES,
  previewHref,
  previewPageOf,
  previewPath,
} from "@/lib/admin/preview-links.mjs";
import Icon from "./icons";

/**
 * Floating control for the admin-only theme preview routes. It also keeps the
 * previewed theme's own links inside the preview.
 */
export default function PreviewBar({ themeId, themes, activeThemeId }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const page = previewPageOf(pathname, themeId);
  const label = themes.find((theme) => theme.id === themeId)?.label ?? themeId;
  const live = themeId === activeThemeId;

  // ── Keep theme navigation inside the preview ──
  useEffect(() => {
    function onClick(event) {
      if (event.defaultPrevented || event.button !== 0) return;
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || anchor.closest("[data-preview-bar]")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const href = previewHref(anchor.getAttribute("href"), themeId, window.location.origin);
      if (!href) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.metaKey || event.ctrlKey || event.shiftKey) {
        window.open(href, "_blank", "noopener");
        return;
      }
      router.push(href);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, themeId]);

  return (
    <aside
      className="admin-preview-bar"
      data-preview-bar
      data-collapsed={collapsed || undefined}
      aria-label="Theme preview controls"
    >
      <p className="admin-preview-state">
        <Icon name="eye" />
        <span>
          <strong>Preview: {label}</strong>
          <span>{live ? "This is the live theme" : "Not live. Only you can see this."}</span>
        </span>
      </p>

      {!collapsed && (
        <>
          <nav className="admin-preview-pages" aria-label="Preview pages">
            {PREVIEW_PAGES.map((entry) => (
              <Link
                key={entry.id}
                href={previewPath(themeId, entry.path)}
                aria-current={page === entry.path ? "page" : undefined}
              >
                {entry.label}
              </Link>
            ))}
          </nav>

          <label className="admin-preview-switch">
            <span className="admin-sr-only">Preview another theme</span>
            <select
              value={themeId}
              onChange={(event) => router.push(previewPath(event.target.value, page))}
            >
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                  {theme.id === activeThemeId ? " (live)" : ""}
                </option>
              ))}
            </select>
          </label>

          <Link className="admin-preview-exit" href="/admin/theme">
            <Icon name="close" />
            Exit preview
          </Link>
        </>
      )}

      <button
        type="button"
        className="admin-preview-collapse"
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Show preview controls" : "Hide preview controls"}
        onClick={() => setCollapsed((value) => !value)}
      >
        <Icon name="chevron" />
      </button>
    </aside>
  );
}
