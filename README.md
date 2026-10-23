<p align="center" width="100%">
    <img height="100" src="https://github.com/inzamam-idrees/software-developer-portfolio/blob/master/public/image/palestine.jpg?raw=true">
</p>

---

# Software Developer Portfolio

A multi-theme personal portfolio built with Next.js 15 (App Router), React 19, Tailwind 3 and Sass. One validated content source (`portfolio-data/`) is rendered by five distinct themes — **Coding**, **Cinematic**, **Executive**, **Spatial** and **Prism** — with a private admin area for content editing, theme preview and theme activation. No database.

---

# Demo :movie_camera:

![](./public/image/screen.png)

## View live preview [here](https://inzamam-idrees.netlify.app/).

---

## Table of Contents :scroll:

- [Sections](#sections-bookmark)
- [Demo](#demo-movie_camera)
- [Available themes](#available-themes)
- [Installation](#installation-arrow_down)
- [Getting Started](#getting-started-dart)
- [Usage](#usage-joystick)
- [Deployment](#deployment-rocket)
- [Tutorials](#tutorials-wrench)
  - [Gmail App Password Setup](#gmail-app-password-setup)
  - [Fetching Blog from dev.to](#fetching-blog-from-devto)
- [Development and tests](#development-and-tests)
- [Packages Used](#packages-used-package)

---

# Sections :bookmark:

Every theme renders the same canonical sections (empty or disabled sections are hidden):

- Hero (name, primary and additional roles)
- About
- Experience
- Skills (categories and proficiency levels)
- Projects, with a detail page per project at `/project/<slug>`
- Education
- Awards
- Certificates
- Résumé preview
- Writing (dev.to articles, `/blog`)
- Contact

---

# Installation :arrow_down:

### You will need to download Git and Node to run this project

- [Git](https://git-scm.com/downloads)
- [Node](https://nodejs.org/en/download/)

#### Node.js 20.9 or newer is required (`.nvmrc` pins Node 22). Use npm; the project ships a `package-lock.json`.

```bash
node --version
git --version
```

## <br />

# Getting Started :dart:

### Fork and Clone the repo

To Fork the repo click on the fork button at the top right of the page. Once the repo is forked open your terminal and perform the following commands

```bash
git clone https://github.com/<YOUR GITHUB USERNAME>/software-developer-portfolio.git

cd software-developer-portfolio
```

### Install packages from the root directory

```bash
npm install
```

Then, run the development server (theme stylesheet watcher plus `next dev`):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

### Running with Docker Compose

1. **Build Docker Image and Run Container**:
    ```bash
    docker-compose up --build
    ```

2. **Access the Application**:
    Visit [http://localhost:3000](http://localhost:3000) in your web browser to view the running application.

---

### Building the Docker Image

1. **Build the Docker Image using Dockerfile.dev**:

    ```bash
    docker build -t nextjs-app -f Dockerfile.dev .
    ```

2. **Running the Docker Container**:

    ```bash
    docker run -p 3000:3000 nextjs-app
    ```

3. **Access the Application**:
    Visit [http://localhost:3000](http://localhost:3000) in your web browser to view the running application.

---

# Usage :joystick:

Create a `.env` file from `.env.example`. All variables are documented there:

| Variable | Purpose |
|---|---|
| `EMAIL_ADDRESS`, `GMAIL_PASSKEY` | Contact form delivery through Gmail (nodemailer). |
| `RECAPTCHA_SECRET_KEY` | Server-only reCAPTCHA verification for the contact form. |
| `NEXT_PUBLIC_GTM` | Optional Google Tag Manager ID (`GTM-…`). |
| `SITE_URL` | Verified public HTTPS origin; enables canonical URLs and sitemap. |
| `PORTFOLIO_ADMIN_PASSWORD_HASH`, `PORTFOLIO_ADMIN_SESSION_SECRET` | Admin sign-in (see below). |
| `PORTFOLIO_CONTENT_STORE`, `GITHUB_CONTENT_*` | Where admin saves go (see Admin content editing). |
| `PORTFOLIO_DATA_DIR` | Optional alternative data root (persistent-volume hosts only). |

`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` and `NEXT_PUBLIC_APP_URL` are left over from the
original template; no code reads them.

Portfolio content is stored in validated JSON under `portfolio-data/`. See
[`docs/multi-theme/phase-2-canonical-content.md`](docs/multi-theme/phase-2-canonical-content.md)
before editing it. The multi-theme registry, contract, and loading boundaries are
documented in
[`docs/multi-theme/phase-3-theme-architecture.md`](docs/multi-theme/phase-3-theme-architecture.md).
Themes receive canonical content through the validated loader; do not create editable
professional-content copies inside a theme.

Private theme preview is documented in
[`docs/multi-theme/phase-5-preview-activation-hosting.md`](docs/multi-theme/phase-5-preview-activation-hosting.md).
It requires `PORTFOLIO_ADMIN_PASSWORD_HASH` and
`PORTFOLIO_ADMIN_SESSION_SECRET`. Preview uses authenticated `/preview/<theme>` routes and does not modify the
public active setting.

### Admin content editing

Signed-in administrators can edit every portfolio document, including theme copy and
the active theme, at `/admin/content`. Forms are generated from the same Zod schemas
the build uses. Every save is validated on the server, both the document alone and
the whole portfolio together, before it is stored. Two tabs editing the same document
cannot overwrite each other: the second save is rejected as a conflict.

Saves go through the store selected by `PORTFOLIO_CONTENT_STORE`:

| Store | Use | Where a save goes |
|---|---|---|
| `filesystem` | Local development (default outside production) | Writes `portfolio-data/` (or `PORTFOLIO_DATA_DIR`) and is live immediately. |
| `github` | Production on Netlify | Commits the JSON file to `GITHUB_CONTENT_BRANCH`; Netlify redeploys and the change is live in about 1–2 minutes. Git history is the revision log and backup. |
| `readonly` | Production default | Editing and activation are disabled. |

To enable GitHub storage, create a **fine-grained personal access token** limited to
this repository with **Contents: Read and write** permission only, then set
`PORTFOLIO_CONTENT_STORE=github`, `GITHUB_CONTENT_TOKEN`, `GITHUB_CONTENT_REPO`
(`owner/name`) and `GITHUB_CONTENT_BRANCH` (the branch Netlify deploys) in the host's
environment settings. Never prefix them with `NEXT_PUBLIC_`.

---

# Deployment :rocket:

Deploying the app to platforms like Vercel or Netlify is quick and easy.

Content is bundled at build time. Runtime edits from the admin are persisted by
committing to GitHub (see Admin content editing), never by writing the host's
ephemeral filesystem. A host with a persistent volume can instead use
`PORTFOLIO_CONTENT_STORE=filesystem` with `PORTFOLIO_DATA_DIR`.

## Deploying to Vercel:

1. **Sign up or log in** to [Vercel](https://vercel.com/).
2. Once logged in, click on **"New Project"**.
3. Select your **GitHub repo** (the one that contains your forked project) and click **Import**.
4. Configure your environment variables in the Vercel dashboard by adding each key from your `.env` file.
   - E.g., `SITE_URL`, `EMAIL_ADDRESS`, `GMAIL_PASSKEY`, `RECAPTCHA_SECRET_KEY`, etc.
5. Click on **Deploy**. Vercel will automatically detect your Next.js app and build it.
6. Once the deployment is complete, you can visit your live website!

### Updating After Deployment

Whenever you push changes to your GitHub repo, Vercel will automatically redeploy the app, keeping your portfolio up-to-date.

## Deploying to Netlify:

Canonical JSON is validated and bundled into the server function, and content changes
are published through a new deploy. With GitHub content storage configured, admin
edits and theme activation commit to the repository and Netlify's continuous
deployment publishes them; without it the deployment is read-only. See
[`docs/multi-theme/phase-6-netlify-persistence-readiness.md`](docs/multi-theme/phase-6-netlify-persistence-readiness.md)
for the persistence assessment and future migration path.

1. **Sign up or log in** to [Netlify](https://www.netlify.com/).
2. In the **Netlify Dashboard**, click **"New site from Git"**.
3. Connect your **GitHub** account and select your repo.
4. Configure runtime values in Netlify environment settings. Set `SITE_URL`,
   `PORTFOLIO_ADMIN_PASSWORD_HASH`, and `PORTFOLIO_ADMIN_SESSION_SECRET` for both Builds
   and Functions where scopes are available. Never use `NEXT_PUBLIC_` for secrets.
   Leave `PORTFOLIO_DATA_DIR` unset. To enable admin editing, also set
   `PORTFOLIO_CONTENT_STORE=github`, `GITHUB_CONTENT_TOKEN`, `GITHUB_CONTENT_REPO`
   and `GITHUB_CONTENT_BRANCH` (Functions scope is enough). If sign-in then reports
   that administrator access is unavailable, escape every `$` in
   `PORTFOLIO_ADMIN_PASSWORD_HASH` as `\$`: in local testing Next.js expanded `$` in
   this value even when it was set as a process environment variable. This has not
   been verified on Netlify.
5. Click **Deploy Site**. Netlify will build and deploy your portfolio.

---

# Tutorials :wrench:

## Gmail App Password Setup

1. **Log in to your Google Account** at [https://myaccount.google.com/](https://myaccount.google.com/).
2. Navigate to **Security** from the left sidebar.
3. Scroll down to the **"Signing in to Google"** section and make sure **2-Step Verification** is turned ON.
4. Once 2-Step Verification is enabled, you'll see an option for **App Passwords**.
5. Click on **App Passwords**. You may need to enter your Google account password again.
6. In the **Select app** dropdown, choose "Mail", and for **Select device**, choose "Other (Custom name)" and name it appropriately (e.g., "Portfolio").
7. Click **Generate**. A 16-character app password will be displayed. Save this password for later use in your environment variables (e.g., `GMAIL_PASSKEY`).

## Fetching Blog from dev.to

To display your blog posts from dev.to on the portfolio:

1. Set `provider.username` in `portfolio-data/content/articles.json` to your dev.to username.
2. The application will automatically fetch your latest blog posts and display them in the **BLOG** section.
3. Ensure your blogs are publicly visible on dev.to, and the application will fetch them using the dev.to API.

---

# Packages Used :package:

|   Package    | Use |
| :--- | :--- |
| next, react, react-dom | Framework (Next.js 15, React 19) |
| zod | Canonical content and copy schemas |
| three, @react-three/fiber | Lazy 3D scenes (Cinematic, Spatial only) |
| gsap | Cinematic scroll motion |
| nodemailer, react-google-recaptcha, axios | Contact form delivery and verification |
| @next/third-parties | Google Tag Manager |
| react-icons | Icons (several themes) |
| react-fast-marquee, lottie-react | Coding theme UI (original template) |
| react-toastify, @emailjs/browser | Installed from the original template; not imported by current code |
| sharp | Image optimisation |
| tailwindcss, sass, postcss, autoprefixer | Styles |

Dependency decisions are recorded in `docs/portfolio/dependency-decisions.md`.

---

# FAQ:

1. For those facing the issue of "`next` is not recognized as an internal or external command, operable program or batch file."

Run the following command:

```bash

npm install -g next

```

This installs Next.js globally

then do the usual `npm run dev`


## Cinematic theme

The existing Next.js App Router application reads all factual content through the
server-only validated loader in `lib/portfolio`. The bundled development data lives
in `portfolio-data`; set `PORTFOLIO_DATA_DIR` to an absolute alternative data root
when a deployment should read the same structure from a persistent volume.
Server-rendered chapters remain readable without JavaScript or WebGL. One lazy Fiber
canvas uses Three.js; GSAP owns scroll progression. Native scrolling is the baseline.
No Drei, Lenis or post-processing is installed. The motion control respects the system
reduced-motion preference and persists an explicit pause choice.

Set `SITE_URL` only to the verified public HTTPS origin, without a path or credentials.
When absent, canonical links, Person URL and sitemap references are omitted. The local
social image needs no external assets. Contact delivery uses the existing
`EMAIL_ADDRESS` and `GMAIL_PASSKEY`; never commit credentials. Test delivery is mocked.

## Spatial theme

Spatial presents the same canonical content as an explorable system model: the skills
graph, the featured projects and the career history are built from the data, never
written into the theme. Every section is server-rendered and complete without
JavaScript or WebGL. After the page has loaded, one lazy React Three Fiber canvas
draws the hero model, the skills graph, a project ring and an experience spine into
reserved panels. It uses a reduced static mode for reduced motion, a paused motion
preference (shared with Cinematic) or software rendering, and no 3D at all without
WebGL2 or with `features.threeD` off. Spatial adds no dependencies and loads no GSAP.
Details: `docs/multi-theme/phase-8-spatial-result.md`.

## Development and tests

```bash
npm run validate:content   # Zod-validate portfolio-data/ (also runs before build)
npm run build:theme-css    # compile per-theme stylesheets to public/theme-css
npm run test:unit          # node --test tests/unit/*.test.mjs
npm run lint
npm run build
```

Browser cases in `tests/browser` run with the installed Playwright CLI against a running server, e.g.
`playwright-cli -s=portfolio run-code --filename=tests/browser/navigation.js`.
If another Next process uses the checkout, isolate generated files:
`PORTFOLIO_BUILD_DIR=.next-portfolio-dev npm run dev -- --port 3001`.
Use the same `PORTFOLIO_BUILD_DIR` for a production build and its start command.
Validation evidence and dependency choices are recorded under `docs/portfolio`; phase
designs and results under `docs/multi-theme`.

## SEO

Public routes (`/`, `/project`, `/project/<slug>`, `/blog`) are prerendered; `/blog`
revalidates hourly for dev.to articles, and admin saves or theme activation revalidate
on demand. Each route emits its own title, description, Open Graph/Twitter tags and
JSON-LD (WebSite, ProfilePage and Person on `/`; item lists for projects and posts).
`/llms.txt`, `robots.txt` (disallows `/admin`, `/api/`, `/preview`), the sitemap, icons and
the social image are generated from canonical content. The audit is in
`docs/seo/2026-10-19-seo-audit.md`.


## Available themes

Coding (the current public theme), Cinematic, Executive, Spatial, and **Prism** all render one validated canonical portfolio through five lazy slots: shell, home, projects, individual project, and blog. Each theme loads only its own stylesheet. Activate a theme from `/admin/theme`; preview any theme privately at `/preview/<theme>`.

Prism recreates the reference's portrait-led glass layout with warm rose/terracotta/gold palettes, pill navigation, skills filters and marquee, project carousel and accessible quick preview, and native motion. It adds no dependencies or 3D runtime. Private previews are `/preview/prism`, `/preview/prism/project`, `/preview/prism/project/<slug>`, and `/preview/prism/blog` after admin sign-in. Adding Prism does not activate it.

Palette tokens: `app/css/prism.scss`. Theme wording: `portfolio-data/settings/copy/prism.json`.
The new `certificates` document is editable under `/admin/content/certificates`; it supports descriptions, competency tags, status badges, issue dates, images and credential URLs. Unknown optional values can remain null. Set it to `[]` to hide the certificate section in every theme. All themes render canonical roles, profile details, skills and levels, experience, education, awards, certificates, writing and a résumé preview with the original Open Resume link. Each theme retains its own layout and motion. Resume, writing and contact forms respect their visibility settings. See `docs/multi-theme/phase-11-result.md` for Prism implementation details and `docs/multi-theme/phase-12-content-parity-result.md` for the shared content contract and verification.

### Reset your local administrator password privately

Run `npm run admin:password` in your own terminal. Enter a new password of at least 12 characters and confirm it. Input is hidden; do not pass the password as a command argument or put it in chat. Ctrl+C cancels without changing credentials.

The command writes only a scrypt hash and a new random session secret to ignored `.env.local` with owner-only file permissions. Existing unrelated settings remain intact. Restart the normal local server (`npm run dev`), then sign in at `/admin/login`; rotating the secret invalidates previous sessions. This is local recovery for someone who already has access to the project files; it does not add a public password-reset endpoint or change deployment secrets.

The stored password cannot be viewed or recovered because only a hash is kept. Keep your chosen password in your private password manager; if forgotten, run the reset command again. Tests use temporary directories and never reset real project credentials.
