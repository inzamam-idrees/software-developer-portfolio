# Operations notes

Setup and recovery procedures that used to live in the README.

## Contact form email (Gmail)

`GMAIL_PASSKEY` is a Google **app password**, not the account password.

1. Open your Google Account, then Security.
2. Turn on 2-Step Verification.
3. Open App Passwords, create one (app "Mail", device "Other", e.g. "Portfolio").
4. Put the 16-character value in `GMAIL_PASSKEY` and the sender address in `EMAIL_ADDRESS`. Never commit them.

Set `SITE_URL` only to the verified public HTTPS origin, without path or credentials. When absent, canonical links, Person URL and sitemap references are omitted. Contact delivery is mocked in tests.

## Writing from dev.to

Set `provider.username` in `portfolio-data/content/articles.json`. The latest public posts are fetched from the dev.to API and shown under Writing and `/blog`.

## GitHub content store

1. Create a **fine-grained personal access token** limited to this repository with **Contents: Read and write** only.
2. In the host's environment settings set `PORTFOLIO_CONTENT_STORE=github`, `GITHUB_CONTENT_TOKEN`, `GITHUB_CONTENT_REPO` (`owner/name`) and `GITHUB_CONTENT_BRANCH` (the branch Netlify deploys). Functions scope is enough on Netlify.
3. Never prefix them with `NEXT_PUBLIC_`.

Each save commits the JSON file to that branch; Netlify redeploys and the change is live in about 1-2 minutes. Git history is the revision log and backup. This path is tested only against a mocked GitHub API.

## Netlify environment

Set `SITE_URL`, `PORTFOLIO_ADMIN_PASSWORD_HASH` and `PORTFOLIO_ADMIN_SESSION_SECRET` for Builds and Functions where scopes are available. Leave `PORTFOLIO_DATA_DIR` unset. If sign-in reports that administrator access is unavailable, escape every `$` in the hash as `\$`: in local testing Next.js expanded `$` in this value even when it was a process environment variable (this applies to `.env`, `.env.local` and shell variables alike). Not verified on Netlify.

A host with a persistent volume can instead use `PORTFOLIO_CONTENT_STORE=filesystem` with `PORTFOLIO_DATA_DIR`.

## Resetting the local admin password

Run `npm run admin:password` in your own terminal. Enter a new password of at least 12 characters and confirm it. Input is hidden; do not pass the password as an argument or put it in chat. Ctrl+C cancels.

It writes only a scrypt hash and a new random session secret to ignored `.env.local` (owner-only permissions), leaves unrelated settings intact, and invalidates old sessions. Restart `npm run dev` and sign in at `/admin/login`. This is local recovery for someone with project file access; it adds no public reset endpoint and changes no deployment secrets. Only a hash is stored, so a forgotten password cannot be recovered, only reset.

## Theme screenshots and the README hero

`npm run capture:screenshots` writes `public/image/theme-screenshots/<id>.png` (1440x900) for every theme from a running server; `npm run sync:readme` copies the active theme's image to `public/image/screen.png` and rewrites the README active-theme block. See CLAUDE.md for the workflow.

Capture against a server with a known admin password, then sync:

```bash
PORTFOLIO_SCREENSHOT_ORIGIN=http://127.0.0.1:3000 \
PORTFOLIO_SCREENSHOT_PASSWORD='<admin password>' \
npm run capture:screenshots            # optionally: -- prism sienna
npm run sync:readme
npm run check:readme
```

`npm run check:readme` is read-only: it compares `activeTheme` with the README block, `public/image/screen.png` and the matching theme screenshot, and exits non-zero listing each mismatch. It is deliberately not part of `prebuild` or any deploy step, so a stale README can never block a Netlify deploy; run it manually or in an optional CI job.

`PORTFOLIO_SCREENSHOT_SETTLE` (ms, default 4000) lengthens the wait for motion and 3D. Playwright is not a project dependency: the script uses a local `playwright` if present, else the one bundled with the global Playwright CLI. If no browser is found the script prints the steps to fix it. If the cached browser build differs from the library's expected one, set `PORTFOLIO_SCREENSHOT_CHROMIUM` to a Chromium executable. Because Next expands `$` in env values (see above), a throwaway server for capturing needs its hash escaped in a `.env.local`.

After the admin activates a theme on Netlify with the GitHub store, only `settings/theme.json` is committed, so the README image is stale until someone runs the two commands above locally and commits. An optional GitHub Action that runs `sync:readme` on changes to `theme.json` would keep the text current but cannot capture a screenshot (needs a server and browser), so it is not implemented.

## Docker (removed)

`Dockerfile.dev`, `Dockerfile.prod`, `docker-compose.yml` and `.dockerignore` were deleted on 2026-11-02. `docker build -f Dockerfile.prod .` failed on `pnpm install` (`ERR_PNPM_IGNORED_BUILDS: @parcel/watcher`); the project uses npm and `package-lock.json`, and the release stage also omitted `public/` and `next.config.js`. Netlify is the supported deployment. Older phase docs that mention these files describe the state at the time.
