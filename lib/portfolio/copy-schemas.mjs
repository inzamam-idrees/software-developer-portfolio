import { z } from "zod";

// ── Primitives ──
const placeholderPattern = /\{(\w+)\}/g;

const trimmedText = z
  .string()
  .min(1)
  .refine((value) => value.trim() === value && value.trim().length > 0, {
    message: "Copy must be non-empty and have no surrounding whitespace",
  });

const copyText = trimmedText.refine((value) => !/\{\w+\}/.test(value), {
  message: "This copy does not support {placeholders}",
});

function template(...allowed) {
  return trimmedText.superRefine((value, context) => {
    for (const [, name] of value.matchAll(placeholderPattern)) {
      if (!allowed.includes(name)) {
        context.addIssue({
          code: "custom",
          message: `Unknown placeholder {${name}}; allowed: ${allowed
            .map((key) => `{${key}}`)
            .join(", ")}`,
        });
      }
    }
  });
}

function strictTree(shape) {
  return z
    .object(
      Object.fromEntries(
        Object.entries(shape).map(([key, value]) => [
          key,
          value instanceof z.ZodType ? value : strictTree(value),
        ]),
      ),
    )
    .strict();
}

function textKeys(...keys) {
  return Object.fromEntries(keys.map((key) => [key, copyText]));
}

// ── Shared copy ──
export const sharedCopySchema = strictTree({
  navigation: {
    ...textKeys(
      "skipToContent",
      "main",
      "mobile",
      "footer",
      "menu",
    "openMenu",
    "closeMenu",
      "menuToggleOpen",
      "menuToggleClose",
    ),
    homeLink: template("name"),
  },
  socialLabels: textKeys(
    "github",
    "linkedIn",
    "x",
    "stackOverflow",
    "leetcode",
    "facebook",
    "dev",
  ),
  contactForm: textKeys(
    "label",
    "name",
    "email",
    "message",
    "send",
    "sending",
    "sent",
    "failed",
    "note",
  ),
  articles: { readArticle: template("title") },
  projects: { technologiesLabel: template("title") },
  projectDetail: textKeys("backToProjects", "overview"),
  notFound: textKeys("eyebrow", "heading", "body", "action"),
  routes: {
    projectsTitle: template("siteName"),
    projectTitle: template("project", "siteName"),
    blogTitle: template("siteName"),
  },
  blogLoading: textKeys("eyebrow", "message"),
  socialImage: textKeys("headlineConnector"),
  llms: textKeys(
    "pagesHeading",
    "homePage",
    "projectsHeading",
    "profilesHeading",
    "contactHeading",
    "emailLabel",
  ),
});

// ── Cinematic copy ──
const chapter = (...extra) => textKeys("label", "heading", ...extra);

export const cinematicCopySchema = strictTree({
  navigation: textKeys("wordmarkRole"),
  footer: textKeys("tagline", "education", "writing", "source", "backToTop"),
  motion: textKeys("pause", "enable", "reduced", "systemNote"),
  home: {
    hero: textKeys(
      "headlineConnector",
      "primaryAction",
      "resumeAction",
      "visualCaption",
      "visualCaptionDetail",
      "closingLead",
      "closingMuted",
      "scrollCue",
    ),
    selectedWork: {
      ...chapter("description"),
      exploreAll: template("count"),
    },
    about: {
      ...chapter("journeyLink"),
      portraitAlt: template("name", "designation"),
    },
    expertise: chapter("description"),
    experience: chapter(),
    education: chapter("awardsHeading"),
    writing: chapter(
      "description",
      "empty",
      "unavailable",
      "profileAction",
      "allArticles",
      "loading",
      "loadingLabel",
    ),
    contact: textKeys("label", "basedIn"),
  },
  project: {
    ...textKeys(
      "problem",
      "fallbackCategory",
      "build",
      "result",
      "features",
      "responsibilities",
      "visit",
      "source",
    ),
    diagram: {
      ...textKeys(
        "title",
        "codePrefix",
        "coreLead",
        "coreTrail",
        "footer",
      ),
      label: template("title"),
      nodes: z.record(
        z.string().regex(/^[1-9]\d*$/, "Diagram nodes are keyed by project id"),
        z.array(copyText).max(3),
      ),
    },
  },
  projects: {
    ...textKeys("heading", "contactAction"),
    eyebrow: template("count"),
  },
  blog: {
    ...textKeys(
      "eyebrow",
      "heading",
      "empty",
      "unavailable",
      "profileAction",
      "fallbackDate",
    ),
    readingTime: template("minutes"),
  },
});

