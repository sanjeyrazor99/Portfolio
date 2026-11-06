import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const GradientScene = lazy(() => import("./HeroGradientScene"));
export type HeroPalette = readonly [string, string, string];

class GradientBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function HeroGradientBackground({
  mode,
  frozen,
}: {
  mode: "saitama" | "garou";
  frozen: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [palette, setPalette] = useState<HeroPalette>();
  const [available, setAvailable] = useState(false);
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);

  useEffect(() => {
    if (!host.current) return;
    const style = getComputedStyle(host.current);
    setPalette([
      style.getPropertyValue("--hero-gradient-color-1").trim(),
      style.getPropertyValue("--hero-gradient-color-2").trim(),
      style.getPropertyValue("--hero-gradient-color-3").trim(),
    ]);
  }, [mode]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    // Limit only this decorative layer on constrained devices, never the hero's modes.
    const device = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    if (
      device.connection?.saveData ||
      (device.deviceMemory !== undefined && device.deviceMemory <= 2) ||
      (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 2)
    )
      return;

    const probe = document.createElement("canvas");
    const context = probe.getContext("webgl2");
    if (!context) return;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    setAvailable(true);

    let visible = false;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.01 }
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div
      ref={host}
      className="hero-gradient-background"
      data-gradient-mode={mode}
      data-gradient-renderer={
        available && !frozen && !failed ? "shader" : "css"
      }
      aria-hidden="true"
    >
      <div className="hero-gradient-paper" />
      <div className="hero-gradient-garou" />
      {available && !frozen && !failed && palette && (
        <GradientBoundary onFailure={fail}>
          <Suspense fallback={null}>
            <GradientScene palette={palette} active={active} onFailure={fail} />
          </Suspense>
        </GradientBoundary>
      )}
      <div className="hero-gradient-grain" />
    </div>
  );
}
