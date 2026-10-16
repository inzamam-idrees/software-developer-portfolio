# Multi-theme portfolio — Phase 9 result (admin redesign and route-based preview)

Date: 2026-10-16
Status: Implemented and locally verified; not committed

## Why

A design critique of the admin scored it 18/40 on Nielsen's heuristics. The main problems:

- The Projects editor was 42,000 px tall, with 541 buttons and no outline.
- Nothing showed unsaved changes.
- Activate published a theme in one click.
- There was no admin shell.
- Preview set a cookie and then showed the theme at `/`, so it looked as if the live site had changed.

The owner approved a full redesign in a cool neutral and indigo palette, with an inline confirm before activation. They also asked for previews on a separate route.

## Delivered

- **Shell** (`app/admin/admin-shell.jsx`):
  - Desktop: a sidebar with Themes and Content (and the content groups), a storage badge, View site, and Sign out.
  - Mobile: a top bar with the same items.
  - Also: a skip link, and per-page titles (`%s · Portfolio admin`). Admin metadata stays noindex, and Open Graph and Twitter tags are dropped.
- **Login**: a centred card with corrected copy. The error is linked to the field through `aria-describedby`.
- **Themes**:
  - Status strip showing the live theme.
  - Card grid with schematic SVG thumbnails, a purpose line for each theme, and a Live badge.
  - "Activate X" opens an inline "Publish X to every visitor?" with Confirm and Cancel. Escape cancels and focus returns to the button. Without JavaScript the button posts directly, as before.
- **Route-based preview**:
  - `/preview/[themeId]`, `/preview/[themeId]/project` and `/preview/[themeId]/blog` (`app/preview/`).
  - The theme is read from the URL by `getPreviewRenderContext`. No cookie is set, so `/` keeps the live theme, even in the admin's own browser.
  - Requires a session: anonymous requests go to `/admin/login`. Unknown or unavailable themes return 404. Pages are always noindex.
  - `app/admin/preview-bar.jsx` is a floating control: current page, theme switcher, and Exit preview. It rewrites the theme's own `/`, `/project` and `/blog` links into the preview, using a capture-phase click listener and `lib/admin/preview-links.mjs`. No theme files changed.
  - The cookie preview route (`POST /admin/theme/preview`) is kept and still works, but the UI no longer uses it. End preview appears only while an old preview cookie is set.
- **Content index**: document cards grouped by section, with counts, summaries and paths. The store state is shown as a callout.
- **Editor** (`app/admin/content/schema-form.jsx`):
  - Scalar fields are grouped in a "General" card; nested groups get their own cards in a responsive two-column grid.
  - List items that are objects collapse to a title row with icon move and remove buttons (the accessible names are unchanged). String lists are compact rows.
  - "On this page" outline: sticky on wide screens, chips on narrow ones.
  - Error summary at the top. It takes focus and opens the items that contain errors.
  - Sticky save bar: unsaved-changes indicator, short revision, tone-coloured status. On a conflict it links to the latest version in a new tab.
  - Undo for removed list items, ⌘/Ctrl+S to save, and a `beforeunload` guard while there are unsaved edits.
- **Styles** (`app/css/admin.scss`): token-based, light and dark through `prefers-color-scheme`, and `prefers-reduced-motion` respected. Touch targets are at least 44 px on coarse pointers.
- **Fix**: `documentFormSchema` now returns plain JSON. Before, every editor page logged "Only plain objects can be passed to Client Components".

Security behaviour is unchanged:

- session and same-origin checks on every mutating route;
- optimistic revisions;
- writes only through a ContentStore.

No dependencies were added.

## Verification (this session)

| Check | Result |
|---|---|
| `npm run test:unit` | 192 pass, 1 fail. The failure is the existing "temporary Cinematic default" test, unchanged. |
| `npm run lint` | No ESLint warnings or errors |
| `npm run validate:content` | Valid |
| `tests/browser/admin-content.js` (:3018, filesystem store, temporary data copy, Cinematic active) | Pass: all 10 steps |
| `tests/browser/admin-readonly.js` (:3019, read-only store) | Pass |
| `tests/browser/theme-preview-security.js` (:3017), updated for the preview route | Pass. Also covers: preview at its own URL, theme links stay in the preview, `/`, `/project` and `/blog` stay on the live theme in the same session, anonymous preview redirects, unknown theme 404, and no Cinematic modules loaded for Coding or Executive previews. |
| `tests/unit/admin-preview-links.test.mjs` (new) | Pass |
| Manual, 1280–1440 px and 375 px, light and dark | No horizontal overflow; confirm flow and focus return checked |

Not run: a production `next build`.

## Risks and notes

- Theme links are rewritten only when JavaScript runs. Without JavaScript, a link inside a preview opens the public page, which shows the live theme.
- Middle-click on a theme link inside a preview opens the public URL. Ctrl/⌘-click is rewritten.
- The cookie preview code path remains. Removing it is a possible follow-up.
