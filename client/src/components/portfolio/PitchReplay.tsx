import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type RefObject } from "react";
import { CatmullRomCurve3, Vector3, type Group } from "three";
import { PitchBall, PitchCanvasBoundary, supportsPitchCanvas } from "./PitchBall";

const spots = [
  [-11, 17], [-6, 9], [7, 4], [-6, -5], [7, -11], [-2.8, -23],
] as const;
const arrivals = { projects: 1, process: 2, experience: 3, skills: 4, contact: 5 } as const;
type Chapter = keyof typeof arrivals;

const plays = spots.slice(1).map(([x, z], index) => {
  const [fromX, fromZ] = spots[index];
  const loft = index === spots.length - 2 ? 3.55 : 1.35;
  const bend = index % 2 ? 2.2 : -1.8;
  const curve = new CatmullRomCurve3([
    new Vector3(fromX, .43, fromZ),
    new Vector3(fromX * .66 + x * .34 + bend, loft, fromZ * .66 + z * .34),
    new Vector3(fromX * .27 + x * .73 + bend, loft * .8, fromZ * .27 + z * .73),
    new Vector3(x, .43, z),
  ]);
  return { curve, trail: curve.getPoints(30) };
});

function Stripe({ x = 0, z = 0, width, length }: { x?: number; z?: number; width: number; length: number }) {
  return (
    <mesh position={[x, .015, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, length]} />
      <meshBasicMaterial color="#a9c7b9" />
    </mesh>
  );
}

