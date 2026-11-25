import { useEffect, useState } from "react";

/** Progressive enhancement: the CSS glass styles work before JS and on low power. */
export function useLiquidGlass(frozen: boolean) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".portfolio");
    const device = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    if (
      !root ||
      frozen ||
      failed ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      matchMedia("(prefers-reduced-transparency: reduce)").matches ||
      matchMedia("(forced-colors: active)").matches ||
      device.connection?.saveData ||
      (device.deviceMemory ?? 8) <= 4 ||
      (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4)
    )
      return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    import("@/lib/liquidGlass")
      .then(({ createGlassContainers }) => {
        if (cancelled) return;
        try {
          cleanup = createGlassContainers(root, () => setFailed(true));
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [frozen, failed]);
}
