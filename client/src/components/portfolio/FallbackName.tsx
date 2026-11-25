import { gsap } from "gsap";
import type { PointerEvent } from "react";

export default function FallbackName() {
  function drag(event: PointerEvent<HTMLButtonElement>) {
    const element = event.currentTarget;
    const x = event.clientX;
    const y = event.clientY;
    element.setPointerCapture(event.pointerId);
    function move(e: globalThis.PointerEvent) {
      gsap.set(element, {
        x: e.clientX - x,
        y: e.clientY - y,
        rotation: (e.clientX - x) * 0.12,
      });
    }
    function release() {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", release);
      element.removeEventListener("pointercancel", release);
      gsap.to(element, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.75,
        ease: "elastic.out(1,.5)",
      });
    }
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", release);
    element.addEventListener("pointercancel", release);
  }
  return (
    <div className="fallback-name" aria-label="Interactive name illustration">
      {["SANJEY", "MANIAN"].map((row, index) => (
        <div className={"name-row name-row-" + index} key={row}>
          {row.split("").map((letter, i) => (
            <button
              data-name-letter
              key={i}
              className="name-letter"
              onPointerDown={drag}
              aria-label={"Move letter " + letter}
            >
              {Array.from({ length: 10 }, (_, layer) => (
                <span
                  aria-hidden="true"
                  key={layer}
                  style={{
                    transform: `translate3d(${layer * 0.5}px,${layer * 0.8}px,${-layer * 2}px)`,
                  }}
                >
                  {letter}
                </span>
              ))}
              <span aria-hidden="true" className="name-face">
                {letter}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
