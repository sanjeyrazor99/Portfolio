import {
  chatProfile,
  experiences,
  projects,
  skillGroups,
} from "@/data/portfolio";

export const topics = [
  {
    id: "projects",
    title: "Projects",
    question: "What projects has Sanjey built?",
  },
  {
    id: "data",
    title: "Data systems",
    question: "How does the defense intelligence pipeline work?",
  },
  {
    id: "ai",
    title: "AI & evaluation",
    question: "What is Sanjey's experience with RAG and LLM evaluation?",
  },
  {
    id: "experience",
    title: "Experience",
    question: "Where has Sanjey worked?",
  },
  {
    id: "about",
    title: "About Sanjey",
    question: "What is Sanjey studying and what roles is he looking for?",
  },
] as const;

export type Topic = (typeof topics)[number]["id"];
export interface PortfolioSource {
  id: string;
  title: string;
  text: string;
  href: string;
  topic: Topic;
}
export interface PortfolioAnswer {
  text: string;
  sources: PortfolioSource[];
  followups: string[];
  topic?: Topic;
}
const stop = new Set(
  "a an the is are was were of to for in on with and or i me my you your he his she it sanjey manian what how does do has have tell about can more please".split(
    " "
  )
);
function tokens(text: string) {
  return (text.toLowerCase().match(/[a-z0-9+#]+/g) ?? []).filter(
    word => !stop.has(word)
  );
}
export const portfolioSources: PortfolioSource[] = [
  ...projects.map(project => ({
    id: project.id,
    title: project.title,
    text:
      project.subtitle +
      ". " +
      project.description +
      " Technologies: " +
      project.tags.join(", ") +
      ".",
    href: "#project-" + project.id,
    topic: (project.kind === "pipeline" ? "data" : "projects") as Topic,
  })),
  ...experiences.map((role, index) => ({
    id: "experience-" + index,
    title: role.role + " · " + role.org,
    text: [role.dates, role.type, role.location, ...role.bullets]
      .filter(Boolean)
      .join(". "),
    href: "#experience",
    topic: "experience" as Topic,
  })),
  {
    id: "profile",
    title: "Education & availability",
    text: [
      chatProfile.education,
      chatProfile.availability,
      chatProfile.location,
      chatProfile.coursework,
    ].join(" "),
    href: "#about",
    topic: "about",
  },
  {
    id: "overview",
    title: "AI & data engineering focus",
    text: chatProfile.overview,
    href: "#about",
    topic: "ai",
  },
  {
    id: "creative",
    title: "Creative & business background",
    text: chatProfile.creative,
    href: "#creative",
    topic: "about",
  },
  ...skillGroups.map(group => ({
    id: "skills-" + group.id,
    title: group.title,
    text: group.skills.join(", "),
    href: "#skills",
    topic: (group.id === "garou" ? "ai" : "data") as Topic,
  })),
];

export function answerPortfolio(
  question: string,
  previousSources: string[] = []
): PortfolioAnswer {
  const normalized = question.toLowerCase();
  let query = question;
  if (
    /\b(that|this|more|it)\b/i.test(question) &&
    tokens(question).length < 4
  ) {
    const previous = portfolioSources.find(
      source => source.id === previousSources[0]
    );
    if (previous) query += " " + previous.title;
  }
  query = query
    .replace(/\betl\b/gi, "ETL ingestion pipelines")
    .replace(/\brag\b/gi, "RAG Supabase retrieval")
    .replace(/\bllm\b/gi, "LLM model evaluation failures")
    .replace(
      /\bstudy|studying|school|degree\b/gi,
      "education university computer science"
    )
    .replace(
      /\blooking for|hiring|internships|available\b/gi,
      "availability internships"
    );
  const terms = [...new Set(tokens(query))];
  const broadProjects = /what projects|show.*projects|projects.*built/i.test(
    normalized
  );
  const broadExperience =
    /where.*worked|work history|experience overview/i.test(normalized);
  let sources: PortfolioSource[];
  if (broadProjects)
    sources = portfolioSources
      .filter(source => projects.some(project => project.id === source.id))
      .slice(0, 3);
  else if (broadExperience)
    sources = portfolioSources
      .filter(source => source.id.startsWith("experience-"))
      .slice(0, 3);
  else
    sources = portfolioSources
      .map(source => {
        const title = tokens(source.title);
        const body = tokens(source.text);
        const matched = terms.filter(
          term => title.includes(term) || body.includes(term)
        );
        const score = matched.reduce((total, term) => {
          const frequency = portfolioSources.filter(doc =>
            tokens(doc.text + " " + doc.title).includes(term)
          ).length;
          return (
            total +
            Math.log(1 + portfolioSources.length / (1 + frequency)) *
              (title.includes(term) ? 3 : 1)
          );
        }, 0);
        return { source, score, matches: matched.length };
      })
      .filter(
        result =>
          result.score > 1.5 &&
          result.matches >= Math.min(2, terms.length) &&
          terms.length > 0
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(result => result.source);
  if (!sources.length)
    return {
      text: "I couldn't find that in Sanjey's portfolio. Try a project, technology, or role below, or contact Sanjey directly for details.",
      sources: [],
      followups: topics.slice(0, 3).map(topic => topic.question),
    };
  const topic: Topic = broadExperience
    ? "experience"
    : broadProjects
      ? "projects"
      : sources[0].topic;
  const followups: string[] = topics
    .filter(item => item.id !== topic)
    .slice(0, 2)
    .map(item => item.question);
  if (sources[0].id === "defense-intelligence")
    followups.unshift("What did Sanjey do at The Data Mine?");
  return {
    text: broadProjects
      ? "Here are three projects to start with. Open a source to explore its full card."
      : broadExperience
        ? "Here are a few roles from Sanjey's experience. The explorer has all eight."
        : "Here's what Sanjey's portfolio documents.",
    sources,
    followups: followups.slice(0, 3),
    topic,
  };
}

