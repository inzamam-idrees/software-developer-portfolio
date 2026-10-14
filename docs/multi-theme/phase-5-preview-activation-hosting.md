# Phase 5 preview, activation boundary, and hosting readiness

## Decision

Phase 5 enables private, request-scoped theme preview and does **not** enable theme
activation. The repository does not establish the durable shared storage or deployed
authorization guarantees needed for safe runtime settings writes.

The public active setting remains:

```json
{ "activeTheme": "cinematic" }
```

Preview is an authenticated view selection, not a settings mutation.

## Hosting and persistence findings

The repository names more than one possible deployment shape, so there is no single
established production target:

- `netlify.toml` exists and the README links to a Netlify deployment. It configures
  Node 18, while `package.json` requires Node 20.9 or newer. A normal Netlify function
  filesystem is ephemeral and is not a durable canonical-data store.
- `Dockerfile.prod` and a Compose `prod` service exist, but the Compose service has no
  persistent data volume. The release image copies `.next`, `node_modules`, and
  `package.json`, but not `portfolio-data`. This is not evidence of a writable,
  persistent canonical data mount.
- No Vercel project configuration, persistent volume declaration, shared filesystem,
  object-store adapter, lock service, backup job, or restore procedure is configured.

Consequently, the current repository cannot guarantee that runtime writes survive a
restart or deployment, or that two application instances see the same settings. A
local development checkout is not production persistence evidence.

Before activation can be enabled, the deployment owner must choose and verify all of
the following:

1. A production target running Node 20.9 or newer.
2. One persistent writable volume mounted at `PORTFOLIO_DATA_DIR`, available to every
   instance that can serve or mutate the portfolio.
3. A single-writer or shared locking strategy across instances. An in-process mutex is
   insufficient when more than one process or host is active.
4. Revision-based optimistic concurrency checks so a stale administrator cannot
   overwrite a newer settings revision.
5. Validation of the full settings object before persistence.
6. A same-directory temporary write, file flush where supported, and atomic rename.
7. Timestamped/versioned backups, retention policy, off-volume backup destination,
   and a tested restore procedure.
8. Least-privilege ownership and permissions: the application can write only the
   known canonical data root, while application source remains read-only.
9. Monitoring and an operational response for lock, validation, backup, rename, and
   revalidation failures.

Normal ephemeral Vercel or Netlify deployment is not compatible with runtime file
persistence for this model.

## Private preview architecture

The public routes remain `/`, `/project`, and `/blog`. There are no public theme URLs,
query-string selectors, or client-side global theme state.

```text
authenticated administrator session cookie
                 +
signed, session-bound preview cookie
                 │
                 ▼
request-scoped selection resolver
                 │
      registered + available theme only
                 │
                 ▼
same server canonical loader and validated portfolio
                 │
                 ▼
Coding | Cinematic | Executive lazy slot
```

The preview cookie contains only a theme ID, session ID, issued time, and expiry. It
is HMAC signed, HTTP-only, SameSite Strict, Secure in production, expires after two
hours, and is accepted only while the matching eight-hour administrator session is
valid. A second browser session without those cookies continues to see Cinematic.

Invalid, unknown, unavailable, expired, mismatched, or tampered preview state fails
closed to the canonical public theme. The preview choice never enters
`portfolio-data/settings/theme.json` and never changes canonical content.

Preview responses add `noindex`, `nofollow`, `noarchive`, and Google no-image-index
directives. Ordinary public responses keep their existing metadata. The admin route
is independently marked no-index.

## Authentication boundary

No suitable authentication mechanism existed in the repository. Phase 5 adds a
small single-owner boundary without an authentication framework:

- `PORTFOLIO_ADMIN_PASSWORD_HASH` stores a scrypt password hash, never plaintext.
- `PORTFOLIO_ADMIN_SESSION_SECRET` signs short-lived administrator and preview tokens.
- Mutating form routes accept same-origin POST requests only.
- Session and preview cookies are HTTP-only and are cleared on sign-out.
- Invalid credentials and protected-route failures do not disclose secrets, paths, or
  server errors.
- Missing or weak configuration disables administrator access.

Production must terminate TLS before these controls are used. The application does
not yet implement distributed login rate limiting, credential rotation with immediate
session revocation, multi-factor authentication, or an audit trail. A production edge
or reverse proxy should rate-limit `/admin/session`; a later admin phase should add
audit and secret-rotation procedures.

Generate a password hash locally without placing the password in source control:

```bash
node --input-type=module -e 'import {createPasswordHash} from "./lib/admin/auth.mjs"; const readline = await import("node:readline/promises"); const input = readline.createInterface({input: process.stdin, output: process.stdout}); const password = await input.question("Administrator password: "); input.close(); console.log(await createPasswordHash(password));'
```

Set the resulting hash and a separately generated random secret only in the deployment
secret manager. Do not use a `NEXT_PUBLIC_` prefix.

## Activation boundary

There is no activation route, server action, button, or settings writer. The private
theme page displays activation as unavailable. This prevents a UI mistake or ordinary
public request from changing canonical settings before durable persistence and
production authorization are established.

The eventual activation operation must be a distinct authenticated POST operation. It
must validate a registered available theme, compare a client revision with the current
revision, acquire the cross-instance lock, preserve unrelated settings, validate the
complete next settings object, create a backup, atomically replace only the known
`settings/theme.json` target, confirm the durable write, revalidate affected routes,
and only then report success. Failed validation, locking, backup, persistence, or
revalidation must never be reported as activation success.

## Security assumptions and remaining risks

- Environment secrets are supplied by a secure deployment secret manager.
- HTTPS is mandatory in production.
- Signed cookies protect integrity, not a compromised browser or stolen session.
- Stateless logout clears the browser cookie but cannot revoke a stolen token before
  its eight-hour expiry. Secret rotation invalidates all sessions.
- Application-level distributed rate limiting is intentionally deferred until the
  production hosting topology is selected.
- Preview contains the same professional content already public; protection exists to
  keep theme management private, not to turn canonical portfolio content into a secret.
- No runtime canonical-file writes occur in Phase 5.

## Phase 6 recommendation

Choose the production hosting topology before implementing activation or the broader
personal CMS. Prefer a single-owner deployment with one persistent volume and a
clearly enforced single writer, or specify a tested shared lock if multiple instances
are required. Fix the production container/data packaging or choose another supported
host, align the runtime with Node 20.9+, define backup/restore and rate limiting, then
implement the revisioned atomic theme writer with focused failure-path tests. Keep
content editing and media operations as later, separately approved work.
