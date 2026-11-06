// All biographical content comes from the supplied portfolio brief.
// Hero ranks are fictional visual timeline styling, not professional credentials.
export type PortfolioLens = "saitama" | "garou" | "creative";

export interface Experience {
  role: string;
  org: string;
  type?: string;
  location?: string;
  dates: string;
  bullets: string[];
  aside?: string;
  rank: string;
  lens: PortfolioLens;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  github: string | null;
  demo: string | null;
  kind: "game" | "ai" | "analytics" | "pipeline" | "robot";
}

export interface SkillGroup {
  id: PortfolioLens;
  title: string;
  subtitle: string;
  skills: string[];
  color: string;
}

export interface PortfolioStat {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
}

// Newest start date first; simultaneous starts retain their source order.
export const experiences: Experience[] = [
  {
    role: "EAA Data Engineer Intern",
    org: "NGAI",
    type: "Internship",
    location: "Remote (Los Angeles, CA)",
    dates: "Oct 2026 – Present",
    bullets: [
      "Developing data engineering foundations, automated ingestion pipelines, and REST API integrations for the Enterprise Advanced Analytics (EAA) platform.",
      "Building data normalization, entity resolution, and automated validation workflows using Python, SQL (PostgreSQL), and Frappe Framework to maintain enterprise data quality.",
      "Implementing semantic data models, lineage tracking, and multi-tenant access controls for downstream business intelligence and reporting.",
    ],
    rank: "S-Class",
    lens: "saitama",
  },
  {
    role: "Engineer / Researcher",
    org: "Sports Analytics Club at UTD",
    location: "On-site, Richardson, TX",
    dates: "Aug 2026 – Present",
    bullets: [
      "Developing a custom NHL Expected Goals (xG) pipeline from detailed play-by-play data, using shot location, angle, distance, shot type, rebound context, and rush status to estimate shot quality in real time.",
      "Building features and classification models with Python, pandas, scikit-learn, and XGBoost to calculate Goals Saved Above Expected (GSAx), with Streamlit and Plotly visualizations for shot maps and goaltender analysis.",
    ],
    rank: "A-Class",
    lens: "garou",
  },
  {
    role: "Events / Video Editor Officer",
    org: "Google Developer Group UTD",
    type: "Part-time",
    location: "On-site, Richardson, TX",
    dates: "Aug 2026 – Present",
    bullets: [
      "Direct planning and day-of execution for technical workshops, hackathons, and networking sessions for the campus developer community.",
      "Produce and edit short-form video content and event recap reels to drive marketing reach and attendance.",
      "Manage event logistics, speaker coordination, and venue management while collaborating with executive officers.",
    ],
    rank: "A-Class",
    lens: "creative",
  },
  {
    role: "Barista",
    org: "Feng Cha",
    type: "Part-time",
    location: "On-site, Plano, TX",
    dates: "Jun 2026 – Present",
    bullets: [
      "Prepare handcrafted teas, signature beverages, and desserts with a focus on speed, presentation, and recipe consistency.",
      "Held 100% order accuracy across 150+ transactions per shift by double-checking every ticket.",
      "Collaborate with the team during peak rushes to streamline drink assembly and keep the store running smoothly.",
    ],
    aside: "",
    rank: "B-Class",
    lens: "saitama",
  },
  {
    role: "Undergraduate Data Science Researcher",
    org: "The Data Mine, Purdue University",
    type: "Internship",
    location: "Hybrid",
    dates: "Jan 2026 – Present",
    bullets: [
      "Engineered automated, fully Python-based ETL pipelines for unstructured data from SEC.gov, PatentsView, and SAM.gov, cutting data-collection time by an estimated 80% (Air Force and DoD projects).",
      "Built and deployed an interactive Streamlit frontend to visualize large-scale datasets for commercial and defense intelligence platforms.",
      "Containerized the entire pipeline and frontend with Docker for scalable, consistent deployment.",
      "Integrated a Retrieval-Augmented Generation (RAG) system on Supabase to optimize complex querying, schema modeling, and retrieval speed.",
      "Analyzed 1,000+ records from PitchBook, USASpending.gov, and SAM.gov to surface commercial technology trends, via technical reports for stakeholders.",
    ],
    rank: "B-Class",
    lens: "saitama",
  },
  {
    role: "AI Trainer & Data Annotator",
    org: "Handshake AI (Project Lizard)",
    dates: "Jan 2026 – Present",
    bullets: [
      "Found 100+ LLM failures and hallucinations by stress-testing a multimodal generative AI model on visual-reasoning prompts.",
      "Evaluated model quality on flagged edge cases by tracing root causes and writing training data.",
    ],
    aside: "",
    rank: "B-Class",
    lens: "garou",
  },
  {
    role: "Account Manager",
    org: "Ecommerce (Amazon FBA Business)",
    type: "Full-time",
    location: "Remote",
    dates: "Sep 2023 – Present",
    bullets: [],
    rank: "C-Class",
    lens: "creative",
  },
  {
    role: "Video Editor",
    org: "YouTube Creators",
    type: "Part-time",
    location: "Remote, United States",
    dates: "Jan 2020 – Present",
    bullets: ["Skills: Search Engine Optimization (SEO), Analytical Skills."],
    aside: "Origin Story",
    rank: "C-Class",
    lens: "creative",
  },
];

