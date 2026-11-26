import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type { Group } from "three";
import { PitchBall } from "../PitchBall";
import { clamp, goalZ, shootZ, type Game, type Phase } from "./game";

export type MatchInput = {
  keys: Set<string>;
  aim: [number, number] | null;
  joystick: [number, number];
  action: boolean;
};

export default function Player({ game, input, onPhase }: {
  game: Game;
  input: RefObject<MatchInput>;
  onPhase: (phase: Phase, unlocked: number) => void;
}) {
  const avatar = useRef<Group>(null);
  const ball = useRef<Group>(null);
  const feet = useRef<Array<Group | null>>([]);
  const trail = useRef<Group>(null);
  const stride = useRef(0);
  const shotOrigin = useRef<[number, number]>([0, shootZ]);
  useFrame((_, delta) => {
    const dt = Math.min(delta, .035);
    const controls = input.current;
    game.elapsed += dt * (game.phase === "project" ? .22 : 1);
    const action = controls.action;
    controls.action = false;
    if (game.phase === "play") {
      if (action && game.unlocked === game.defenders.length && game.z <= shootZ + 1) {
        shotOrigin.current = [game.x + game.dx * .52, game.z + game.dz * .52];
        game.phase = "shot";
        onPhase("shot", game.unlocked);
      } else {
        const has = (a: string, b: string) => Number(controls.keys.has(a) || controls.keys.has(b));
        let x = has("d", "arrowright") - has("a", "arrowleft") + controls.joystick[0];
        let z = has("s", "arrowdown") - has("w", "arrowup") + controls.joystick[1];
        if (x || z) controls.aim = null;
        else if (controls.aim) {
          x = controls.aim[0] - game.x;
          z = controls.aim[1] - game.z;
          if (Math.hypot(x, z) < .2) {
            controls.aim = null;
            x = z = 0;
          }
        }
        game.cooldown = Math.max(0, game.cooldown - dt);
        game.burst = Math.max(0, game.burst - dt);
        if (action && !game.cooldown) {
          game.burst = .34;
          game.cooldown = .85;
          if (!x && !z) { x = game.dx; z = game.dz; }
        }
        const length = Math.hypot(x, z);
        if (length > .01) {
          game.dx = x / length;
          game.dz = z / length;
        }
        const moving = length > .01 || game.burst > 0;
        const movement = moving ? dt * (game.burst ? 13 : 5.8) : 0;
        stride.current += movement * 5;
        const nextX = clamp(game.x + game.dx * movement, -7.45, 7.45);
        const nextZ = clamp(game.z + game.dz * movement, shootZ, 15);
        const defender = game.defenders[game.unlocked];
        if (defender) {
          const home = Math.sin(game.elapsed * 1.2 + defender.index) * 1.1;
          const target = Math.abs(game.z - defender.z) < 3.3 ? clamp(game.x, -4.6, 4.6) : home;
          defender.x += (target - defender.x) * dt * 1.8;
          const gap = Math.hypot(nextX - defender.x, nextZ - defender.z);
          if ((game.burst && gap < 1.65) || (game.z >= defender.z && nextZ < defender.z && gap >= .67)) {
            defender.beaten = true;
            game.unlocked += 1;
            game.x = nextX;
            game.z = defender.z - .82;
            game.phase = "project";
            controls.aim = null;
            onPhase("project", game.unlocked);
          } else if (gap >= .67) {
            game.x = nextX;
            game.z = nextZ;
          }
        } else {
          game.x = nextX;
          game.z = nextZ;
        }
        if (ball.current) {
          ball.current.rotation.x -= game.dz * movement / .32;
          ball.current.rotation.z -= game.dx * movement / .32;
        }
      }
    }
    feet.current.forEach((leg, index) => {
      if (leg) leg.rotation.x = Math.sin(stride.current + index * Math.PI) * (game.phase === "play" ? .38 : .08);
    });
    if (trail.current) {
      trail.current.visible = game.phase === "play" && game.burst > 0;
      trail.current.scale.setScalar(Math.min(1, game.burst * 6));
    }
    if (avatar.current) {
      avatar.current.position.set(game.x, 0, game.z);
      avatar.current.rotation.y = Math.atan2(game.dx, game.dz);
      avatar.current.rotation.z = game.burst ? -.16 : 0;
    }
    if (game.phase === "shot" || game.phase === "goal") {
      game.shot += dt;
      const t = Math.min(1, game.shot / .8);
      ball.current?.position.set(
        shotOrigin.current[0] + (1.72 - shotOrigin.current[0]) * t,
        .3 + t * 1.78 + Math.sin(t * Math.PI) * .72,
        shotOrigin.current[1] + (goalZ - .62 - shotOrigin.current[1]) * t,
      );
      if (t === 1 && game.phase === "shot") {
        game.phase = "goal";
        onPhase("goal", game.unlocked);
      }
    } else {
      ball.current?.position.set(game.x + game.dx * .52, .31, game.z + game.dz * .52);
    }
  });

  return <>
    <group ref={avatar}>
      <mesh position={[0, 1.62, 0]}><sphereGeometry args={[.22, 16, 12]} /><meshStandardMaterial color="#b98562" /></mesh>
      <mesh position={[0, 1.04, 0]}><capsuleGeometry args={[.34, .48, 5, 10]} /><meshStandardMaterial color="#2c6eef" /></mesh>
      {[-.21, .21].map((x, index) => <group key={x} position={[x, .8, 0]}
        ref={leg => { feet.current[index] = leg; }}>
        <mesh position={[0, -.39, 0]}>
          <capsuleGeometry args={[.12, .56, 4, 10]} /><meshStandardMaterial color="#f7d27c" />
        </mesh>
      </group>)}
      <group ref={trail} visible={false}>
        {Array.from({ length: 8 }, (_, index) => (
          <mesh key={index} position={[(index % 2 ? 1 : -1) * (.2 + index * .07), .08 + index * .04, -.4 - index * .22]}>
            <sphereGeometry args={[.075 + index * .004, 6, 4]} />
            <meshBasicMaterial color="#79dcff" transparent opacity={(8 - index) / 10} />
          </mesh>
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .036, 0]}>
        <ringGeometry args={[.63, .69, 40]} /><meshBasicMaterial color="#8bdcff" transparent opacity={.85} />
      </mesh>
    </group>
    <group ref={ball} scale={.78}><PitchBall /></group>
  </>;
}