// ── Executive copy ──
const section = (...extra) => textKeys("kicker", "heading", ...extra);

export const executiveCopySchema = strictTree({
  actions: textKeys("startConversation"),
  navigation: textKeys("allProjects", "writing"),
  footer: textKeys("projects", "writing", "email"),
  home: {
    overviewLabel: copyText,
    brief: textKeys("experience", "focus", "coreStack", "basedIn"),
    selectedWork: section("exploreAll"),
    about: textKeys("kicker"),
    expertise: section(),
    experience: section(),
    education: section(),
    awards: section(),
    contact: textKeys("kicker"),
  },
  project: textKeys(
    "challenge",
    "approach",
    "outcome",
    "features",
    "responsibilities",
    "viewProject",
    "viewSource",
  ),
  projects: {
    ...textKeys("heading", "intro", "ctaKicker"),
    kicker: template("count"),
  },
  blog: {
    ...textKeys(
      "kicker",
      "heading",
      "intro",
      "emptyKicker",
      "empty",
      "unavailable",
      "emptyBody",
      "profileAction",
    ),
    readingTime: template("minutes"),
  },
});

// ── Coding copy ──
export const codingCopySchema = strictTree({
  navigation: {
    items: textKeys(
      "about",
      "experience",
      "skills",
      "education",
      "blogs",
      "projects",
      "contact",
    ),
  },
  footer: textKeys("credit", "star", "fork"),
  home: {
    hero: textKeys(
      "greeting",
      "introPrefix",
      "introMiddle",
      "introSuffix",
      "contactAction",
      "resumeAction",
    ),
    about: {
      ...textKeys("rail", "heading", "readMore", "readLess"),
      portraitAlt: template("name"),
    },
    experience: { ...textKeys("heading", "showLess"), showMore: template("count") },
    skills: textKeys("heading"),
    projects: textKeys("heading", "viewMore"),
    education: textKeys("heading", "degreesHeading", "awardsHeading"),
    blog: textKeys("heading", "viewMore"),
    contact: textKeys("rail"),
  },
  contactForm: textKeys(
    "heading",
    "intro",
    "name",
    "email",
    "message",
    "send",
    "sending",
  ),
  project: textKeys("problem", "solution", "outcome", "source"),
  projects: {
    ...textKeys("heading", "noDemo", "role", "stack", "features", "tasks", "demo", "showLess"),
    showMore: template("count"),
  },
  blog: {
    ...textKeys(
      "routeHeading",
      "emptyHeading",
      "empty",
      "unavailable",
      "profileAction",
      "fallbackDate",
    ),
    readingTime: template("minutes"),
  },
});

