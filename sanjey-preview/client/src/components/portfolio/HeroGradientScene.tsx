import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import { Mesh, MeshPhysicalMaterial } from "three";

const palette = {
  mist: "#F23868",
  blue: "#4421A6",
  navy: "#200A32",
};
const speed = 0.15;

function GradientLifecycle({ active, onFailure }: { active: boolean; onFailure: () => void }) {
  const { scene, gl, setFrameloop } = useThree();

  const patchedMaterials = useRef(new WeakSet<MeshPhysicalMaterial>());

  useFrame(() => {
    const mesh = scene.getObjectByName("shadergradient-mesh");
    if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshPhysicalMaterial)) return;

    const material = mesh.material;
    if (patchedMaterials.current.has(material)) return;
    patchedMaterials.current.add(material);
    const compile = material.onBeforeCompile;
    // ShaderGradient 2.4.20 injects legacy reflection and transmission chunks.
    // The studio gradient uses neither effect.
    material.onBeforeCompile = (shader, renderer) => {
      compile.call(material, shader, renderer);
      shader.fragmentShader = shader.fragmentShader.replace(
        /#include <(?:cube_uv_reflection_fragment|transmissionmap_pars_fragment|transmissionmap_fragment)>/g,
        ""
      );
    };
    material.needsUpdate = true;
  }, -1);

  useEffect(() => {
    setFrameloop(active ? "always" : "never");
  }, [active, setFrameloop]);

  useLayoutEffect(() => {
    const canvas = gl.domElement;
    const previous = gl.debug.onShaderError;
    gl.debug.onShaderError = () => onFailure();
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => {
      gl.debug.onShaderError = previous;
      canvas.removeEventListener("webglcontextlost", onFailure);
    };
  }, [gl, onFailure]);

  return null;
}

export default function HeroGradientScene({ active, theme }: { active: boolean; theme: "light" | "dark" }) {
  const colors = theme === "light" ? { navy: "#87091a", blue: "#ce1027", mist: "#ff3b38" } : palette;
  const [failed, setFailed] = useState(false);
  const [mobile, setMobile] = useState(() => matchMedia("(max-width: 700px)").matches);

  useEffect(() => {
    const viewport = matchMedia("(max-width: 700px)");
    const update = () => setMobile(viewport.matches);
    viewport.addEventListener("change", update);
    return () => viewport.removeEventListener("change", update);
  }, []);

  if (failed) return null;

  return (
    <ShaderGradientCanvas
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      pixelDensity={mobile ? 1 : 1.25}
      fov={45}
      pointerEvents="none"
      lazyLoad={false}
      preserveDrawingBuffer={false}
      powerPreference="low-power"
    >
      <ShaderGradient
        control="props"
        type="plane"
        shader="defaults"
        animate="on"
        uSpeed={speed}
        uStrength={1.3}
        uDensity={1.5}
        uFrequency={3}
        uAmplitude={0.2}
        color1={colors.navy}
        color2={colors.blue}
        color3={colors.mist}
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
      <GradientLifecycle active={active} onFailure={() => setFailed(true)} />
    </ShaderGradientCanvas>
  );
}
