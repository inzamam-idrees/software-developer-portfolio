# Startup investigation — 2026-10-01

Before architecture changes, six fresh Chromium contexts each performed an initial visit and reload (three analytics-enabled, three with Tag Manager blocked). All twelve navigations rendered the hero without a pageerror. Local scripts returned 200. Development chunks were extremely large (hero approximately 44 MB uncompressed development output); these are not production transfer sizes.

The original `Invalid or unexpected token` could not be reproduced. Its prior log had no resource/stack identifying the source. Status: unreproduced; cause unresolved. Analytics-blocking is a comparison, not proof analytics caused the failure. Any recurrence of an unexplained application error remains a release blocker.

The no-JavaScript regression test failed on the unchanged application: essential projects/contact content was absent because every homepage section used SSR-disabled imports. The homepage now composes server-rendered sections; optional writing will be isolated in its own task. Analytics remains conditional on a syntactically valid configuration and is placed inside the body.

Production cold-load evidence will be added after the production build.

Server composition exposed a separate, reproducible compatibility error: `lottie-web` accesses `document` during SSR (stack points through `animation-lottie.jsx`). Only that decorative player is now loaded client-side; content remains server-rendered. This is not claimed as the cause of the earlier browser syntax error.
