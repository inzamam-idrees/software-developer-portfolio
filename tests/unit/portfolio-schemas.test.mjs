import assert from "node:assert/strict";
import test from "node:test";
import {
  awardSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
  skillsSchema,
} from "../../lib/portfolio/schemas.mjs";

const validProfile = {
  name: "INZAMAM IDREES",
  designation: "Senior Software Engineer",
  tagline: "Senior Full Stack Engineer | AI-Enabled Web Applications",
  headline: "Engineering with intention.",
  location: "Lahore, Punjab, Pakistan",
  image: "/inzamam_profile.jpg",
  shortIntroduction:
    "I build thoughtful interfaces and the systems behind them.",
  longIntroduction: "Results-driven Web Developer with over 5 years of experience.",
  experienceLabel: "Over 5 years",
  focusLabel: "Full-stack engineering",
  traits: [
    { id: "hardWorker", label: "Hard worker" },
    { id: "quickLearner", label: "Quick learner" },
    { id: "problemSolver", label: "Problem solver" },
  ],
  resumeId: "primary",
};

const validProject = {
  id: 1,
  title: "MIS / Nexis Project",
  shortDescription: "An inventory management system.",
  longDescription: "A system for tracking stock, allocations, and repairs.",
  technologies: ["Angular", ".NET Framework"],
  category: "Enterprise systems",
  role: "Team Lead / Senior Software Engineer",
  date: null,
  links: { demo: "https://nexis.vteamslabs.com" },
  image: null,
  featured: true,
  featuredOrder: 1,
  order: 1,
  problem: "IT assets need a clear history.",
  solution: "A role-based inventory platform.",
  outcome: "A connected view of the hardware lifecycle.",
  features: ["Role-based access control with user authentication"],
  responsibilities: ["Led frontend Angular development"],
};

test("profile schema accepts the existing factual profile shape", () => {
  const result = profileSchema.parse(validProfile);
  assert.equal(result.name, "INZAMAM IDREES");
  assert.equal(result.resumeId, "primary");
  assert.deepEqual(
    result.traits.map((trait) => trait.id),
    ["hardWorker", "quickLearner", "problemSolver"],
  );
});

test("profile schema rejects malformed required profile data", () => {
  assert.equal(
    profileSchema.safeParse({ ...validProfile, name: "", unknown: true }).success,
    false,
  );
});

test("project schema accepts existing projects without invented dates or images", () => {
  const result = projectSchema.parse(validProject);
  assert.equal(result.date, null);
  assert.equal(result.image, null);
});

test("project schema rejects malformed links and empty technology lists", () => {
  assert.equal(
    projectSchema.safeParse({
      ...validProject,
      technologies: [],
      links: { demo: "javascript:alert(1)" },
    }).success,
    false,
  );
});

test("project schema rejects featured priority on a non-featured project", () => {
  assert.equal(
    projectSchema.safeParse({
      ...validProject,
      featured: false,
      featuredOrder: 1,
    }).success,
    false,
  );
});

test("experience schema accepts supplied date precision and optional details", () => {
  const result = experienceSchema.parse({
    id: 1,
    company: "Nextbridge Ltd.",
    location: "Lahore, Punjab",
    role: "Senior Software Engineer",
    startDate: "2022-07",
    endDate: null,
    current: true,
    description: null,
    highlights: ["Developed lightweight JavaScript e-commerce widgets."],
    technologies: [],
    order: 1,
  });
  assert.equal(result.current, true);
});

test("experience schema rejects impossible date formats and contradictory current roles", () => {
  assert.equal(
    experienceSchema.safeParse({
      id: 1,
      company: "Nextbridge Ltd.",
      location: "Lahore, Punjab",
      role: "Senior Software Engineer",
      startDate: "July 2022",
      endDate: "2024-01",
      current: true,
      description: null,
      highlights: [],
      technologies: [],
      order: 1,
    }).success,
    false,
  );
});

test("education schema preserves the supplied qualification wording", () => {
  const result = educationSchema.parse({
    id: 1,
    qualification: "Bachelor of Science in Software Engineering (BSSE)",
    institution: "University of Gujrat",
    startYear: 2014,
    endYear: 2018,
    description: null,
    order: 1,
  });
  assert.match(result.qualification, /Software Engineering/);
});

