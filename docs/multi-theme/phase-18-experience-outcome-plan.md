# Phase 18: Optional experience outcome

2026-10-26. Add one optional canonical experience field, expose it in the existing
admin editor, and connect Executive's reserved Impact slot. No professional facts,
activation, other theme designs, dependency or deployment changes. No commit/push.

The current project outcome uses optionalText.optional(): trimmed, non-empty when
supplied, nullable and optional, with no character maximum. The owner explicitly chose
to preserve those rules rather than introduce a shared 500-character cap. Long-text
acceptance and the existing 256KiB admin request rejection will both be tested.

1. Add exactly outcome: optionalText.optional() to experienceSchema. Registry, loader,
   current view and stores already consume that schema/data generically; verify
   propagation rather than duplicate mapping or add a document.
2. Put the Outcome label and short verified-result guidance in shared copy data with a
   strict schema key. Supply it to the generated experience JSON form schema as title/
   description. Let SchemaForm use this metadata, show a textarea and associate help
   plus validation errors with the control. Empty nullable inputs normalize to null.
3. Keep Executive styling quiet: existing 14px Impact label / reading-size outcome,
   no card or animation. A small pure rendering component returns null for absence,
   preserving zero extra label/gap; add safe long-token wrapping for supplied content.
4. Test strict acceptance, trimming, empty/invalid rejection, long strings, nullable
   form behavior, copy metadata, temporary loader/view/SSR rendering, real filesystem
   and mocked GitHub admin saves. Keep real portfolio-data/content/experience.json
   byte-identical and prove other theme source/rendered content ignores the new field.
5. Run content/CSS/lint/unit/build commands. Browser-test a clearly labeled synthetic
   fixture (no invented professional claim), light/dark, 390/1280, standard/no-JS.
   Separately edit/save/clear the field through an admin server using another temporary
   data copy. Check contrast/wrapping and unchanged other-theme no-JS output.

Skills: frontend-design keeps the existing information hierarchy and one quiet Impact
line; ui-ux-pro-max favors visible help linked to the input, a readable textarea and
wrapping over truncation; playwright-cli checks actual saves and progressive rendering.
Palette and type stay Phase 17's paper/ink/indigo and local Inter. No generic new card,
metric badge, label above every field, decorative motion or redesign is warranted.