// ── Spatial copy ──
export const spatialCopySchema = strictTree({
  navigation: textKeys("wordmarkRole"),
  footer: textKeys("backToTop", "source"),
  motion: textKeys("pause", "enable", "reduced", "systemNote"),
  home: {
    hero: textKeys("contactAction", "resumeAction", "modelDescription"),
    about: { heading: copyText, portraitAlt: template("name") },
    experience: {
      ...textKeys("heading", "present"),
      technologiesLabel: template("role"),
    },
    skills: {
      ...textKeys(
        "heading",
        "intro",
        "selectPrompt",
        "noMatches",
        "clearSelection",
        "unmatchedGroup",
        "projectsLabel",
        "rolesLabel",
      ),
      usedIn: template("name"),
    },
    projects: {
      ...textKeys("heading", "intro", "viewProject", "viewSource"),
      exploreAll: template("count"),
    },
    education: textKeys("heading", "awardsHeading"),
    writing: textKeys(
      "heading",
      "empty",
      "unavailable",
      "profileAction",
      "loading",
      "loadingLabel",
    ),
    resume: textKeys("heading", "body"),
    contact: textKeys("basedIn", "emailLabel", "socialLabel"),
  },
  project: textKeys(
    "problem",
    "solution",
    "outcome",
    "features",
    "responsibilities",
    "visit",
    "source",
  ),
  projects: {
    ...textKeys("heading", "contactAction"),
    count: template("count"),
  },
  blog: {
    ...textKeys(
      "heading",
      "intro",
      "empty",
      "unavailable",
      "profileAction",
      "fallbackDate",
    ),
    readingTime: template("minutes"),
  },
});

export const prismCopySchema = strictTree({
  navigation: {
    items: {
      about: copyText,
      skills: copyText,
      projects: copyText,
      experience: copyText,
      certificates: copyText,
      writing: copyText,
      resume: copyText,
      contact: copyText,
    },
    drawer: copyText,
    themeToggle: copyText,
  },
  motion: {
    pause: copyText,
    enable: copyText,
    reduced: copyText,
  },
  footer: {
    source: copyText,
    backToTop: copyText,
    navigation: copyText,
  },
  home: {
    hero: {
      greeting: copyText,
      specialized: copyText,
      projects: copyText,
      contact: copyText,
      connect: copyText,
      scroll: copyText,
      portraitAlt: template("name"),
    },
    about: {
      label: copyText,
      heading: copyText,
      summary: copyText,
      philosophy: copyText,
      focus: copyText,
    },
    skills: {
      label: copyText,
      heading: copyText,
      intro: copyText,
      all: copyText,
      marquee: copyText,
      additional: copyText,
      proficiency: template("level"),
    },
    projects: {
      label: copyText,
      heading: copyText,
      all: copyText,
      empty: copyText,
    },
    experience: {
      label: copyText,
      heading: copyText,
      present: copyText,
    },
    education: {
      label: copyText,
      heading: copyText,
      awards: copyText,
    },
    certificates: {
      label: copyText,
      heading: copyText,
      placeholder: copyText,
      credential: copyText,
      credentialId: copyText,
      issued: copyText,
    },
    writing: {
      label: copyText,
      heading: copyText,
      all: copyText,
      empty: copyText,
      unavailable: copyText,
      profile: copyText,
    },
    resume: {
      label: copyText,
      heading: copyText,
      intro: copyText,
      open: copyText,
    },
    contact: {
      label: copyText,
      channels: copyText,
      channelHint: copyText,
      delivery: template("email"),
      email: copyText,
      phone: copyText,
      location: copyText,
      message: copyText,
      copy: template("label"),
      copied: template("label"),
      failed: copyText,
    },
  },
  contactForm: textKeys("namePlaceholder", "emailPlaceholder", "messagePlaceholder"),
  project: {
    cursor: copyText,
    previous: copyText,
    next: copyText,
    preview: copyText,
    close: copyText,
    details: copyText,
    source: copyText,
    visit: copyText,
    features: copyText,
    responsibilities: copyText,
    problem: copyText,
    solution: copyText,
    outcome: copyText,
    role: copyText,
    stack: copyText,
    position: template("current", "total"),
  },
  projects: {
    label: copyText,
    heading: copyText,
    intro: copyText,
  },
  blog: {
    label: copyText,
    heading: copyText,
    intro: copyText,
    readingTime: template("minutes"),
  },
});

export const copySchemaByTheme = Object.freeze({
  coding: codingCopySchema,
  cinematic: cinematicCopySchema,
  executive: executiveCopySchema,
  spatial: spatialCopySchema,
  prism: prismCopySchema,
});

export const copySettingsSchema = z
  .object({ shared: sharedCopySchema, ...copySchemaByTheme })
  .strict();
