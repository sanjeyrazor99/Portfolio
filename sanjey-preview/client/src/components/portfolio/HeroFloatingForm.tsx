import { RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type RefObject } from "react";
import { MathUtils, type Group } from "three";

const rotationSpeed = 0.19; // Radians per second.

function FloatingForm({ pointer }: { pointer: RefObject<{ x: number; y: number }> }) {
  const form = useRef<Group>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!form.current) return;
    const dt = Math.min(delta, 0.05);
    elapsed.current += dt;
    form.current.rotation.y += dt * rotationSpeed;
    form.current.rotation.x = MathUtils.damp(form.current.rotation.x, 0.25 + pointer.current.y * 0.2, 3, dt);
    form.current.rotation.z = MathUtils.damp(form.current.rotation.z, -0.23 - pointer.current.x * 0.2, 3, dt);
    form.current.position.y = Math.sin(elapsed.current * 1.1) * 0.11;
  });

  return (
    <group ref={form} rotation={[0.25, 0.55, -0.23]}>
      <RoundedBox args={[1.46, 1.46, 0.69]} radius={0.29} smoothness={3}>
        <meshStandardMaterial color="#ce4079" roughness={0.42} metalness={0.08} />
      </RoundedBox>
    </group>
  );
}

export default function HeroFloatingForm() {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const updateMotion = () => setEnabled(!motion.matches);
    const updateActivity = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateActivity();
    });
    observer.observe(element);
    updateMotion();
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateActivity);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateActivity);
    };
  }, []);

  useEffect(() => {
    if (!active || !enabled) return;
    function trackPointer(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      pointer.current.x = 2 * event.clientX / window.innerWidth - 1;
      pointer.current.y = 2 * event.clientY / window.innerHeight - 1;
    }
    window.addEventListener("pointermove", trackPointer, { passive: true });
    return () => window.removeEventListener("pointermove", trackPointer);
  }, [active, enabled]);

  return (
    <div ref={host} className="studio-hero-form" aria-hidden="true">
      {enabled && (
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 35 }}
          dpr={[1, 1.25]}
          frameloop={active ? "always" : "never"}
          gl={{ alpha: true, powerPreference: "low-power" }}
          fallback={<span />}
        >
          <ambientLight intensity={1.15} />
          <directionalLight position={[-3, 4, 5]} intensity={2.2} color="#ffd6aa" />
          <directionalLight position={[3, 1, -3]} intensity={1.7} color="#ac84ff" />
          <FloatingForm pointer={pointer} />
        </Canvas>
      )}
    </div>
  );
}
