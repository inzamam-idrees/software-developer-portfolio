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
  notFound: textKeys("eyebrow", "heading", "body", "action"),
  routes: {
    projectsTitle: template("siteName"),
    blogTitle: template("siteName"),
  },
  blogLoading: textKeys("eyebrow", "message"),
  socialImage: textKeys("headlineConnector"),
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
    about: textKeys("rail", "heading"),
    experience: textKeys("heading"),
    skills: textKeys("heading"),
    projects: textKeys("heading", "viewMore"),
    education: textKeys("heading", "awardLabel"),
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
  projects: textKeys("heading"),
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

export const copySchemaByTheme = Object.freeze({
  coding: codingCopySchema,
  cinematic: cinematicCopySchema,
  executive: executiveCopySchema,
});

export const copySettingsSchema = z
  .object({ shared: sharedCopySchema, ...copySchemaByTheme })
  .strict();
