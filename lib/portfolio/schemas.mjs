import { z } from "zod";
import { THEME_IDS } from "../themes/ids.mjs";
import { copySettingsSchema } from "./copy-schemas.mjs";

const requiredText = z.string().trim().min(1);
const optionalText = requiredText.nullable();
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const httpUrl = z
  .url()
  .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
    message: "Expected an HTTP(S) URL",
  });
const mediaReference = z.union([z.string().startsWith("/"), httpUrl]);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
  message: "Use lowercase letters, digits and single hyphens",
});

function unique(values) {
  return new Set(values).size === values.length;
}

function uniqueTextList(label) {
  return z.array(requiredText).refine(unique, {
    message: `${label} must be unique`,
  });
}

function orderedCollection(itemSchema) {
  return z
    .array(itemSchema)
    .min(1)
    .superRefine((items, context) => {
      for (const field of ["id", "order"]) {
        if (!unique(items.map((item) => item[field]))) {
          context.addIssue({
            code: "custom",
            message: `Duplicate ${field} values are not allowed`,
          });
        }
      }
    });
}

export const profileSchema = z
  .object({
    name: requiredText,
    designation: requiredText,
    tagline: requiredText,
    headline: requiredText,
    location: requiredText,
    image: mediaReference,
    shortIntroduction: requiredText,
    longIntroduction: requiredText,
    experienceLabel: requiredText,
    focusLabel: requiredText,
    traits: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z][A-Za-z0-9]*$/),
            label: requiredText,
          })
          .strict(),
      )
      .min(1)
      .refine((traits) => unique(traits.map((trait) => trait.id)), {
        message: "Profile trait IDs must be unique",
      }),
    availability: optionalText.optional(),
    resumeId: requiredText,
  })
  .strict();

export const aboutSchema = z
  .object({
    summary: requiredText,
    personalStatement: requiredText,
    engineeringPhilosophy: requiredText,
  })
  .strict();

const projectLinksSchema = z
  .object({
    demo: httpUrl.optional(),
    source: httpUrl.optional(),
  })
  .strict();

export const projectSchema = z
  .object({
    id: z.number().int().positive(),
    slug,
    title: requiredText,
    shortDescription: requiredText,
    longDescription: optionalText,
    technologies: z.array(requiredText).min(1).refine(unique, {
      message: "Project technologies must be unique",
    }),
    category: optionalText,
    role: requiredText,
    date: optionalText,
    links: projectLinksSchema,
    image: mediaReference.nullable(),
    featured: z.boolean(),
    featuredOrder: z.number().int().positive().nullable(),
    order: z.number().int().positive(),
    problem: optionalText.optional(),
    solution: optionalText.optional(),
    outcome: optionalText.optional(),
    features: uniqueTextList("Project features"),
    responsibilities: uniqueTextList("Project responsibilities"),
  })
  .strict()
  .superRefine((project, context) => {
    const editorial = [project.problem, project.solution, project.outcome];
    const supplied = editorial.filter((value) => value != null).length;
    if (supplied !== 0 && supplied !== editorial.length) {
      context.addIssue({
        code: "custom",
        message: "Project problem, solution, and outcome must be supplied together",
      });
    }
    if (project.featured !== (project.featuredOrder !== null)) {
      context.addIssue({
        code: "custom",
        message: "Only featured projects may have a featured order",
        path: ["featuredOrder"],
      });
    }
  });

export const projectsSchema = orderedCollection(projectSchema).superRefine(
  (projects, context) => {
    const featuredOrder = projects
      .map((project) => project.featuredOrder)
      .filter((value) => value !== null);
    if (!unique(featuredOrder)) {
      context.addIssue({
        code: "custom",
        message: "Featured project order values must be unique",
      });
    }
    if (!unique(projects.map((project) => project.slug))) {
      context.addIssue({
        code: "custom",
        message: "Project slugs must be unique",
      });
    }
  },
);