export const projects: Project[] = [
  {
    id: "amuse-us",
    title: "aMuse-Us",
    subtitle: "Multiplayer AI Social-Deduction Game · HackTX, 2026",
    description:
      "Co-built a real-time game with a conversational AI player (44 commits across a team of 4). React/TypeScript frontend, Node/Socket.IO server, and the AI player.",
    tags: ["React", "TypeScript", "Node.js", "Socket.IO", "Conversational AI"],
    github: "https://github.com/Sourpatchdurpy/aMuse-Us",
    demo: null,
    kind: "game",
  },
  {
    id: "memeotron",
    title: "MEMEoTron",
    subtitle:
      "AI-Driven Meme Intelligence for Marketing Research · HackUTD, Nov 2025",
    description:
      "Shipped real-time trend analysis in 24 hours by chaining the open NVIDIA Nemotron-Nano-4B-v1.1 model, Google Cloud OCR, and web scraping into a multimodal pipeline in Google Colab.",
    tags: ["LLMs", "OCR", "Multimodal", "Nemotron", "Google Cloud"],
    github: "https://github.com/tylerle29/Memotron",
    demo: null,
    kind: "ai",
  },
  {
    id: "nhl-analytics",
    title: "NHL Expected Goals (xG) & GSAx Analytics",
    subtitle: "Sports Analytics Club at UTD",
    description:
      "Custom xG model and goaltender analysis with shot maps and goalie visuals.",
    tags: [
      "Python",
      "pandas",
      "scikit-learn",
      "XGBoost",
      "Streamlit",
      "Plotly",
    ],
    github: null,
    demo: null,
    kind: "analytics",
  },
  {
    id: "defense-intelligence",
    title: "Automated Defense Intelligence Pipeline",
    subtitle: "Small Business Consulting Corp. & The Data Mine",
    description:
      "Expanded database coverage across 5 intelligence sources by building Python ETL pipelines.",
    tags: ["Python", "ETL", "SQL"],
    github: null,
    demo: null,
    kind: "pipeline",
  },
  {
    id: "backpack-robot",
    title: "Backpack Robot",
    subtitle:
      "User-Following & Obstacle-Evasion Robot · Personal Project, Jul 2024",
    description:
      "Programmed an Arduino robot with ultrasonic sensors that navigated obstacles autonomously in real-world trials.",
    tags: ["Arduino", "Sensors", "Robotics"],
    github: null,
    demo: null,
    kind: "robot",
  },
];

export const skillGroups: SkillGroup[] = [
  {
    id: "saitama",
    title: "Software & Data",
    subtitle: "Build & ship",
    color: "#FFD400",
    skills: [
      "Python (pandas)",
      "SQL (PostgreSQL)",
      "JavaScript",
      "TypeScript",
      "Java",
      "C++",
      "React",
      "Node.js",
      "Socket.IO (WebSockets)",
      "REST APIs",
      "Docker",
      "Git",
      "Google Cloud (OCR)",
      "Supabase",
      "Streamlit",
      "Frappe Framework",
      "IT Integration",
      "Linux/Unix",
    ],
  },
  {
    id: "garou",
    title: "AI & Evaluation",
    subtitle: "AI & evaluation",
    color: "#7B2CBF",
    skills: [
      "Large Language Models (LLMs)",
      "Generative AI",
      "Retrieval-Augmented Generation (RAG)",
      "Conversational AI",
      "Model Evaluation",
      "Open-Source Models (NVIDIA Nemotron)",
      "Machine Learning (scikit-learn, XGBoost)",
      "Debugging & Root-Cause Analysis",
      "Problem Solving",
    ],
  },
  {
    id: "creative",
    title: "Creative & Business",
    subtitle: "Creative & business",
    color: "#00E5FF",
    skills: [
      "Video Editing",
      "Event Planning",
      "Search Engine Optimization (SEO)",
      "Analytical Skills",
      "E-commerce / Amazon FBA account management",
      "Technical documentation",
      "Teamwork",
    ],
  },
];

export const stats: PortfolioStat[] = [
  { value: 100, suffix: "+", label: "LLM failures logged" },
  { value: 80, prefix: "~", suffix: "%", label: "less data-collection time" },
  { value: 1000, suffix: "+", label: "records analyzed" },
  { value: 24, suffix: "-hour", label: "hackathon build" },
  { value: 44, suffix: "", label: "commits (aMuse-Us)" },
  { value: 5, suffix: "", label: "intelligence sources integrated" },
  { value: 6, suffix: "+", label: "years video editing" },
];

// Supplied resume and two GitHub URLs are attached; reel, demos and form endpoint remain pending.
// Null links must stay inactive until Sanjey supplies the real destinations.
export const portfolioLinks = {
  resume: "/sanjey-resume-public.pdf" as string | null,
  reel: null as string | null,
  formspree: null as string | null,
  email: "maniansanjey@gmail.com",
  linkedin: "https://www.linkedin.com/in/sanjeymanian/",
};

export const certifications: string[] = [
  "NOCTI Certification – Cybersecurity",
  "AI Engineering with Python (in progress)",
];
export const chatProfile = {
  name: "Sanjey Manian",
  headline: "AI/LLM & Data Engineer",
  location: "Plano, TX",
  education: "B.S. in Computer Science, The University of Texas at Dallas, expected 2028.",
  availability: "Open to Data & AI internships.",
  coursework: "Data Structures & Algorithms, Object-Oriented Programming, Databases (SQL), Linux/Unix Systems.",
  overview: "Builds LLM-powered and machine learning systems in Python, including a RAG system on Supabase and an AI player for a real-time multiplayer game. Builds enterprise data pipelines and has stress-tested a multimodal generative AI model to log 100+ failures.",
  creative: "Video editing for YouTube creators since 2020 and work in an Amazon FBA e-commerce business since 2023.",
};
