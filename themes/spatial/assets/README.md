# Spatial portrait assets

## Current: charcoal v2

`portrait-charcoal-v2.png` is the Spatial-only edited transparent portrait. The canonical `/inzamam_profile.jpg` remains unchanged for other themes. The variant is used only when `profile.image` matches the SHA-256 source URL binding in `portrait-alpha-source.mjs`; other URLs render directly without this variant. If the source photograph changes at the same URL, regenerate this derivative.

Tool: built-in image generation/editing, with transparent background enabled. Source: `public/inzamam_profile.jpg`.

Final prompt:

> Edit this exact portrait for a website cutout. Preserve the man's identity, face, expression, hairstyle, skin tone, crossed-arm pose, hands, watch, proportions and original square framing. Change ONLY his white button-down shirt to realistic deep charcoal gray (#25282c), retaining its fabric folds, collar, seams and buttons. Remove the white background completely with clean natural transparent edges, particularly hair, ears, cheeks and beard. No white halo, white outline, fringe, rim lighting or glow. Do not beautify or alter the face. No text, no graphics, no orbit. Photorealistic transparent PNG.

The orbit is SVG/CSS and follows the theme motion controls. It is approximately 10% wider and 14% deeper than v1, with a stronger line for contrast.

## Previous mask

`portrait-alpha.png` is the previous background extraction mask, retained for reference. The current charcoal variant has its own transparency and does not use this mask.
