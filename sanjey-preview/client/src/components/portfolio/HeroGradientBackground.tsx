import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";

const GradientScene = lazy(() => import("./HeroGradientScene"));

class GradientBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function HeroGradientBackground({ paused = false, theme }: { paused?: boolean; theme: "light" | "dark" }) {
  const host = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let supported: boolean | undefined;
    function updatePreference() {
      if (!motion.matches && supported === undefined) {
        try {
          const context = document.createElement("canvas").getContext("webgl2");
          supported = Boolean(context);
          context?.getExtension("WEBGL_lose_context")?.loseContext();
        } catch {
          supported = false;
        }
      }
      setEnabled(!motion.matches && supported === true);
    }

    let visible = true;
    const updateActivity = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateActivity();
    });
    observer.observe(element);
    updatePreference();
    updateActivity();
    motion.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateActivity);

    return () => {
      observer.disconnect();
      motion.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateActivity);
    };
  }, []);

  return (
    <div className="studio-hero-gradient" ref={host} aria-hidden="true">
      {enabled && (
        <GradientBoundary>
          <Suspense fallback={null}>
            <GradientScene active={active && !paused} theme={theme} />
          </Suspense>
        </GradientBoundary>
      )}
    </div>
  );
}
