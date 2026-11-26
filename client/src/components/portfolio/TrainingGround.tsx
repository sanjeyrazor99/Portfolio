import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { CatmullRomCurve3, Vector3, type Group } from "three";
import { Pause, Play, RotateCcw } from "lucide-react";
import { PitchBall, PitchCanvasBoundary, supportsPitchCanvas } from "./PitchBall";

type Step = readonly [title: string, description: string];
type Point = readonly [x: number, z: number];

const routes: readonly (readonly Point[])[] = [
  [[-10, 7], [-4, -1], [3, 2], [10, -6]],
  [[-10, -4], [-2, 4], [5, -3], [10, 5]],
  [[-10, 5], [-4, 0], [3, -5], [10, 0]],
  [[-10, 0], [-4, -5], [3, 5], [10, -1]],
];
const defenders: readonly Point[] = [[-6, 4], [0, -3], [7, 2]];
const fieldLines = [
  [-13, 0, .07, 18], [13, 0, .07, 18], [0, 0, .07, 18],
  [0, -9, 26, .07], [0, 9, 26, .07], [-9, 0, .07, 8], [9, 0, .07, 8],
  [-11, -4, 4, .07], [-11, 4, 4, .07], [11, -4, 4, .07], [11, 4, 4, .07],
] as const;

function toField([x, z]: Point) {
  return [50 + x * 3.5, 50 + z * 4.7];
}

