import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, type Group, type Mesh, type MeshBasicMaterial, type Sprite } from "three";
import type { Game } from "./game";

export default function Defender({ game, index }: { game: Game; index: number }) {
  const body = useRef<Group>(null);
  const burst = useRef<Mesh>(null);
  const burstMaterial = useRef<MeshBasicMaterial>(null);
  const beatenAt = useRef<number | null>(null);
  const zone = useRef<Group>(null);
  const number = useRef<Sprite>(null);
  const jersey = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#16263a";
      ctx.fillRect(8, 17, 80, 62);
      ctx.strokeStyle = "#f0c982";
      ctx.lineWidth = 3;
      ctx.strokeRect(8, 17, 80, 62);
      ctx.fillStyle = "#fff3d4";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 39px system-ui";
      ctx.fillText(String(index + 1).padStart(2, "0"), 48, 48);
    }
    return new CanvasTexture(canvas);
  }, [index]);
  useEffect(() => () => jersey.dispose(), [jersey]);
  useFrame((_, delta) => {
    const defender = game.defenders[index];
    if (defender.beaten && beatenAt.current === null) beatenAt.current = game.elapsed;
    if (burst.current && burstMaterial.current && beatenAt.current !== null) {
      const spread = Math.min(1, (game.elapsed - beatenAt.current) * 3);
      burst.current.scale.setScalar(1 + spread * 1.7);
      burstMaterial.current.opacity = (1 - spread) * .75;
    }
    if (number.current) number.current.visible = !defender.beaten;
    if (zone.current) zone.current.position.x = defender.x;
    if (body.current) {
      const goal = defender.beaten ? 1.18 : 0;
      body.current.rotation.z += (goal - body.current.rotation.z) * Math.min(1, delta * 7);
    }
  });
  const defender = game.defenders[index];
  return <group ref={zone} position={[defender.x, 0, defender.z]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .025, 0]}>
      <ringGeometry args={[1.08, 1.15, 36]} />
      <meshBasicMaterial color={index === 4 ? "#ffe286" : "#ff798e"} transparent opacity={.72} />
    </mesh>
    <mesh ref={burst} rotation={[-Math.PI / 2, 0, 0]} position={[0, .03, 0]}>
      <ringGeometry args={[1.15, 1.25, 40]} />
      <meshBasicMaterial ref={burstMaterial} color="#ffc477" transparent opacity={0} depthWrite={false} />
    </mesh>
    <sprite ref={number} position={[0, 2.14, 0]} scale={[.72, .72, .72]}>
      <spriteMaterial map={jersey} transparent depthWrite={false} />
    </sprite>
    <group ref={body}>
      <mesh position={[0, 1.58, 0]}><sphereGeometry args={[.21, 12, 8]} /><meshStandardMaterial color="#c69571" /></mesh>
      <mesh position={[0, 1.04, 0]}><capsuleGeometry args={[.31, .41, 5, 10]} /><meshStandardMaterial color="#a72d4b" /></mesh>
      {[-.2, .2].map(x => <mesh key={x} position={[x, .38, 0]}>
        <capsuleGeometry args={[.12, .52, 4, 8]} /><meshStandardMaterial color="#1d234f" />
      </mesh>)}
    </group>
  </group>;
}
