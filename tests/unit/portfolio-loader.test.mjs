import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  PortfolioDataError,
  loadCanonicalPortfolio,
} from "../../lib/portfolio/loader.mjs";

const bundledCopy = Object.fromEntries(
  ["shared", "coding", "cinematic", "executive", "spatial", "prism"].map((name) => [
    `settings/copy/${name}.json`,
    JSON.parse(
      readFileSync(
        new URL(`../../portfolio-data/settings/copy/${name}.json`, import.meta.url),
        "utf8",
      ),
    ),
  ]),
);

const documents = {
  ...bundledCopy,
  "content/certificates.json": [],
  "content/profile.json": {
    name: "INZAMAM IDREES",
    designation: "Senior Software Engineer",
    tagline: "Senior Full Stack Engineer | AI-Enabled Web Applications",
    headline: "Engineering with intention.",
    location: "Lahore, Punjab, Pakistan",
    image: "/inzamam_profile.jpg",
    shortIntroduction: "I build thoughtful interfaces and the systems behind them.",
    longIntroduction: "Results-driven Web Developer with over 5 years of experience.",
    experienceLabel: "Over 5 years",
    focusLabel: "Full-stack engineering",
    traits: [
      { id: "hardWorker", label: "Hard worker" },
      { id: "quickLearner", label: "Quick learner" },
      { id: "problemSolver", label: "Problem solver" },
    ],
    resumeId: "primary",
  },
  "content/about.json": {
    summary: "The best software makes complexity feel simple.",
    personalStatement: "I build responsive web applications.",
    engineeringPhilosophy: "I turn complex needs into clear interfaces.",
  },
  "content/projects.json": [
    {
      id: 2,
      slug: "project-2",
      title: "Second",
      shortDescription: "Second project.",
      longDescription: null,
      technologies: ["React"],
      category: null,
      role: "Developer",
      date: null,
      links: {},
      image: null,
      featured: false,
      featuredOrder: null,
      order: 2,
      features: [],
      responsibilities: [],
    },
    {
      id: 1,
      slug: "project-1",
      title: "First",
      shortDescription: "First project.",
      longDescription: null,
      technologies: ["Angular"],
      category: null,
      role: "Developer",
      date: null,
      links: {},
      image: null,
      featured: true,
      featuredOrder: 1,
      order: 1,
      features: ["Feature"],
      responsibilities: ["Responsibility"],
    },
  ],
  "content/experience.json": [
    {
      id: 1,
      company: "Company",
      location: "Lahore, Punjab",
      role: "Engineer",
      startDate: "2022-07",
      endDate: null,
      current: true,
      description: null,
      highlights: ["Built things."],
      technologies: [],
      order: 1,
    },
  ],
  "content/education.json": [
    {
      id: 1,
      qualification: "Bachelor of Science in Software Engineering",
      institution: "University",
      startYear: 2014,
      endYear: 2018,
      description: null,
      order: 1,
    },
  ],
  "content/skills.json": {
    all: ["Angular", "React"],
    featured: ["Angular"],
    proficiency: { Angular: 5 },
    categories: [
      {
        id: "frontend",
        label: "FRONTEND",
        title: "Interfaces",
        summary: "Frontend systems.",
        technologies: ["Angular", "React"],
        order: 1,
      },
    ],
  },
  "content/awards.json": [
    {
      id: 2,
      title: "Second award",
      issuer: "University",
      location: "Sialkot, Punjab",
      startDate: "2016-09",
      endDate: "2017-08",
      order: 2,
    },
    {
      id: 1,
      title: "First award",
      issuer: "University",
      location: "Sialkot, Punjab",
      startDate: "2015-09",
      endDate: "2016-08",
      order: 1,
    },
  ],
  "content/resume.json": {
    id: "primary",
    title: "Resume",
    url: "https://example.com/resume",
    downloadLabel: "Get resume",
    metadata: null,
  },
  "content/articles.json": {
    mode: "devto",
    provider: { username: "inzamam-idrees" },
    manual: [],
  },
  "content/social.json": {
    github: "https://github.com/inzamam-idrees",
    linkedIn: "https://www.linkedin.com/in/inzamam-idrees/",
    facebook: null,
    x: null,
    stackOverflow: null,
    leetcode: null,
    dev: "https://dev.to/inzamam-idrees",
  },
  "content/contact.json": {
    email: "inzamamidrees@gmail.com",
    phone: "+923345203366",
    location: "Lahore, Punjab, Pakistan",
    heading: "Let's build something meaningful.",
    introduction: "Tell me what you have in mind.",
    form: { enabled: true, subjectPrefix: "Portfolio inquiry" },
  },
  "settings/site.json": {
    name: "Inzamam Idrees",
    locale: "en",
    repositoryUrl: "https://github.com/inzamam-idrees/software-developer-portfolio",
    publicRoutes: ["/", "/project", "/blog"],
  },
  "settings/navigation.json": {
    items: [
      { id: "about", label: "About", href: "/#about", enabled: true, order: 1 },
    ],
  },
  "settings/features.json": {
    articles: true,
    contactForm: true,
    resume: true,
    animations: true,
    threeD: true,
  },
  "settings/theme.json": {
    activeTheme: "cinematic",
  },
  "settings/seo.json": {
    title: "Inzamam Idrees | Senior Software Engineer",
    description: "Web applications, thoughtful systems and readable interfaces.",
    keywords: [],
    openGraph: {
      siteName: "Inzamam Idrees",
      title: "Inzamam Idrees | Senior Software Engineer",
      description: "Web applications, thoughtful systems and readable interfaces.",
      imagePath: "/social-image",
      imageAlt: "Inzamam Idrees — Senior Software Engineer",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "Inzamam Idrees | Senior Software Engineer",
      description: "Web applications, thoughtful systems and readable interfaces.",
      imagePath: "/social-image",
    },
    pages: {
      projects: { description: "Selected projects." },
      blog: { description: "Selected articles." },
    },
  },
};

