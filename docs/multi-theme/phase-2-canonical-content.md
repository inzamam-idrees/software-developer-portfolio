# Canonical portfolio content

Phase 2 establishes one theme-agnostic, validated source of truth for professional
content. The current Cinematic interface consumes this model through a server-only
loader; future themes must use the same model rather than copying content.

## Source reconciliation

The migration compared the Coding reference at `master`
(`5ee46ac4692934b5dc5ee1c2b6cac690b5b017f9`) with the Cinematic source commit
`8e6af1f6c0743e8e11122d83d20181c32f00be07`. The profile, project, experience,
education, skills, resume, and social values inherited from the Coding data did not
conflict between those commits. Cinematic-only shared editorial copy (headline,
about text, project problem/build/result summaries, capability-group copy, contact
copy, and SEO values) was preserved. Diagram labels, marks, motion, and layout remain
presentation configuration outside canonical content. No missing dates, metrics,
responsibilities, images, clients, certifications, or outcomes were invented.

## Directory structure

```text
portfolio-data/
├── content/
│   ├── profile.json
│   ├── about.json
│   ├── projects.json
│   ├── experience.json
│   ├── education.json
│   ├── skills.json
│   ├── resume.json
│   ├── articles.json
│   ├── social.json
│   └── contact.json
├── settings/
│   ├── site.json
│   ├── navigation.json
│   ├── features.json
│   ├── theme.json
│   └── seo.json
└── media/
```

`content/` holds professional information that should be identical in every theme.
`settings/` holds site-wide behavior, navigation, feature flags, and search/social
metadata. `media/` is reserved for managed portfolio assets. Layout, animation,
Three.js scene data, CSS choices, and theme-specific visual composition do not belong
in the canonical model.

## Schemas

All documents are validated by explicit strict Zod schemas in
`lib/portfolio/schemas.mjs` before the application receives them.

- `profile` — identity, designation, headline, location, profile image, introductions,
  experience/focus labels, preserved profile traits, and a reference to the primary resume.
- `about` — shared summary, personal statement, and engineering philosophy.
- `projects` — ordered project records with title, supplied descriptions,
  technologies, role, optional category/date/links/image, and optional featured
  editorial content. Missing dates, images, links, and claims remain `null` or absent.
- `experience` — ordered roles with month-precision dates, current-role state,
  company wording, and optional supplied detail.
- `education` — ordered qualifications, institutions, year ranges, and optional
  supplied detail.
- `skills` — a complete normalized skill inventory, a featured subset, and ordered
  cross-theme capability groups. Every referenced skill must exist in the inventory.
- `resume` — the named resume resource and optional known file metadata.
- `articles` — DEV provider configuration or validated manual article records.
- `social` — known social profile URLs; optional profiles use `null`.
- `contact` — email, phone, location, shared call-to-action copy, and contact-form
  configuration.
- `site` — public site name, locale, repository URL, and public route list.
- `navigation` — ordered, enabled/disabled public navigation entries.
- `features` — shared feature availability flags.
- `theme` — the validated active registered theme ID.
- `seo` — default metadata plus Open Graph and X/Twitter card values.

The schemas reject unknown keys, malformed URLs and dates, duplicate identifiers or
ordering values, contradictory current-role dates, invalid featured project ordering,
and broken resume/skill references.

## Editing content

### Add a project

Add the next ordered object to `content/projects.json`. Use only verified facts. Keep
unknown dates and images as `null`, omit unknown links, and never create metrics or
outcomes. `id` and `order` must be unique. A featured project needs a unique positive
`featuredOrder`; a non-featured project must use `null`.

### Update experience

Edit `content/experience.json`. Dates use `YYYY-MM`. A current role uses
`"current": true` and `"endDate": null`; a completed role requires an end date that
does not precede its start date. Preserve the supplied company, location, and title
wording unless a verified correction is available.

### Update skills

Edit `content/skills.json`. Add every verified technology to `all` once. Values in
`featured` and category `technologies` must also exist in `all`. Category IDs and
orders are unique, and a technology may appear in only one category.

### Update the resume

Edit `content/resume.json`. Keep the stable `id` referenced by `profile.resumeId`,
replace `url` with the verified HTTP(S) resource, and add metadata only when known.

## Loading and `PORTFOLIO_DATA_DIR`

`lib/portfolio/loader.mjs` reads a fixed manifest of known canonical files, parses
each document, validates it with Zod, normalizes ordered collections, then validates
the complete aggregate. Theme components receive application data, not filesystem
paths or file-reading capabilities. Errors identify the affected canonical document
without exposing the configured root path.

When `PORTFOLIO_DATA_DIR` is unset, the loader uses the repository's bundled
`portfolio-data/` directory. When set, it must point to a directory containing the
same `content/`, `settings/`, and `media/` structure. The public site is dynamically
server-rendered so a new request observes valid content changes without a process-wide
content cache.

Runtime editing will require a persistent, writable filesystem mounted at the
configured data root. A normal ephemeral Vercel or Netlify filesystem is not a safe
persistence layer for this model: runtime writes can disappear across invocations or
deployments. Use a deployment with a persistent writable volume before enabling the
future personal CMS.

## Validation

Run:

```bash
npm run test:unit
npm run lint
npm run build
```

Malformed or missing required documents intentionally prevent the portfolio from
rendering with partial, unvalidated professional content.
