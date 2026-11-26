import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { goalZ, type Game } from "./game";

function Mark({ x = 0, z = 0, width, depth }: { x?: number; z?: number; width: number; depth: number }) {
  return <mesh position={[x, .018, z]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[width, depth]} /><meshBasicMaterial color="#e7f4dd" />
  </mesh>;
}

export default function Pitch({ game, aim }: { game: Game; aim: (x: number, z: number) => void }) {
  const net = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!net.current) return;
    const age = Math.max(0, game.shot - .79);
    net.current.scale.z = game.phase === "goal" ? 1 + Math.sin(age * 22 + clock.elapsedTime * 13) * .14 * Math.exp(-age * 3) : 1;
  });
  return <>
    <mesh position={[0, -.04, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={event => {
      event.stopPropagation();
      aim(event.point.x, event.point.z);
    }}>
      <planeGeometry args={[20, 36]} /><meshStandardMaterial color="#16382f" />
    </mesh>
    {Array.from({ length: 16 }, (_, index) => <mesh key={index} position={[0, -.025, -15 + index * 2]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => {}}>
      <planeGeometry args={[16, 2]} /><meshStandardMaterial color={index % 2 ? "#23513e" : "#2c6047"} />
    </mesh>)}
    {[-8, 8].map(x => <Mark key={x} x={x} width={.07} depth={32} />)}
    {[-16, 0, 16].map(z => <Mark key={z} z={z} width={16} depth={.07} />)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .03, 0]}>
      <ringGeometry args={[2.45, 2.52, 64]} /><meshBasicMaterial color="#e7f4dd" />
    </mesh>
    <Mark x={-4.4} z={-13.5} width={.07} depth={5} />
    <Mark x={4.4} z={-13.5} width={.07} depth={5} />
    <Mark z={-11} width={8.8} depth={.07} />
    <group position={[0, 0, goalZ]}>
      {[-2.5, 2.5].map(x => <mesh key={x} position={[x, 1.28, 0]}>
        <boxGeometry args={[.11, 2.56, .11]} /><meshStandardMaterial color="#fff2cf" />
      </mesh>)}
      <mesh position={[0, 2.56, 0]}><boxGeometry args={[5.1, .11, .11]} /><meshStandardMaterial color="#fff2cf" /></mesh>
      <group ref={net}>
        <mesh position={[0, 1.28, -.7]}>
          <boxGeometry args={[5, 2.55, 1.4, 24, 12, 5]} /><meshStandardMaterial color="#a5c5c8" wireframe />
        </mesh>
      </group>
    </group>
    {[-1, 1].flatMap(side => [-12, -1, 11].map(z => <group key={side + ":" + z} position={[side * 11, 0, z]}>
      <mesh position={[0, 2.7, 0]}><boxGeometry args={[.16, 5.4, .16]} /><meshStandardMaterial color="#2b4158" /></mesh>
      <mesh position={[0, 5.4, 0]}>
        <boxGeometry args={[1.4, .35, .35]} /><meshStandardMaterial color="#e4f6ff" emissive="#97c8ff" emissiveIntensity={3} />
      </mesh>
    </group>))}
    {[-1, 1].flatMap(side => Array.from({ length: 4 }, (_, row) => <mesh key={side + ":" + row}
      position={[side * (12 + row), .45 + row * .48, 0]}>
      <boxGeometry args={[1.04, .9 + row * .96, 36]} /><meshStandardMaterial color={row % 2 ? "#342749" : "#202d4d"} />
    </mesh>))}
  </>;
}
