# Five-theme canonical content parity

Coding, Cinematic, Executive and Spatial now render the same canonical portfolio sections and optional record details as Prism. Each retains its own layout, palette, typography and animation style. Additional hero roles appear as static lists in the theme's own presentation; Prism retains its rotating role treatment.

## Changes

- Profile: primary identity, additional roles, short introduction, full biography, experience/focus evidence and location.
- Skills: category summaries, all canonical technologies (including entries outside categories) and recorded proficiency levels. No percentages or new claims are inferred.
- Experience, education and awards: available descriptions, technologies and locations are retained.
- Certifications: shared canonical records, optional dates/descriptions/competencies/credential IDs, distinct status colors and original credential links. Empty arrays hide the section.
- Résumé: native document preview where the canonical URL supports embedding, with the original Open Resume action and a provider fallback message. The URL conversion helper is shared with Prism.
- Writing: enabled article sections include the existing empty/unavailable fallbacks.
- Navigation: links include populated supplemental sections and respect explicitly disabled entries and feature switches.
- Contact: both global and document-level form switches are required in every theme. Contact details remain visible when the form is hidden.
- Spatial's technology graph includes uncategorized skills and preserves shared category membership.

Shared components live under `themes/shared`; themes do not import another theme's presentation. Shared copy is schema-validated in `settings/copy/shared.json`. Professional content and the active Coding theme are unchanged. No dependencies were added.

## Verification

- `npm run validate:content`: passed.
- `npm run test:unit`: 234 passed, zero failed.
- `npm run lint`: passed.
- `PORTFOLIO_BUILD_DIR=.next-theme-parity-build npm run build`: passed, using a separate output directory to avoid the running development server.
- Browser checks passed at 1280px and 390px for all four themes: 11 unique sections, 3 certificates and 52 skills per theme, correct résumé embed URL/original action, no horizontal overflow, zero page errors and zero axe WCAG A/AA violations on the theme wrappers.
- Certificates and résumé remain present without JavaScript; all eight project/blog archive routes passed.
- Empty certificates and disabled résumé/writing sections and navigation were checked in isolated fixtures. Contact forms hide under either the global switch or the document-level switch. The scripts are `tests/browser/theme-content-parity.js` and `tests/browser/theme-content-empty.js`; the latter expects the described temporary fixture.
- With motion enabled, all four mobile menus expose the new certificate and résumé links. Spatial skill selection and deselection passed.
- Google Drive loaded the canonical résumé in the shared Spatial viewer (provider reported the PDF filename and page 1). This confirms the shared embed works; provider load timing is independent of the theme.
- Independent code review found and prompted correction of Coding and Cinematic contact-form visibility gates.

Browser verification uses an isolated temporary content copy and synthetic authentication. It does not modify owner data or credentials. Embedded document availability depends on the original provider's permissions; Open Resume remains available. No deployment or Safari verification was performed. Local commits were subsequently authorized by the owner. No push or deployment was performed.
