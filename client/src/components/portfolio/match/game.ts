import { matchProjects } from "@/data/projects";

export type Phase = "play" | "project" | "shot" | "goal";
export const goalZ = -15;
export const shootZ = -12;
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function createGame() {
  return {
    x: 0, z: 13, dx: 0, dz: -1, elapsed: 0, burst: 0, cooldown: 0,
    shot: 0, phase: "play" as Phase, unlocked: 0,
    defenders: matchProjects.map((project, index) => ({ ...project.defenderZone, index, beaten: false })),
  };
}

export type Game = ReturnType<typeof createGame>;
