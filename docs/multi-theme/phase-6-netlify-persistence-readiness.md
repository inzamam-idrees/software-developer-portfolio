# Phase 6 Netlify compatibility and persistence readiness

Date: 2026-10-13

## Decision

Netlify is compatible with the current **read-only, redeploy-to-change** portfolio.
It is not a durable filesystem host for the planned runtime JSON editor. Phase 6 keeps
all runtime mutation disabled and makes the bundled canonical data explicit in the
server-function bundle.

The recommended current architecture is:

```text
version-controlled portfolio-data JSON
             │
             ▼
validation before every production build
             │
             ▼
Netlify OpenNext build + read-only function bundle
             │
             ▼
Coding | Cinematic | Executive from one canonical snapshot
```

Content and public-theme changes therefore require a reviewed source change and a new
deploy. Cinematic remains active. Private preview remains request-scoped and does not
write canonical settings.

## Runtime compatibility

- The repository uses Next.js 15.5.27, React 19.0.8, and the App Router. Netlify's
  current OpenNext adapter supports Next.js 13.5 and newer, App Router, SSR, route
  handlers, and revalidation without a repository-pinned adapter. The adapter should
  remain unpinned so Netlify can apply maintained releases.
- `package.json` requires Node 20.9 or newer. Local verification runs on Node 22.23.2,
  and the existing README already records validation on Node 22.
- `.nvmrc`, Netlify builds, and the production container now select Node 22. Netlify
  normally uses the build Node version for Functions when it is a supported AWS Lambda
  runtime. No `AWS_LAMBDA_JS_RUNTIME` override is required for this configuration.
- Every production build runs the canonical Zod loader first. Missing, malformed, or
  invalid content stops the build before Next.js compilation.
- `portfolio-data/**` is explicitly included in Netlify function bundles because the
  loader resolves these files dynamically. It is bundled as read-only deployment
  input, not as writable persistence.
- The production container now uses Node 22 and contains the bundled `portfolio-data`
  directory. Compose still has no persistent data volume; that is intentional for the
  currently supported read-only mode and does not make the container CMS-ready.

Authoritative provider references:

