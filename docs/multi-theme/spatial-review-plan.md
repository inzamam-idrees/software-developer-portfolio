# Spatial portfolio review and fixes

Owner request: review the whole Spatial theme, restore visible card/section/profile interactions and the PDF preview, and improve issues found. This authorizes the remaining-page pass after the prior review checkpoint.

Keep the approved charcoal portrait and chartreuse/neutral palette, local typography and canonical content. Changes remain Spatial-scoped. No new dependencies, activation, commit or publication.

1. Reproduce missing motion and PDF preview. Inspect layout, navigation, skills and route behavior.
2. Add a real canonical PDF/Drive embed with accessible title, original-document action and fallback. Avoid claiming a third-party document loaded just because an iframe exists.
3. Add one consistent motion layer for section/career/card entrances, pointer/focus feedback, profile tilt/orbit response and page progress. Keep content visible without JavaScript. Honor pause, reduced motion and settings; clean up observers, animation handles and pointer listeners on navigation/unmount.
4. Refine the lower-page hierarchy: career track, skill groups, education/award rows, certificates, writing, resume and contact. Preserve all canonical information and shared components.
5. Verify desktop/mobile layouts, hover, motion modes, keyboard controls, PDF source, route navigation, copy/content isolation, lint, unit suite and production build. Record concrete results and limitations.
