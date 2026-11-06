import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import { MathUtils, Mesh, MeshPhysicalMaterial, type IUniform } from "three";
import type { HeroPalette } from "./HeroGradientBackground";

function colorChannels(palette: HeroPalette) {
  return palette.flatMap(hex => {
    const number = Number.parseInt(hex.replace("#", ""), 16);
    return [
      ((number >> 16) & 255) / 255,
      ((number >> 8) & 255) / 255,
      (number & 255) / 255,
    ];
  });
}

const channelNames = [
  "uC1r",
  "uC1g",
  "uC1b",
  "uC2r",
  "uC2g",
  "uC2b",
  "uC3r",
  "uC3g",
  "uC3b",
] as const;

function GradientLifecycle({
  palette,
  active,
  onFailure,
}: {
  palette: HeroPalette;
  active: boolean;
  onFailure: () => void;
}) {
  const { scene, gl, setFrameloop } = useThree();
  const target = useRef(colorChannels(palette));
  const current = useRef([...target.current]);
  const uniforms = useRef<Record<string, IUniform> | null>(null);

  useEffect(() => {
    target.current = colorChannels(palette);
  }, [palette]);

  useLayoutEffect(() => {
    const mesh = scene.getObjectByName("shadergradient-mesh");
    if (
      !(mesh instanceof Mesh) ||
      !(mesh.material instanceof MeshPhysicalMaterial)
    )
      return;
    const material = mesh.material;
    const compile = material.onBeforeCompile;
    // The package recreates its material for color prop changes. Interpolate its
    // existing compiled color uniforms instead, without allocating materials per frame.
    material.onBeforeCompile = (shader, renderer) => {
      compile.call(material, shader, renderer);
      // ShaderGradient 2.4.20 embeds legacy environment/transmission includes.
      // This hero uses local ambient lighting and no reflection/transmission.
      shader.fragmentShader = shader.fragmentShader.replace(
        /#include <(?:cube_uv_reflection_fragment|transmissionmap_pars_fragment|transmissionmap_fragment)>/g,
        ""
      );

      uniforms.current = shader.uniforms;
      channelNames.forEach((name, index) => {
        if (shader.uniforms[name])
          shader.uniforms[name].value = current.current[index];
      });
    };
    material.needsUpdate = true;
    return () => {
      material.onBeforeCompile = compile;
      uniforms.current = null;
    };
  }, [scene, active]);

  useEffect(() => {
    setFrameloop(active ? "always" : "never");
  }, [active, setFrameloop]);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);

  useFrame((_, delta) => {
    const amount = 1 - Math.exp(-Math.min(delta, 0.1) * 4);
    channelNames.forEach((name, index) => {
      current.current[index] = MathUtils.lerp(
        current.current[index],
        target.current[index],
        amount
      );
      const uniform = uniforms.current?.[name];
      if (uniform) uniform.value = current.current[index];
    });
  });
  return null;
}

export default function HeroGradientScene({
  palette,
  active,
  onFailure,
}: {
  palette: HeroPalette;
  active: boolean;
  onFailure: () => void;
}) {
  const initialPalette = useRef(palette).current;
  const surface = useMemo(
    () => (
      <ShaderGradient
        control="props"
        type="plane"
        shader="defaults"
        animate={active ? "on" : "off"}
        uSpeed={0.18}
        uStrength={1.3}
        uDensity={1.5}
        uFrequency={3}
        uAmplitude={0.3}
        color1={initialPalette[0]}
        color2={initialPalette[1]}
        color3={initialPalette[2]}
        lightType="3d"
        brightness={0.8}
        reflection={0}
        grain="off"
        cDistance={3.8}
        cPolarAngle={90}
        cAzimuthAngle={0}
        rotationX={0}
        rotationY={0}
        rotationZ={-20}
        enableTransition={false}
        toggleAxis={false}
      />
    ),
    [active, initialPalette]
  );
  return (
    <ShaderGradientCanvas
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      className="hero-gradient-canvas"
      pixelDensity={matchMedia("(max-width: 760px)").matches ? 1 : 1.25}
      fov={45}
      pointerEvents="none"
      lazyLoad={false}
      preserveDrawingBuffer={false}
      powerPreference="low-power"
    >
      {surface}
      <GradientLifecycle
        palette={palette}
        active={active}
        onFailure={onFailure}
      />
    </ShaderGradientCanvas>
  );
}
