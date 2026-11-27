import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Game } from "./game";

export default function HUD({ game, muted, onMute, fullscreen, onFullscreen, onExit, onAction, onStick }: {
  game: Game; muted: boolean; fullscreen: boolean; onFullscreen: () => void; onMute: () => void; onExit: () => void;
  onAction: () => void; onStick: (x: number, z: number) => void;
}) {
  const stick = useRef<HTMLButtonElement>(null);
  const [, refreshRadar] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => refreshRadar(value => value + 1), 100);
    return () => window.clearInterval(timer);
  }, []);
  const playing = game.phase === "play";
  const ready = game.unlocked === game.defenders.length && game.z <= -11;

  function moveStick(event: PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const z = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    const length = Math.max(1, Math.hypot(x, z));
    stick.current?.style.setProperty("--stick-x", x / length * 20 + "px");
    stick.current?.style.setProperty("--stick-y", z / length * 20 + "px");
    onStick(x / length, z / length);
  }

  function resetStick() {
    onStick(0, 0);
    stick.current?.style.removeProperty("--stick-x");
    stick.current?.style.removeProperty("--stick-y");
  }

  return <>
    <div className="play-match-score" aria-label={`${game.unlocked} of ${game.defenders.length} projects unlocked`}>
      <strong>Sanjey FC</strong><span>{game.unlocked} / {game.defenders.length}</span><strong>Portfolio XI</strong>
    </div>
    <div className="play-match-options">
      <button type="button" aria-pressed={!muted} onClick={onMute}>{muted ? "Sound off" : "Sound on"}</button>
      <button type="button" onClick={onFullscreen} aria-pressed={fullscreen}>{fullscreen ? "Exit fullscreen" : "Fullscreen"}</button>
      <button type="button" onClick={onExit}>Scroll projects</button>
    </div>
    {playing && <p className="play-match-controls">{ready ? "Space or tap Shoot to finish" : "WASD / arrows to move · Space for a skill move · Tap the pitch to move"}</p>}
    {playing && <button ref={stick} className="play-match-stick" type="button" aria-label="Touch joystick"
      onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); moveStick(event); }}
      onPointerMove={moveStick} onLostPointerCapture={resetStick} onPointerUp={resetStick} onPointerCancel={resetStick}>
      <i />
    </button>}
    {playing && <button className="play-match-action" type="button" onClick={onAction}>{ready ? "Shoot" : "Skill move"}</button>}
    <svg className="play-match-radar" viewBox="0 0 70 110" aria-label="Pitch map" role="img">
      <rect x="4" y="4" width="62" height="102" rx="5" />
      <path d="M4 55h62 M22 4v15h26V4 M22 106V91h26v15" />
      <circle cx="35" cy="55" r="9" />
      {game.defenders.map(defender => !defender.beaten && <circle key={defender.index}
        cx={35 + defender.x * 3.5} cy={55 + defender.z * 3} r="2.7" fill="#ff819c" stroke="none" />)}
      <circle cx={35 + game.x * 3.5} cy={55 + game.z * 3} r="3.3" fill="#92deff" stroke="none" />
    </svg>
  </>;
}
