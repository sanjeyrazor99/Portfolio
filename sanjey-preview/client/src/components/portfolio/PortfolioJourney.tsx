import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { AdditiveBlending, MathUtils, Path, Shape, Vector3, type Group } from "three";

const stops = ["home", "about", "projects", "process", "experience", "skills", "contact"];
const spacing = 18;
const palettes = {
  light: { frame: "#19bfe9", edge: "#c0faff", glow: "#1669ff", portrait: "#ffc0a2", fog: "#40101d", colors: ["#de2250", "#ff542e", "#b51b41", "#ff973c", "#d72458", "#a73050", "#e53332"] },
  dark: { frame: "#ff661f", edge: "#ffcf62", glow: "#e84a2b", portrait: "#caa9ff", fog: "#170b35", colors: ["#a448ff", "#5635ed", "#d532f2", "#5233c3", "#474eff", "#8c3ae5", "#885dff"] },
} as const;

type ComicTheme = keyof typeof palettes;

function hexPoints(radius: number) {
  return Array.from({ length: 6 }, (_, side) => {
    const angle = side * Math.PI / 3;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
  });
}

const portalFrames = [0, 1, 2].map(layer => {
  const radius = 5.9 + layer * .55;
  const width = layer === 0 ? .42 : .2;
  const shape = new Shape();
  const opening = new Path();
  for (const [index, [x, y]] of hexPoints(radius).entries()) {
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (const [index, [x, y]] of hexPoints(radius - width).reverse().entries()) {
    if (index === 0) opening.moveTo(x, y);
    else opening.lineTo(x, y);
  }
  shape.closePath();
  opening.closePath();
  shape.holes.push(opening);
  return {
    radius, width, shape,
    extrusion: { depth: layer === 0 ? .44 : .23, bevelSize: .038, bevelThickness: .045, bevelSegments: 1, steps: 1 },
  };
});

function PortalRing({ frame, index, layer, palette }: {
  frame: (typeof portalFrames)[number];
  index: number;
  layer: number;
  palette: (typeof palettes)[ComicTheme];
}) {
  const echo = useRef<Group>(null);
  const { radius, width, shape, extrusion } = frame;
  const face = extrusion.depth + .06;

  useFrame(({ clock }) => {
    if (!echo.current || document.hidden) return;
    const phase = (clock.elapsedTime + index * .77) % 6.2;
    // Move only the color echo in short bursts. The solid portal stays readable.
    echo.current.position.x = phase < .12 ? .16 : phase < .24 ? -.12 : 0;
    echo.current.position.y = phase < .24 ? .075 : 0;
  });

  return (
    <group position={[0, 0, -layer * 4.6]} rotation={[0, 0, Math.PI / 6 + Math.sin(index + layer) * .12]} scale={[1.24, 1, 1]}>
      <mesh>
        <extrudeGeometry args={[shape, extrusion]} />
        <meshBasicMaterial attach="material-0" color={palette.frame} toneMapped={false} />
        <meshBasicMaterial attach="material-1" color={palette.glow} />
      </mesh>
      <mesh position={[0, 0, face]}>
        <ringGeometry args={[radius - width + .025, radius - width + .07, 6]} />
        <meshBasicMaterial color={palette.edge} toneMapped={false} />
      </mesh>
      <group ref={echo} position={[0, 0, face + .015]}>
        {[.16, .33].map((spread, band) => (
          <mesh key={spread}>
            <ringGeometry args={[radius - width - spread, radius + spread, 6]} />
            <meshBasicMaterial color={palette.glow} transparent opacity={band === 0 ? .22 : .1} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
        {layer === 0 && hexPoints(radius - width / 2).map(([x, y], side) => (
          <mesh key={side} position={[x, y, 0]}>
            <planeGeometry args={[.28, .09]} />
            <meshBasicMaterial color={palette.edge} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

class JourneyBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function JourneyScene({ theme }: { theme: ComicTheme }) {
  const palette = palettes[theme];
  const [portrait, setPortrait] = useState<Float32Array | null>(null);
  const [anchors, setAnchors] = useState<number[]>([]);
  const position = useState(() => new Vector3())[0];

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 108;
      canvas.height = 135;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(image, 0, 0, 108, 135);
      const pixels = context.getImageData(0, 0, 108, 135).data;
      const points: number[] = [];
      for (let y = 0; y < 135; y++) {
        for (let x = 0; x < 108; x++) {
          const i = (y * 108 + x) * 4;
          if (pixels[i + 3] < 140 || pixels[i] < 32) continue;
          points.push((x - 54) * .068, (67 - y) * .068, pixels[i] / 255 * 1.4);
        }
      }
      setPortrait(new Float32Array(points));
    };
    image.src = import.meta.env.BASE_URL + "sanjey-portrait-cutout.png";
    return () => { image.onload = null; };
  }, []);

  useEffect(() => {
    const measure = () => setAnchors(stops.map(id =>
      (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + window.scrollY
    ));
    measure();
    const observer = new ResizeObserver(measure);
    const main = document.getElementById("main");
    if (main) observer.observe(main);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useFrame(({ camera, pointer }, delta) => {
    if (document.hidden || anchors.length !== stops.length) return;
    const scroll = window.scrollY;
    const next = anchors.findIndex(top => top > scroll);
    const index = next < 0 ? stops.length - 1 : Math.max(0, next - 1);
    const fraction = MathUtils.clamp((scroll - anchors[index]) / Math.max(1, (anchors[index + 1] ?? Infinity) - anchors[index]), 0, 1);
    const progress = index + fraction;
    const bend = Math.sin(progress * 1.45);
    position.set(bend * 2.4 + pointer.x * .2, Math.sin(progress * 2) * .9, 10 - progress * spacing);
    camera.position.lerp(position, 1 - Math.exp(-8 * delta));
    camera.rotation.z = Math.sin(progress * Math.PI) * .09;
    camera.rotation.y = bend * -.12;
  });

  return (
    <>
      <fog attach="fog" args={[palette.fog, 15, 63]} />
      {portrait && (
        <points position={[0, .25, 0]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[portrait, 3]} />
          </bufferGeometry>
          <pointsMaterial color={palette.portrait} size={.035} transparent opacity={.68} />
        </points>
      )}
      {palette.colors.map((color, index) => (
        <group key={color} position={[0, 0, -index * spacing - 4]}>
          {portalFrames.map((frame, frameIndex) => (
            <PortalRing key={frameIndex} frame={frame} index={index} layer={frameIndex} palette={palette} />
          ))}
          <gridHelper args={[32, 22, color, color]} position={[0, -4.2, -7]} />
          {Array.from({ length: 10 }, (_, column) => {
            const side = column % 2 ? 1 : -1;
            const height = 1.8 + ((column * 7 + index * 3) % 9) * .59;
            return (
              <mesh key={column} position={[side * (5.4 + column % 3), height / 2 - 4.2, -column * 1.6]}>
                <boxGeometry args={[.8, height, 1.1]} />
                <meshBasicMaterial color={color} wireframe transparent opacity={.28} />
              </mesh>
            );
          })}
        </group>
      ))}
    </>
  );
}

export default function PortfolioJourney({ theme }: { theme: ComicTheme }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 700px)");
    const previewMotion = import.meta.env.DEV && new URLSearchParams(location.search).get("motion") === "on";
    const update = () => setEnabled(!compact.matches && (previewMotion || !preference.matches));
    update();
    preference.addEventListener("change", update);
    compact.addEventListener("change", update);
    return () => {
      preference.removeEventListener("change", update);
      compact.removeEventListener("change", update);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div className="studio-journey" aria-hidden="true">
      <JourneyBoundary>
        <Canvas dpr={[1, 1.35]} camera={{ position: [0, 0, 10], fov: 56, far: 85 }} gl={{ antialias: false, alpha: true }}>
          <JourneyScene theme={theme} />
        </Canvas>
      </JourneyBoundary>
    </div>
  );
}
