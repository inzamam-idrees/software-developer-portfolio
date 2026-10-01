# Startup investigation — 2026-10-01

Before architecture changes, six fresh Chromium contexts each performed an initial visit and reload (three analytics-enabled, three with Tag Manager blocked). All twelve navigations rendered the hero without a pageerror. Local scripts returned 200. Development chunks were extremely large (hero approximately 44 MB uncompressed development output); these are not production transfer sizes.

The original `Invalid or unexpected token` could not be reproduced. Its prior log had no resource/stack identifying the source. Status: unreproduced; cause unresolved. Analytics-blocking is a comparison, not proof analytics caused the failure. Any recurrence of an unexplained application error remains a release blocker.

The no-JavaScript regression test failed on the unchanged application: essential projects/contact content was absent because every homepage section used SSR-disabled imports. The homepage now composes server-rendered sections; optional writing will be isolated in its own task. Analytics remains conditional on a syntactically valid configuration and is placed inside the body.

Production cold-load evidence will be added after the production build.

Server composition exposed a separate, reproducible compatibility error: `lottie-web` accesses `document` during SSR (stack points through `animation-lottie.jsx`). Only that decorative player is now loaded client-side; content remains server-rendered. This is not claimed as the cause of the earlier browser syntax error.

## Recurrence during Task 3

The error recurred on the server with a stack identifying `.next/server/vendor-chunks/react-icons.js:70`; generated code passed `node --check` after the failing request. Two Next.js server processes had the same checkout as their working directory and shared the default `.next` output. This supports an intermittent generated-output collision; it does not prove the original browser error had the same cause. Validation now uses `PORTFOLIO_BUILD_DIR=.next-portfolio-dev`; the other server remains untouched. Production will use a separate `.next-portfolio-production` directory. Repeated isolated-output cold loads must pass before release.