test("education schema rejects reversed date ranges", () => {
  assert.equal(
    educationSchema.safeParse({
      id: 1,
      qualification: "Bachelor of Science",
      institution: "University of Gujrat",
      startYear: 2018,
      endYear: 2014,
      description: null,
      order: 1,
    }).success,
    false,
  );
});

test("skills schema accepts categorized technologies and featured ordering", () => {
  const result = skillsSchema.parse({
    all: ["Angular", "React", "Figma"],
    featured: ["Angular", "React"],
    proficiency: { Angular: 5, React: 5 },
    categories: [
      {
        id: "frontend",
        label: "FRONTEND",
        title: "Interfaces that make sense.",
        summary: "Responsive applications and component systems.",
        technologies: ["Angular", "React"],
        order: 1,
      },
    ],
  });
  assert.deepEqual(result.featured, ["Angular", "React"]);
});

test("skills schema rejects duplicate technologies and unknown featured skills", () => {
  assert.equal(
    skillsSchema.safeParse({
      all: ["Angular", "Angular"],
      featured: ["Vue"],
      proficiency: {},
      categories: [
        {
          id: "frontend",
          label: "FRONTEND",
          title: "Interfaces",
          summary: "Frontend systems.",
          technologies: ["Angular", "Angular"],
          order: 1,
        },
      ],
    }).success,
    false,
  );
});

const validExperience = {
  id: 1,
  company: "Nextbridge Ltd.",
  location: "Lahore, Punjab",
  role: "Senior Software Engineer",
  startDate: "2022-07",
  endDate: null,
  current: true,
  description: null,
  highlights: [],
  technologies: [],
  order: 1,
};

const validSkills = {
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
};

const validAward = {
  id: 1,
  title: "Student of the Year",
  issuer: "University of Gujrat",
  location: "Sialkot, Punjab",
  startDate: "2015-09",
  endDate: "2016-08",
  order: 1,
};

function issuePaths(result) {
  return result.error.issues.map((issue) => issue.path.join("."));
}

test("award schema accepts a dated award", () => {
  assert.equal(awardSchema.parse(validAward).title, "Student of the Year");
});

test("award schema rejects reversed dates", () => {
  const result = awardSchema.safeParse({ ...validAward, endDate: "2015-08" });
  assert.equal(result.success, false);
  assert.deepEqual(issuePaths(result), ["endDate"]);
});

test("experience schema requires location and highlights", () => {
  const { location, ...withoutLocation } = validExperience;
  assert.equal(experienceSchema.safeParse(withoutLocation).success, false);
  const { highlights, ...withoutHighlights } = validExperience;
  assert.equal(experienceSchema.safeParse(withoutHighlights).success, false);
  assert.equal(
    experienceSchema.safeParse({ ...validExperience, highlights: ["a", "a"] })
      .success,
    false,
  );
});

test("project schema requires features and responsibilities arrays", () => {
  const { features, ...withoutFeatures } = validProject;
  assert.equal(projectSchema.safeParse(withoutFeatures).success, false);
  const { responsibilities, ...withoutResponsibilities } = validProject;
  assert.equal(projectSchema.safeParse(withoutResponsibilities).success, false);
  assert.equal(
    projectSchema.safeParse({ ...validProject, features: [] }).success,
    true,
  );
});

test("skills schema rejects proficiency for unknown skills", () => {
  const unknown = skillsSchema.safeParse({
    ...validSkills,
    proficiency: { RAG: 3 },
  });
  assert.equal(unknown.success, false);
  assert.ok(issuePaths(unknown).includes("proficiency.RAG"));
  assert.equal(
    skillsSchema.safeParse({ ...validSkills, proficiency: { Angular: 6 } })
      .success,
    false,
  );
});

test("profile schema requires a tagline", () => {
  const { tagline, ...withoutTagline } = validProfile;
  assert.equal(profileSchema.safeParse(withoutTagline).success, false);
  assert.equal(profileSchema.safeParse(validProfile).success, true);
});