export const experienceSchema = z
  .object({
    id: z.number().int().positive(),
    company: requiredText,
    location: requiredText,
    role: requiredText,
    startDate: month,
    endDate: month.nullable(),
    current: z.boolean(),
    description: optionalText,
    highlights: uniqueTextList("Experience highlights"),
    technologies: z.array(requiredText).refine(unique, {
      message: "Experience technologies must be unique",
    }),
    order: z.number().int().positive(),
  })
  .strict()
  .superRefine((experience, context) => {
    if (experience.current !== (experience.endDate === null)) {
      context.addIssue({
        code: "custom",
        message: "Current roles must have a null end date",
      });
    }
    if (experience.endDate && experience.endDate < experience.startDate) {
      context.addIssue({
        code: "custom",
        message: "Experience end date cannot precede its start date",
      });
    }
  });

export const experiencesSchema = orderedCollection(experienceSchema);

export const educationSchema = z
  .object({
    id: z.number().int().positive(),
    qualification: requiredText,
    institution: requiredText,
    startYear: z.number().int().min(1900).max(2200),
    endYear: z.number().int().min(1900).max(2200),
    description: optionalText,
    order: z.number().int().positive(),
  })
  .strict()
  .refine((education) => education.endYear >= education.startYear, {
    message: "Education end year cannot precede its start year",
    path: ["endYear"],
  });

export const educationsSchema = orderedCollection(educationSchema);

export const awardSchema = z
  .object({
    id: z.number().int().positive(),
    title: requiredText,
    issuer: requiredText,
    location: requiredText,
    startDate: month,
    endDate: month,
    order: z.number().int().positive(),
  })
  .strict()
  .refine((award) => award.endDate >= award.startDate, {
    message: "Award end date cannot precede its start date",
    path: ["endDate"],
  });

export const awardsSchema = orderedCollection(awardSchema);

export const certificateSchema = z.object({
  id: slug,
  title: requiredText,
  issuer: requiredText,
  issuedDate: z.iso.date().optional(),
  credentialUrl: httpUrl.optional(),
  credentialId: requiredText.optional(),
  image: mediaReference.optional(),
  featured: z.boolean().optional(),
}).strict();

export const certificatesSchema = z.array(certificateSchema).refine(
  (items) => unique(items.map((item) => item.id)),
  { message: "Certificate IDs must be unique" },
);

export const skillCategorySchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    label: requiredText,
    title: requiredText,
    summary: requiredText,
    technologies: z.array(requiredText).min(1).refine(unique, {
      message: "Category technologies must be unique",
    }),
    order: z.number().int().positive(),
  })
  .strict();

export const skillsSchema = z
  .object({
    all: z.array(requiredText).min(1).refine(unique, {
      message: "Skills must be unique",
    }),
    featured: z.array(requiredText).min(1).refine(unique, {
      message: "Featured skills must be unique",
    }),
    proficiency: z.record(requiredText, z.number().int().min(1).max(5)),
    categories: orderedCollection(skillCategorySchema),
  })
  .strict()
  .superRefine((skills, context) => {
    const technologies = skills.categories.flatMap(
      (category) => category.technologies,
    );
    if (!unique(technologies)) {
      context.addIssue({
        code: "custom",
        message: "A technology may belong to only one skill category",
      });
    }
    const known = new Set(skills.all);
    for (const technology of technologies) {
      if (!known.has(technology)) {
        context.addIssue({
          code: "custom",
          message: `Unknown categorized skill: ${technology}`,
          path: ["categories"],
        });
      }
    }
    for (const skill of Object.keys(skills.proficiency)) {
      if (!known.has(skill)) {
        context.addIssue({
          code: "custom",
          message: `Proficiency is set for an unknown skill: ${skill}`,
          path: ["proficiency", skill],
        });
      }
    }
    for (const featured of skills.featured) {
      if (!known.has(featured)) {
        context.addIssue({
          code: "custom",
          message: `Unknown featured skill: ${featured}`,
          path: ["featured"],
        });
      }
    }
  });

export const resumeSchema = z
  .object({
    id: requiredText,
    title: requiredText,
    url: httpUrl,
    downloadLabel: requiredText,
    metadata: z
      .object({
        fileType: requiredText.optional(),
        lastUpdated: requiredText.optional(),
      })
      .strict()
      .nullable(),
  })
  .strict();

export const articleSchema = z
  .object({
    id: z.union([requiredText, z.number().int().positive()]),
    title: requiredText,
    description: z.string(),
    date: requiredText,
    url: httpUrl,
    readingTimeMinutes: z.number().int().positive().nullable(),
    category: optionalText,
  })
  .strict();