function PitchScene({ progress, arrival }: { progress: RefObject<number>; arrival: number }) {
  const ball = useRef<Group>(null);
  const trail = useRef<Group>(null);
  const receiver = useRef<Group>(null);
  const point = useRef(new Vector3());
  const eye = useRef(new Vector3());
  const target = useRef(new Vector3());
  const play = plays[arrival - 1];

  useFrame(({ camera }) => {
    if (!ball.current || !trail.current || !receiver.current) return;
    const progressValue = progress.current;
    const pass = progressValue * progressValue * (3 - 2 * progressValue);
    play.curve.getPoint(pass, point.current);
    ball.current.position.copy(point.current);
    ball.current.rotation.set(pass * -16, pass * 5, (arrival % 2 ? 1 : -1) * pass * 22);
    const segments = trail.current.children;
    segments.forEach((segment, index) => {
      const fraction = index / (segments.length - 1);
      segment.visible = pass > fraction && pass < fraction + .42;
    });
    const received = Math.max(0, (pass - .78) / .22);
    receiver.current.scale.setScalar(1 + received * .24);
    const side = arrival % 2 ? 1 : -1;
    eye.current.set(side * (11 - pass * 6) + point.current.x * .42, 27 - pass * 15, 16 + point.current.z * .52);
    target.current.set(point.current.x * .55, .16, point.current.z - 3);
    camera.position.copy(eye.current);
    camera.lookAt(target.current);
  });

  return (
    <>
      <color attach="background" args={["#080d20"]} />
      <fog attach="fog" args={["#080d20", 39, 100]} />
      <hemisphereLight args={["#f2dfff", "#13231d", 1.8]} />
      <directionalLight position={[-18, 24, -12]} intensity={3} color="#b2c8ff" />
      <directionalLight position={[20, 13, 8]} intensity={2} color="#ffb68f" />
      {Array.from({ length: 12 }, (_, index) => (
        <mesh key={index} position={[0, 0, -22 + index * 4]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[34, 4]} />
          <meshStandardMaterial color={index % 2 ? "#173d34" : "#204c3e"} roughness={1} />
        </mesh>
      ))}
      {[-17, 17].map(x => <Stripe key={x} x={x} width={.09} length={48} />)}
      {[-24, 0, 24].map(z => <Stripe key={z} z={z} width={34} length={.09} />)}
      <Stripe z={-15} width={19} length={.09} />
      {[-9.5, 9.5].map(x => <Stripe key={x} x={x} z={-19.5} width={.09} length={9} />)}
      <mesh position={[0, .022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.9, 4, 64]} /><meshBasicMaterial color="#a9c7b9" />
      </mesh>
      {spots.map(([x, z], index) => (
        <group key={index} position={[x, .025, z]}>
          <group ref={index === arrival ? receiver : undefined}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[.69, index === arrival ? .84 : .75, 32]} />
              <meshBasicMaterial color={index === arrival ? "#ffe097" : index < arrival ? "#bd8d66" : "#839c9b"} />
            </mesh>
            <mesh position={[0, -.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[.68, 32]} />
              <meshBasicMaterial color={index === arrival ? "#8e2349" : "#1a2b4c"} transparent opacity={.9} />
            </mesh>
          </group>
        </group>
      ))}
      {plays.flatMap(({ trail: route }, index) => route.filter((_, step) => step % 3 === 1).map((position, step) => (
        <mesh key={index + ":" + step} position={[position.x, .023, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[index === arrival - 1 ? .09 : .055, 8]} />
          <meshBasicMaterial color={index === arrival - 1 ? "#edb851" : "#788f88"} />
        </mesh>
      )))}
      {[-4.2, 4.2].map(x => (
        <mesh key={x} position={[x, 1.55, -24]}>
          <boxGeometry args={[.11, 3.1, .11]} /><meshStandardMaterial color="#fff0d4" />
        </mesh>
      ))}
      <mesh position={[0, 3.1, -24]}>
        <boxGeometry args={[8.5, .11, .11]} /><meshStandardMaterial color="#fff0d4" />
      </mesh>
      <mesh position={[0, 1.55, -25]}>
        <planeGeometry args={[8.4, 3.1, 29, 12]} /><meshBasicMaterial color="#949ed0" wireframe transparent opacity={.23} />
      </mesh>
      {[-19, 19].map((x, index) => (
        <group key={x} position={[x, 0, -20]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[.11, .23, 8, 8]} /><meshStandardMaterial color="#26334d" />
          </mesh>
          <mesh position={[0, 8, 0]}>
            <boxGeometry args={[3.2, .55, .4]} /><meshBasicMaterial color={index ? "#ffca92" : "#bacbff"} />
          </mesh>
        </group>
      ))}
      <group ref={trail}>
        {play.trail.map((position, index) => (
          <mesh key={index} position={position} visible={false}>
            <sphereGeometry args={[.08 + index * .0025, 8, 6]} />
            <meshBasicMaterial color={index % 3 ? "#edb851" : "#ffe8a6"} transparent opacity={.64} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <group ref={ball} position={play.trail[0]}>
        <PitchBall />
      </group>
    </>
  );
}

export default function PitchReplay({ chapter }: { chapter: Chapter }) {
  const layer = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const requestDraw = useRef<(() => void) | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [nearby, setNearby] = useState(false);
  const arrival = arrivals[chapter];

  useEffect(() => {
    const element = layer.current;
    if (!element) return;
    const preference = matchMedia("(min-width: 640px) and (prefers-reduced-motion: no-preference)");
    const detect = () => setEnabled(preference.matches && supportsPitchCanvas());
    const preload = new IntersectionObserver(([entry]) => setNearby(entry.isIntersecting), { rootMargin: "320px" });
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = element.getBoundingClientRect().top;
      const start = window.innerHeight * .86;
      const distance = window.innerHeight * .76;
      const next = Math.max(0, Math.min(1, (start - top) / Math.max(1, distance)));
      const fade = Math.max(0, Math.min(1, (top + element.offsetHeight * .84) / (element.offsetHeight * .46)));
      element.style.setProperty("--pitch-opacity", String(fade));
      if (next === progress.current) return;
      progress.current = next;
      requestDraw.current?.();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    detect();
    update();
    preload.observe(element);
    preference.addEventListener("change", detect);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      preload.disconnect();
      preference.removeEventListener("change", detect);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={layer} className="pitch-replay" data-pitch-arrival={chapter} aria-hidden="true">
      <div className="pitch-replay-field">
        <i /><i />
        <svg viewBox="-17 -24 34 48" preserveAspectRatio="none">
          <polyline points={spots.map(spot => spot.join(",")).join(" ")} />
          {spots.map(([x, z], index) => (
            <circle key={index} cx={x} cy={z} r={index === arrival ? .9 : .5} data-receiver={index === arrival} />
          ))}
        </svg>
      </div>
      {enabled && nearby && (
        <div className="pitch-replay-canvas">
          <PitchCanvasBoundary>
            <Canvas dpr={[1, 1.4]} frameloop="demand"
              onCreated={({ invalidate }) => { requestDraw.current = invalidate; }}
              camera={{ fov: 49, near: .1, far: 120, position: [0, 44, 22] }}
              gl={{ antialias: true, powerPreference: "low-power" }}>
              <PitchScene progress={progress} arrival={arrival} />
            </Canvas>
          </PitchCanvasBoundary>
        </div>
      )}
    </div>
  );
}