function DrillScene({ stage, progress }: { stage: number; progress: RefObject<number> }) {
  const ball = useRef<Group>(null);
  const players = useRef<Group>(null);
  const ballPosition = useRef(new Vector3());
  const look = useRef(new Vector3());
  const route = routes[stage];
  const path = useMemo(() => new CatmullRomCurve3(route.map(([x, z]) => new Vector3(x, .52, z))), [route]);
  const trail = useMemo(() => path.getPoints(36), [path]);

  useFrame(({ camera }) => {
    if (!ball.current || !players.current) return;
    const t = progress.current;
    const pass = Math.min(2, Math.floor(t * 3));
    const local = t * 3 - pass;
    const ease = local * local * (3 - 2 * local);
    path.getPoint((pass + ease) / 3, ballPosition.current);
    ballPosition.current.y += Math.sin(local * Math.PI) * (.65 + stage * .09);
    ball.current.position.copy(ballPosition.current);
    ball.current.rotation.set(t * 5, -t * 12, t * -20);
    players.current.children.forEach((player, index) => {
      const [x, z] = defenders[index];
      player.position.set(x + Math.sin((t + index * .13) * Math.PI * 2) * 1.15, 0,
        z + Math.sin(t * Math.PI) * (index % 2 ? 1.7 : -1.4));
    });
    camera.position.set(8 - 13 * t, 21 - Math.sin(t * Math.PI) * 5, 21 + Math.cos(t * Math.PI) * 3);
    look.current.set(ballPosition.current.x * .18, 0, 0);
    camera.lookAt(look.current);
  });

  return (
    <>
      <color attach="background" args={["#081725"]} />
      <hemisphereLight args={["#dce8ff", "#193327", 2.2]} />
      <directionalLight intensity={2.8} position={[-7, 14, 10]} color="#ffdfad" />
      {Array.from({ length: 10 }, (_, index) => (
        <mesh key={index} position={[-11.7 + index * 2.6, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.6, 18]} />
          <meshStandardMaterial color={index % 2 ? "#285644" : "#204638"} />
        </mesh>
      ))}
      {fieldLines.map(([x, z, width, height], index) => (
        <mesh key={index} position={[x, .02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, height]} /><meshBasicMaterial color="#92b8a2" />
        </mesh>
      ))}
      <mesh position={[0, .021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.45, 2.52, 48]} /><meshBasicMaterial color="#92b8a2" />
      </mesh>
      {trail.filter((_, index) => index % 2 === 0).map((point, index) => (
        <mesh key={index} position={[point.x, .028, point.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[.10, 10]} /><meshBasicMaterial color="#e8b763" />
        </mesh>
      ))}
      {route.map(([x, z], index) => (
        <group key={index} position={[x, .045, z]}>
          <mesh position={[0, .20, 0]}>
            <cylinderGeometry args={[.49, .56, .4, 24]} />
            <meshStandardMaterial color={index === 3 ? "#bf8049" : "#8e2349"} metalness={.3} />
          </mesh>
          <mesh position={[0, .01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[.68, .74, 24]} /><meshBasicMaterial color="#edc389" />
          </mesh>
        </group>
      ))}
      <group ref={players}>
        {defenders.map(([x, z], index) => (
          <mesh key={index} position={[x, .24, z]}>
            <cylinderGeometry args={[.42, .50, .46, 20]} /><meshStandardMaterial color="#3264af" />
          </mesh>
        ))}
      </group>
      <group ref={ball}><PitchBall /></group>
    </>
  );
}

export default function TrainingGround({ steps }: { steps: readonly Step[] }) {
  const host = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const invalidate = useRef<(() => void) | null>(null);
  const [step, setStep] = useState(0);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [renderScene, setRenderScene] = useState(false);
  const route = routes[step].map(toField);
  const [title, description] = steps[step];

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    let visible = false;
    const sync = () => setRenderScene(visible && motion.matches && supportsPitchCanvas());
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { rootMargin: "140px" });
    observer.observe(node);
    motion.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = 0;
    let lastValue = -1;
    function draw(time: number) {
      if (last) progress.current = Math.min(1, progress.current + Math.min(time - last, 50) / 3300);
      last = time;
      invalidate.current?.();
      const value = Math.round(progress.current * 100);
      if (value !== lastValue) {
        lastValue = value;
        setPosition(value);
      }
      if (progress.current < 1) frame = requestAnimationFrame(draw);
      else setPlaying(false);
    }
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  function seek(value: number) {
    progress.current = value / 100;
    setPosition(value);
    invalidate.current?.();
  }

  const phase = Math.min(2, Math.floor(position * 3 / 100));
  const blend = position * 3 / 100 - phase;
  const [fromX, fromZ] = route[phase];
  const [toX, toZ] = route[phase + 1];

  return (
    <div className="training-ground" ref={host}>
      <div className="training-steps" role="group" aria-label="Work process">
        {steps.map(([name], index) => (
          <button key={name} type="button" aria-pressed={index === step} onClick={() => {
            setPlaying(false);
            setStep(index);
            seek(0);
          }}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{name}
          </button>
        ))}
      </div>
      <div className="training-screen">
        <div className="training-pitch" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="4" y="7" width="92" height="86" />
            <path d="M50 7v86M4 23h14v54H4m92-54H82v54h14" />
            <ellipse cx="50" cy="50" rx="9" ry="13" />
            <polyline className="training-route" points={route.map(point => point.join(",")).join(" ")} />
            {route.map(([x, z], index) => <circle key={index} className="training-player" cx={x} cy={z} r="2" />)}
            <circle className="training-ball" cx={fromX + (toX - fromX) * blend} cy={fromZ + (toZ - fromZ) * blend} r="1.1" />
          </svg>
          {renderScene && (
            <PitchCanvasBoundary>
              <Canvas frameloop="demand" dpr={[1, 1.4]} camera={{ position: [8, 21, 24], fov: 41 }}
                onCreated={state => { invalidate.current = state.invalidate; }}
                gl={{ powerPreference: "low-power", antialias: true }}>
                <DrillScene stage={step} progress={progress} />
              </Canvas>
            </PitchCanvasBoundary>
          )}
        </div>
        <div className="training-controls">
          <button type="button" aria-label={playing ? "Pause drill" : "Play drill"} onClick={() => {
            if (position === 100) seek(0);
            setPlaying(value => !value);
          }}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
          <input aria-label="Drill progress" type="range" min="0" max="100" value={position} onChange={event => {
            setPlaying(false);
            seek(Number(event.target.value));
          }} />
          <button type="button" aria-label="Restart drill" onClick={() => { setPlaying(false); seek(0); }}>
            <RotateCcw size={17} />
          </button>
        </div>
      </div>
      <div className="training-description" aria-live="polite">
        <h3>{title}</h3><p>{description}</p>
      </div>
    </div>
  );
}
