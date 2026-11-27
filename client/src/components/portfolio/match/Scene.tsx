import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Sparkles } from "@react-three/drei";
import gsap from "gsap";
import { useEffect, useRef, type RefObject } from "react";
import { Vector3, type Camera } from "three";
import Defender from "./Defender";
import Pitch from "./Pitch";
import Player, { type MatchInput } from "./Player";
import type { Game, Phase } from "./game";

function MatchCamera({ game }: { game: Game }) {
  const zoom = useRef({ value: 0 });
  const previous = useRef<Phase>("play");
  const target = useRef(new Vector3());
  const focus = useRef(new Vector3(0, 1, 8));
  useEffect(() => () => { gsap.killTweensOf(zoom.current); }, []);
  useFrame(({ camera }, dt) => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (game.phase !== previous.current) {
      previous.current = game.phase;
      gsap.to(zoom.current, { value: !reduced && game.phase !== "play" ? 1 : 0, duration: .55, ease: "power2.out", overwrite: true });
    }
    const cinematic = zoom.current.value;
    const z = game.phase === "goal" ? -12.3 : game.z;
    const x = game.phase === "goal" ? 0 : game.x * .68;
    const smooth = 1 - Math.exp(-dt * 7);
    camera.position.lerp(target.current.set(x + 2.7 * cinematic, 7.3 - cinematic * 2.3, z + 8.7 - cinematic * 2.9), smooth);
    focus.current.lerp(target.current.set(x, 1, z - 3.2), smooth);
    camera.lookAt(focus.current);
  });
  return null;
}

export default function Scene({ game, input, aim, onPhase, phase }: {
  game: Game; input: RefObject<MatchInput>; aim: (x: number, z: number) => void;
  onPhase: (phase: Phase, count: number) => void; phase: Phase;
}) {
  const camera = { position: [0, 7.4, 21] as [number, number, number], fov: 55, near: .1, far: 90 };
  return <Canvas dpr={[1, 1.5]} camera={camera}
    onCreated={({ camera: view }: { camera: Camera }) => view.lookAt(0, 1, 9)}
    gl={{ antialias: true, powerPreference: "high-performance" }}>
    <color attach="background" args={["#10192c"]} />
    <fog attach="fog" args={["#10192c", 24, 56]} />
    <hemisphereLight args={["#c7e4ff", "#355046", 2.1]} />
    <directionalLight position={[-7, 12, 7]} color="#fff3db" intensity={2.15} />
    <Pitch game={game} aim={aim} />
    <Player game={game} input={input} onPhase={onPhase} />
    {game.defenders.map((defender, index) => <Defender key={defender.name} game={game} index={index} />)}
    <Sparkles count={34} scale={[23, 7, 32]} size={1.7} speed={.28} opacity={.28} color="#aeeaff" />
    {phase === "goal" && <Sparkles position={[0, 2, -13]} count={105} scale={[9, 6, 6]} size={5} speed={2} color="#ffd782" />}
    <MatchCamera game={game} />
    <EffectComposer multisampling={0}>
      <Bloom intensity={.48} luminanceThreshold={1} mipmapBlur />
    </EffectComposer>
  </Canvas>;
}