- [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
- [Netlify build dependency versions](https://docs.netlify.com/build/configure-builds/manage-dependencies/)
- [Netlify Functions configuration](https://docs.netlify.com/build/functions/configuration/)
- [Netlify file-based configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/)

## Required Netlify configuration

The repository supplies Node 22 and the canonical function-bundle include rule in
`netlify.toml`. Netlify should infer the maintained OpenNext adapter and run `npm run
build`; do not add or pin the legacy Next.js plugin.

Configure these values in the Netlify UI, CLI, or API, with both Builds and Functions
scope where scoped variables are available:

- `SITE_URL`: the verified public HTTPS origin.
- `PORTFOLIO_ADMIN_PASSWORD_HASH`: the scrypt administrator password hash.
- `PORTFOLIO_ADMIN_SESSION_SECRET`: a unique random secret of at least 32 characters.
- `RECAPTCHA_SECRET_KEY`: the server-only Google reCAPTCHA verification secret when
  that integration is enabled.
- Existing contact and analytics values actually used by the deployment.

Do not set `PORTFOLIO_DATA_DIR` on the current Netlify deployment. The supported source
is the bundled `portfolio-data` directory. A path environment variable cannot turn a
serverless filesystem into durable storage. Never place secrets in `netlify.toml` or a
`NEXT_PUBLIC_` variable. Netlify notes that values declared in `netlify.toml` are not
available to Functions; runtime secrets belong in Netlify environment configuration.

References:

- [Environment variables and Functions](https://docs.netlify.com/build/functions/environment-variables/)
- [Netlify security checklist](https://docs.netlify.com/resources/checklists/security-checklist/)

## Persistence options

### 1. Bundled read-only JSON plus redeploy — recommended now

- **Durability:** Git and deploy artifacts preserve each reviewed version across
  invocations, restarts, and deployments. Runtime writes are impossible by design.
- **Sharing/consistency:** every invocation in one deploy reads its immutable snapshot;
  deploys are the version boundary.
- **Access control:** repository and deployment permissions control changes; admin
  secrets protect preview only.
- **Concurrency/revisions:** source-control commits and deployment history are the
  revision mechanism. There is no runtime write race.
- **Atomicity:** Netlify publishes an immutable deploy as a unit; a content change is
  validated before compilation.
- **Backup/restore:** Git history and Netlify deploy rollback provide two operational
  recovery paths, subject to the owner's repository and deploy-retention policies.
- **Complexity/cost:** lowest operational burden and no new storage service.
- **Portability:** canonical JSON stays provider-neutral.
- **Limitation:** the administrator cannot activate a theme or edit content at runtime.

### 2. External persistent storage — recommended future Netlify mutation path

For a single-owner, low-write portfolio, a later adapter can store one complete,
strictly validated canonical JSON snapshot in a site-wide Netlify Blobs store. Use
strong-consistency reads and ETag conditional writes (`onlyIfMatch`) as optimistic
concurrency control. Store immutable timestamped/versioned snapshot keys before
moving the current-snapshot pointer. This preserves the current JSON domains at the
adapter boundary and avoids partial multi-document visibility.

Trade-offs:

- **Durability/sharing:** site-wide storage is shared across Functions and deployments;
  it is not tied to one ephemeral invocation.
- **Consistency:** default reads are eventual; the admin and post-write verification
  path must explicitly use strong consistency. Public reads need a documented cache
  and freshness policy.
- **Concurrency:** Blobs is last-write-wins and does not provide a general locking
  service. ETag conditional writes can reject stale revisions for the single-snapshot
  design, but application-level retry/conflict handling remains required.
- **Atomicity:** one blob replacement is the publication boundary. A design that writes
  many independent canonical keys would not have a cross-key transaction and is not
  recommended.
- **Access control/secrets:** server-only site context supplies access; no storage
  credentials may enter client code.
- **Backup/restore:** immutable version keys and an independently exported backup are
  required. The reviewed Blobs documentation does not establish a managed point-in-time
  restore facility equivalent to a database backup, so this must be built and tested.
- **Complexity/cost:** modest code and operations for low write volume, but pricing,
  quotas, retention, export, and restore must be confirmed against the chosen plan at
  implementation time.
- **Portability:** a narrow `PortfolioRepository` adapter can keep validated JSON
  provider-neutral; versioned snapshots can be exported to files or another object
  store.

Verified Blobs capabilities and limitations are documented in
[Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/).
No Blobs package, store, credentials, or resources are added in Phase 6.

### 3. Persistent mounted filesystem host

- **Durability:** a managed volume survives container restarts and deployments when
  mounted independently of the application image.
- **Sharing/consistency:** a single application instance is straightforward. Multiple
  instances require a genuinely shared filesystem and a cross-process lock; a local
  mutex is insufficient.
- **Access control:** mount only `PORTFOLIO_DATA_DIR` writable and keep source/image
  files read-only.
- **Concurrency/atomicity:** revision checks, a shared lock, same-directory temporary
  writes, flush where supported, and atomic rename remain application responsibilities.
- **Backup/restore:** volume snapshots plus off-volume backups and a rehearsed restore
  are required.
- **Complexity/cost:** higher infrastructure and operational burden than the current
  personal portfolio, but it needs the smallest loader change.
- **Portability:** highest compatibility with the existing file loader; lower hosting
  portability if volume semantics differ.

This option is valid if direct filesystem editing is a hard requirement, but it means
moving the dynamic application away from normal Netlify Functions.

## Growth path

If the product becomes multi-user, use a transactional relational store rather than
stretching object storage into a CMS database. Model canonical documents, revisions,
owners/roles, audit events, and media metadata explicitly; publish a validated snapshot
for portfolio rendering. Transactions provide a stronger basis for concurrent edits,
permissions, and auditability. Netlify currently offers a managed Postgres option with
transactions and managed backups, but Phase 6 does not select or provision it because
the approved architecture forbids adding a database now and the personal portfolio
does not need one.

Provider references:

- [Netlify storage comparison](https://docs.netlify.com/build/data-and-storage/overview/)
- [Netlify Database backup and recovery](https://docs.netlify.com/build/data-and-storage/netlify-database/backup-and-recovery/)

## Later activation safety plan

After explicit approval for a mutation phase:

1. Introduce a provider-neutral repository interface and keep the filesystem loader as
   the read-only development/build adapter.
2. Build a Netlify Blobs proof using a non-production store and one complete snapshot;
   verify strong reads, ETag conflicts, failure behavior, export, and restore.
3. Seed from the validated bundled JSON and compare the loaded result byte-for-domain
   with the filesystem-backed portfolio view.
4. Add monotonically increasing revisions, authenticated same-origin POST activation,
   registered/available-theme validation, and stale-write rejection.
5. Validate the complete next snapshot, write an immutable backup key, conditionally
   replace the current snapshot, read it back strongly, and revalidate public paths.
6. Add audit metadata, rate limiting, monitoring, retention, and a tested rollback.
7. Enable the UI only after deploy-preview and production-like concurrency tests pass.

Content editing, media upload, activation, and provider provisioning remain outside
Phase 6.

## Verified versus inferred

Verified locally: repository versions and configuration, Node 22 build compatibility,
canonical validation, unit/lint/build/browser behavior, read-only code paths, active
theme, and module isolation.

Verified from current Netlify documentation: OpenNext compatibility, Node selection,
function runtime relationship, included-file configuration, runtime environment
variable rules, Blobs consistency/ETag behavior, and current database backup claims.

Not verified: an actual Netlify build, generated OpenNext function artifact, deploy,
production environment variables, billing/quota behavior for this account, Blobs
provisioning, persistence, concurrency under load, backup export, or restore. Those
require a Netlify site or resource and explicit deployment/provisioning authorization.

