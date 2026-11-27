import { Component, type ReactNode } from "react";
import { DoubleSide, Vector3 } from "three";

const panels = Array.from({ length: 12 }, (_, index) => {
  const y = 1 - 2 * (index + .5) / 12;
  const angle = index * Math.PI * (3 - Math.sqrt(5));
  const radius = Math.sqrt(1 - y * y);
  return new Vector3(radius * Math.cos(angle), y, radius * Math.sin(angle));
});
const forward = new Vector3(0, 0, 1);

const scoutingPanels = [0, 7, 3, 10, 5];

export function PitchBall({ scouting = false }: { scouting?: boolean }) {
  return (
    <>
      <mesh>
        <sphereGeometry args={[.4, 32, 24]} />
        <meshStandardMaterial color="#f8ecd9" roughness={.46} />
      </mesh>
      {panels.map((direction, index) => (
        <mesh key={index} position={direction.clone().multiplyScalar(.397)}
          onUpdate={mesh => mesh.quaternion.setFromUnitVectors(forward, direction)}>
          <circleGeometry args={[.115, 5]} />
          <meshStandardMaterial color={scouting && scoutingPanels.includes(index) ? "#df9e45" : index % 2 ? "#17274e" : "#842343"}
            side={DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

export class PitchCanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

let webGLSupported: boolean | undefined;

export function supportsPitchCanvas() {
  if (webGLSupported === undefined) {
    try {
      const context = document.createElement("canvas").getContext("webgl2");
      webGLSupported = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webGLSupported = false;
    }
  }
  return webGLSupported;
}
