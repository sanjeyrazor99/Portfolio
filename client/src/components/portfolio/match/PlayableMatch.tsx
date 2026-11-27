import { useEffect, useRef, useState } from "react";
import { PitchCanvasBoundary } from "../PitchBall";
import HUD from "./HUD";
import ProjectModal from "./ProjectModal";
import Scene from "./Scene";
import { clamp, createGame, shootZ, type Phase } from "./game";
import type { MatchInput } from "./Player";

export default function PlayableMatch({ onExit }: { onExit: () => void }) {
  const [game] = useState(createGame);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const [phase, setPhase] = useState<Phase>("play");
  const [muted, setMuted] = useState(true);
  const region = useRef<HTMLDivElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const input = useRef<MatchInput>({ keys: new Set(), aim: null, joystick: [0, 0], action: false });

  useEffect(() => {
    const node = region.current;
    node?.scrollIntoView({ block: "start", behavior: "instant" });
    node?.focus({ preventScroll: true });
    return () => { void audio.current?.close(); audio.current = null; };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === region.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    const node = region.current;
    if (!node) return;
    try {
      setFullscreenError(false);
      if (document.fullscreenElement === node) await document.exitFullscreen();
      else await node.requestFullscreen();
      node.focus({ preventScroll: true });
    } catch {
      setFullscreenError(true);
    }
  }

  function sound(goal: boolean) {
    const ctx = audio.current;
    if (muted || !ctx || ctx.state !== "running") return;
    (goal ? [392, 523, 659, 784] : [330, 493]).forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * .09;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.001, start);
      gain.gain.exponentialRampToValueAtTime(.09, start + .025);
      gain.gain.exponentialRampToValueAtTime(.001, start + .23);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + .24);
    });
  }

  function phaseChanged(next: Phase) {
    setPhase(next);
    input.current.keys.clear();
    input.current.joystick = [0, 0];
    if (next === "project" || next === "goal") sound(next === "goal");
  }

  function aim(x: number, z: number) {
    if (game.phase !== "play") return;
    if (game.z <= shootZ + 1 && game.unlocked === game.defenders.length && z < shootZ) {
      input.current.action = true;
      return;
    }
    input.current.aim = [clamp(x, -7.45, 7.45), clamp(z, shootZ, 15)];
  }

  function resume() {
    game.phase = "play";
    setPhase("play");
    requestAnimationFrame(() => region.current?.focus({ preventScroll: true }));
  }

  return <div ref={region} className="play-match" tabIndex={0} aria-label="Playable soccer portfolio"
    onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      const key = event.key.toLowerCase();
      if (key === "escape") { if (!document.fullscreenElement) onExit(); return; }
      if (!["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright", " "].includes(key)) return;
      event.preventDefault();
      if (key === " " && !event.repeat) input.current.action = true;
      else if (key !== " ") input.current.keys.add(key);
    }}
    onKeyUp={event => input.current.keys.delete(event.key.toLowerCase())}
    onBlur={() => input.current.keys.clear()}>
    <div className="play-match-scene" onPointerDown={() => region.current?.focus({ preventScroll: true })}>
      <PitchCanvasBoundary>
        <Scene game={game} input={input} aim={aim} onPhase={phaseChanged} phase={phase} />
      </PitchCanvasBoundary>
    </div>
    {fullscreenError && <p className="play-match-fullscreen-error" role="status">Fullscreen is unavailable in this browser.</p>}
    <HUD game={game} muted={muted} fullscreen={fullscreen} onFullscreen={toggleFullscreen} onMute={() => {
      if (muted && typeof AudioContext !== "undefined") {
        audio.current ??= new AudioContext();
        void audio.current.resume().catch(() => {});
      }
      setMuted(value => !value);
    }} onExit={onExit} onAction={() => {
      input.current.action = true;
      region.current?.focus({ preventScroll: true });
    }} onStick={(x, z) => { input.current.joystick = [x, z]; }} />
    {phase === "goal" && <p className="play-match-full-time" role="status">Goal! · 5 projects unlocked</p>}
    {phase === "project" && <ProjectModal index={game.unlocked - 1} onContinue={resume} />}
  </div>;
}
