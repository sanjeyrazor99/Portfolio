import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type { Group, MeshStandardMaterial } from "three";
import { PitchBall } from "./PitchBall";

export type FieldFrame = {
  x: number; y: number; lift: number; run: number; turn: number;
  tilt: number; roll: number; zoom: number; impact: number; scoringSpot: number;
};

const worldX = (value: number) => (value - 50) * .26;
const worldZ = (value: number) => (value - 50) * .18;

function Line({ x = 0, z = 0, width, depth }: { x?: number; z?: number; width: number; depth: number }) {
  return <mesh position={[x, .013, z]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[width, depth]} /><meshBasicMaterial color="#cce7c8" />
  </mesh>;
}

function Goal({ spot, frame }: { spot: number; frame: RefObject<FieldFrame> }) {
  const net = useRef<MeshStandardMaterial>(null);
  useFrame(() => {
    if (net.current) net.current.emissiveIntensity = frame.current.scoringSpot === spot ? frame.current.impact * 2 : 0;
  });
  return <>
    {[-1.4, 1.4].map(x => (
      <mesh key={x} position={[x, .72, 0]}><boxGeometry args={[.085, 1.44, .085]} /><meshStandardMaterial color="#f4f2dc" /></mesh>
    ))}
    <mesh position={[0, 1.44, 0]}><boxGeometry args={[2.88, .085, .085]} /><meshStandardMaterial color="#f4f2dc" /></mesh>
    <mesh position={[0, .68, -.59]}>
      <boxGeometry args={[2.8, 1.32, .12, 14, 7, 1]} />
      <meshStandardMaterial ref={net} color="#cee5de" emissive="#ffd26e" wireframe />
    </mesh>
    {[-1.4, 1.4].map(x => (
      <mesh key={x} position={[x, .66, -.3]}>
        <boxGeometry args={[.02, 1.32, .6, 1, 7, 4]} />
        <meshBasicMaterial color="#b6d1c7" wireframe />
      </mesh>
    ))}
  </>;
}

function Defender({ x, z, timing, side, frame }: {
  x: number; z: number; timing: number; side: number; frame: RefObject<FieldFrame>;
}) {
  const player = useRef<Group>(null);
  useFrame(() => {
    if (!player.current) return;
    const lunge = Math.max(0, 1 - Math.abs(frame.current.run - timing) * 6);
    player.current.position.x = x + side * lunge * .65;
    player.current.rotation.z = -side * lunge * .25;
  });
  return <group ref={player} position={[x, 0, z]}>
    <mesh position={[0, 1.33, 0]}><sphereGeometry args={[.18, 12, 8]} /><meshStandardMaterial color="#c69064" /></mesh>
    <mesh position={[0, .9, 0]}><capsuleGeometry args={[.27, .33, 4, 8]} /><meshStandardMaterial color="#a72c47" /></mesh>
    {[-.16, .16].map(offset => (
      <mesh key={offset} position={[offset, .32, 0]}><capsuleGeometry args={[.09, .46, 3, 8]} /><meshStandardMaterial color="#172043" /></mesh>
    ))}
  </group>;
}

export default function ScoutingField({ frame, spots, goals }: {
  frame: RefObject<FieldFrame>; spots: number[][]; goals: number[];
}) {
  const ball = useRef<Group>(null);
  useFrame(({ camera, size }) => {
    const shot = frame.current;
    const x = worldX(shot.x);
    const z = worldZ(shot.y);
    if (ball.current) {
      ball.current.position.set(x, .4 + shot.lift / 38, z);
      ball.current.rotation.set(shot.turn * .049, shot.turn * .008, shot.turn * -.017);
    }
    const mobile = size.width <= 750;
    const elevation = (90 - shot.tilt) * Math.PI / 180;
    const distance = (mobile ? 24 : 19) / shot.zoom;
    const azimuth = shot.roll * Math.PI / 90;
    const focusX = mobile ? x * .35 : x * .68 + 3.8;
    const focusZ = z * .35;
    camera.position.set(
      focusX + Math.sin(azimuth) * distance,
      Math.sin(elevation) * distance + 3,
      focusZ + Math.cos(elevation) * distance,
    );
    camera.lookAt(focusX, 0, focusZ);
  });

  return <>
    <color attach="background" args={["#90aeb9"]} />
    <fog attach="fog" args={["#90aeb9", 28, 68]} />
    <ambientLight intensity={1.9} />
    <directionalLight position={[-12, 19, 6]} intensity={2.5} color="#fff2d3" />
    <mesh position={[0, -.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[150, 150]} /><meshStandardMaterial color="#16372c" />
    </mesh>
    {Array.from({ length: 12 }, (_, index) => (
      <mesh key={index} position={[(index - 5.5) * 2.3, -.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.3, 19.6]} /><meshStandardMaterial color={index % 2 ? "#2a5c3d" : "#367149"} />
      </mesh>
    ))}
    {[-9, 9].map(z => <Line key={z} z={z} width={26} depth={.065} />)}
    {[-13, 0, 13].map(x => <Line key={x} x={x} width={.065} depth={18} />)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .025, 0]}>
      <ringGeometry args={[2.25, 2.32, 72]} /><meshBasicMaterial color="#cce7c8" />
    </mesh>
    {[-1, 1].map(side => <group key={side} position={[side * 10, 0, 0]}>
      <Line x={-side * 2.9} width={.065} depth={8} />
      {[-4, 4].map(z => <Line key={z} z={z} width={6} depth={.065} />)}
    </group>)}
    {spots.map(([x, y], index) => (
      <group key={x} position={[worldX(x), 0, worldZ(y)]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .04, 0]}>
          <ringGeometry args={[.55, .62, 36]} /><meshBasicMaterial color="#f4d887" />
        </mesh>
        {goals.includes(index) && <Goal spot={index} frame={frame} />}
      </group>
    ))}
    {spots.slice(1).flatMap(([x, y], index) => [0.3, .62].map((point, defender) => {
      const [fromX, fromY] = spots[index];
      const side = defender === 0 ? -1 : 1;
      return <Defender key={index + "-" + defender}
        x={worldX(fromX + (x - fromX) * point) + side * .45}
        z={worldZ(fromY + (y - fromY) * point)}
        timing={index + point} side={side} frame={frame} />;
    }))}
    <group ref={ball}><PitchBall scouting /></group>
  </>;
}
