import { projects } from "./portfolio";

const zones = [
  { name: "Midfield", x: -1.8, z: 8 },
  { name: "Right wing", x: 2.3, z: 3.5 },
  { name: "Holding midfield", x: -2.2, z: -1 },
  { name: "Center back", x: 1.6, z: -5.5 },
  { name: "Goalkeeper", x: 0, z: -10 },
];
const roles = ["Game systems", "Multimodal pipeline", "Modeling and visualization", "Data engineering", "Robotics"];
const metrics = [["44 commits", "4 teammates"], ["24-hour build"], [], ["5 data sources"], []];
const stages = [
  ["Player", "Game server", "AI player"],
  ["Collect", "Read images", "Analyze"],
  ["Shot data", "xG model", "Goalie visuals"],
  ["5 sources", "Python ETL", "Database"],
  ["Sense", "Decide", "Navigate"],
];

export const matchProjects = projects.map((project, index) => ({
  id: project.id,
  defenderZone: zones[index],
  title: project.title,
  subtitle: project.subtitle,
  description: project.description,
  techStack: project.tags,
  metrics: metrics[index],
  mediaUrl: null as string | null,
  liveUrl: project.demo,
  repoUrl: project.github,
  kind: project.kind,
  role: roles[index],
  stages: stages[index],
}));
