import { useEffect, useRef } from "react";
export default function DetailedEarthFallback() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      import("@/lib/earthTextures").then(
        ({ createEarthTextures, paintEarthPoster }) => {
          if (cancelled || !ref.current) return;
          paintEarthPoster(ref.current, createEarthTextures(1536));
        }
      );
    }, 50);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      width={1024}
      height={1024}
      className="detailed-earth-poster"
      aria-hidden="true"
    />
  );
}