async function createDataRoot({ omit, raw } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "portfolio-data-"));
  for (const [relativePath, value] of Object.entries(documents)) {
    if (relativePath === omit) continue;
    const target = path.join(root, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(
      target,
      raw?.[relativePath] ?? JSON.stringify(value),
      "utf8",
    );
  }
  return root;
}

test("loads and normalizes every canonical document from PORTFOLIO_DATA_DIR", async (context) => {
  const root = await createDataRoot();
  context.after(() => rm(root, { recursive: true, force: true }));

  const portfolio = await loadCanonicalPortfolio({
    env: { PORTFOLIO_DATA_DIR: root },
  });

  assert.equal(portfolio.content.profile.name, "INZAMAM IDREES");
  assert.deepEqual(
    portfolio.content.projects.map((project) => project.id),
    [1, 2],
  );
  assert.equal(portfolio.settings.navigation.items[0].href, "/#about");
  assert.equal("dataRoot" in portfolio, false);
});

test("malformed canonical JSON fails with a document-scoped safe error", async (context) => {
  const root = await createDataRoot({
    raw: { "content/profile.json": "{not-json" },
  });
  context.after(() => rm(root, { recursive: true, force: true }));

  await assert.rejects(
    () =>
      loadCanonicalPortfolio({ env: { PORTFOLIO_DATA_DIR: root } }),
    (error) => {
      assert.ok(error instanceof PortfolioDataError);
      assert.equal(error.code, "MALFORMED_JSON");
      assert.equal(error.document, "profile");
      assert.equal(error.message.includes(root), false);
      assert.equal(error.cause, undefined);
      return true;
    },
  );
});

test("schema-invalid canonical content fails before reaching a theme", async (context) => {
  const root = await createDataRoot({
    raw: {
      "content/profile.json": JSON.stringify({
        ...documents["content/profile.json"],
        name: "",
      }),
    },
  });
  context.after(() => rm(root, { recursive: true, force: true }));

  await assert.rejects(
    () => loadCanonicalPortfolio({ env: { PORTFOLIO_DATA_DIR: root } }),
    (error) => {
      assert.ok(error instanceof PortfolioDataError);
      assert.equal(error.code, "VALIDATION_FAILED");
      assert.equal(error.document, "profile");
      assert.equal(error.message.includes(root), false);
      assert.equal(error.cause, undefined);
      return true;
    },
  );
});

test("missing required canonical files fail clearly without leaking paths", async (context) => {
  const root = await createDataRoot({ omit: "content/experience.json" });
  context.after(() => rm(root, { recursive: true, force: true }));

  await assert.rejects(
    () =>
      loadCanonicalPortfolio({ env: { PORTFOLIO_DATA_DIR: root } }),
    (error) => {
      assert.ok(error instanceof PortfolioDataError);
      assert.equal(error.code, "MISSING_DOCUMENT");
      assert.equal(error.document, "experience");
      assert.equal(error.message.includes(root), false);
      assert.equal(error.cause, undefined);
      return true;
    },
  );
});

test("a missing awards document fails with a document-scoped error", async (context) => {
  const root = await createDataRoot({ omit: "content/awards.json" });
  context.after(() => rm(root, { recursive: true, force: true }));

  await assert.rejects(
    () => loadCanonicalPortfolio({ env: { PORTFOLIO_DATA_DIR: root } }),
    (error) => {
      assert.ok(error instanceof PortfolioDataError);
      assert.equal(error.code, "MISSING_DOCUMENT");
      assert.equal(error.document, "awards");
      return true;
    },
  );
});

test("awards are normalized by order", async (context) => {
  const root = await createDataRoot();
  context.after(() => rm(root, { recursive: true, force: true }));

  const portfolio = await loadCanonicalPortfolio({
    env: { PORTFOLIO_DATA_DIR: root },
  });
  assert.deepEqual(
    portfolio.content.awards.map((award) => award.title),
    ["First award", "Second award"],
  );
});