const devtoArticlesSchema = z
  .object({
    mode: z.literal("devto"),
    provider: z
      .object({
        username: requiredText,
      })
      .strict(),
    manual: z.array(articleSchema),
  })
  .strict();

const manualArticlesSchema = z
  .object({
    mode: z.literal("manual"),
    provider: z.null(),
    manual: z.array(articleSchema),
  })
  .strict();

export const articlesSchema = z.discriminatedUnion("mode", [
  devtoArticlesSchema,
  manualArticlesSchema,
]);

export const socialSchema = z
  .object({
    github: httpUrl,
    linkedIn: httpUrl,
    facebook: httpUrl.nullable(),
    x: httpUrl.nullable(),
    stackOverflow: httpUrl.nullable(),
    leetcode: httpUrl.nullable(),
    dev: httpUrl.nullable(),
  })
  .strict();

export const contactSchema = z
  .object({
    email: z.email(),
    phone: requiredText,
    location: requiredText,
    heading: requiredText,
    introduction: requiredText,
    form: z
      .object({
        enabled: z.boolean(),
        subjectPrefix: requiredText,
      })
      .strict(),
  })
  .strict();

export const siteSettingsSchema = z
  .object({
    name: requiredText,
    locale: z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/),
    repositoryUrl: httpUrl,
    publicRoutes: z.array(z.string().startsWith("/")).min(1).refine(unique, {
      message: "Public routes must be unique",
    }),
  })
  .strict();

export const navigationSettingsSchema = z
  .object({
    items: orderedCollection(
      z
        .object({
          id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
          label: requiredText,
          href: z.string().regex(/^\/(?:#[a-z][a-z0-9-]*)?$/),
          enabled: z.boolean(),
          order: z.number().int().positive(),
        })
        .strict(),
    ),
  })
  .strict();

export const featureSettingsSchema = z
  .object({
    articles: z.boolean(),
    contactForm: z.boolean(),
    resume: z.boolean(),
    animations: z.boolean(),
    threeD: z.boolean(),
  })
  .strict();

export const themeSettingsSchema = z
  .object({
    activeTheme: z.enum(THEME_IDS),
  })
  .strict();

export const seoSettingsSchema = z
  .object({
    title: requiredText,
    description: requiredText,
    keywords: z.array(requiredText).refine(unique, {
      message: "SEO keywords must be unique",
    }),
    openGraph: z
      .object({
        siteName: requiredText,
        title: requiredText,
        description: requiredText,
        imagePath: z.string().startsWith("/"),
        imageAlt: requiredText,
        locale: z.string().regex(/^[a-z]{2}_[A-Z]{2}$/, {
          message: "Open Graph locale must look like en_US",
        }),
      })
      .strict(),
    twitter: z
      .object({
        card: z.literal("summary_large_image"),
        title: requiredText,
        description: requiredText,
        imagePath: z.string().startsWith("/"),
      })
      .strict(),
    pages: z
      .object({
        projects: z.object({ description: requiredText }).strict(),
        blog: z.object({ description: requiredText }).strict(),
      })
      .strict(),
  })
  .strict();

export const canonicalPortfolioSchema = z
  .object({
    content: z
      .object({
        profile: profileSchema,
        about: aboutSchema,
        projects: projectsSchema,
        experience: experiencesSchema,
        education: educationsSchema,
        awards: awardsSchema,
        certificates: certificatesSchema,
        skills: skillsSchema,
        resume: resumeSchema,
        articles: articlesSchema,
        social: socialSchema,
        contact: contactSchema,
      })
      .strict(),
    settings: z
      .object({
        site: siteSettingsSchema,
        navigation: navigationSettingsSchema,
        features: featureSettingsSchema,
        theme: themeSettingsSchema,
        seo: seoSettingsSchema,
        copy: copySettingsSchema,
      })
      .strict(),
  })
  .strict()
  .superRefine((portfolio, context) => {
    if (portfolio.content.profile.resumeId !== portfolio.content.resume.id) {
      context.addIssue({
        code: "custom",
        message: "Profile resumeId does not match the canonical resume",
        path: ["content", "profile", "resumeId"],
      });
    }
  });

/** @typedef {z.infer<typeof canonicalPortfolioSchema>} CanonicalPortfolio */
