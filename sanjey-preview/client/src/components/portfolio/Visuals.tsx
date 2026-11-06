import { useEffect, useId, useRef, useState } from "react";

export function RegistryMark() {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <path fill="currentColor" d="M4 5h9v12h12V5h9v34h-9V25H13v14H4z" />
      <path fill="var(--bg)" d="M17 4h5l15 35h-6z" />
      <path fill="currentColor" d="M35 5h5v34h-5z" />
    </svg>
  );
}

/** Original primitive-shape illustration, also the no-WebGL/reduced-motion fallback. */
export function StaticHero({ hunter = false }: { hunter?: boolean }) {
  const earthId = useId().replace(/:/g, "");
  return (
    <svg
      className="static-hero"
      viewBox="0 0 600 700"
      role="img"
      aria-label={
        hunter
          ? "Original geometric silver-haired martial artist with purple energy"
          : "Original geometric bald hero in a yellow suit, red gloves and white cape"
      }
    >
      <defs>
        <radialGradient id={hunter ? "halo-p" : "halo-y"}>
          <stop stopColor={hunter ? "#7B2CBF" : "#FFD400"} stopOpacity=".2" />
          <stop
            offset="1"
            stopColor={hunter ? "#7B2CBF" : "#FFD400"}
            stopOpacity="0"
          />
        </radialGradient>
        <linearGradient id="cape" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#858590" />
        </linearGradient>
        <radialGradient id={`${earthId}-water`} cx="35%" cy="30%">
          <stop stopColor="#77d5f5" />
          <stop offset=".48" stopColor="#247baa" />
          <stop offset="1" stopColor="#071931" />
        </radialGradient>
        <clipPath id={`${earthId}-clip`}>
          <circle cx="425" cy="117" r="61" />
        </clipPath>
      </defs>
      {!hunter && (
        <g aria-hidden="true" className="fallback-earth">
          <circle cx="425" cy="117" r="68" fill="#71d5ff" opacity=".1" />
          <circle
            cx="425"
            cy="117"
            r="61"
            fill={`url(#${earthId}-water)`}
            stroke="#a3e5ff"
            strokeWidth="2"
          />
          <g clipPath={`url(#${earthId}-clip)`} fill="#90ae74">
            <path d="M378 87l21-17 22 4 9 16-12 8-4 18-16 8-3 18-13 5-10-24 8-15-11-10zM437 79l21 3 13 11-13 12-18-6-10-11zM431 120l20-10 14 10-7 21-12 25-11-6-7-20zM470 167l18-8 8 11-15 9z" />
          </g>
          <circle
            cx="425"
            cy="117"
            r="68"
            fill="none"
            stroke="#b5eaff"
            strokeOpacity=".3"
            strokeDasharray="2 6"
          />
        </g>
      )}
      <circle
        cx="300"
        cy="290"
        r="265"
        fill={`url(#${hunter ? "halo-p" : "halo-y"})`}
      />
      <g fill="none" stroke={hunter ? "#9e65eb" : "#FFD400"} opacity=".2">
        <circle cx="300" cy="275" r="188" />
        <circle cx="300" cy="275" r="203" strokeDasharray="3 12" />
        <path d="M300 38v40M300 470v40M65 275h45M490 275h45" />
      </g>
      <g fill="#171720">
        <path d="M0 440h55v170H0zM72 365h48v245H72zM140 480h55v130h-55zM440 410h63v200h-63zM521 330h65v280h-65z" />
        <path d="M82 350h28v15H82zM542 306h22v24h-22z" />
      </g>
      <ellipse cx="310" cy="625" rx="115" ry="20" fill="#000" />
      {!hunter && (
        <path
          d="M248 231Q367 196 417 267L555 522 451 492 487 552 337 504 266 454z"
          fill="url(#cape)"
        />
      )}
      <g stroke="#0b0b0f" strokeWidth="4" strokeLinejoin="round">
        <path
          d="M249 231l79 3 33 177-143 2z"
          fill={hunter ? "#272734" : "#FFD400"}
        />
        <path
          d="M248 260l-31 121-28 64-30-15 18-72 35-119z"
          fill={hunter ? "#292931" : "#e9b900"}
        />
        <path
          d="M328 243l41 19 26 111-27 65-30-14 19-58-29-88"
          fill={hunter ? "#32323e" : "#f8c700"}
        />
        <path
          d="M229 410l60 1-13 161-44 1zM293 410h58l-12 164-44-1z"
          fill={hunter ? "#16161e" : "#eabe00"}
        />
        <path
          d="M230 552h46l-2 72-57 4 1-19zM295 553h45l13 64-3 13-63-1z"
          fill={hunter ? "#343441" : "#D7263D"}
        />
        <path
          d="M168 419l34 10-8 45-27 4-17-24zM341 415l31 8 7 39-22 19-25-12z"
          fill={hunter ? "#aaa5b8" : "#D7263D"}
        />
        <path d="M224 398h132v24H224z" fill="#131319" />
        <path d="M277 399h25v25h-25z" fill="#d7d7df" />
        <path d="M271 217h32v30h-32z" fill="#e6b492" />
        <ellipse cx="287" cy="167" rx="50" ry="61" fill="#ebbd9c" />
        {hunter && (
          <path
            d="M239 148l-23-61 35 16 8-55 30 41 35-42 1 49 46-10-27 67-24-25-31 10-26-13z"
            fill="#C0C6D4"
          />
        )}
        <path d="M265 169h11M301 169h11" strokeWidth="3" />
        <path d="M281 193h18" strokeWidth="2" />
      </g>
      {!hunter && (
        <g fill="#d9d9e1">
          <circle cx="246" cy="239" r="12" />
          <circle cx="329" cy="241" r="12" />
        </g>
      )}
      <g fill={hunter ? "#a869ee" : "#FFD400"}>
        <rect
          x="108"
          y="150"
          width="4"
          height="4"
          transform="rotate(22 110 152)"
        />
        <rect x="450" y="368" width="5" height="5" />
        <rect x="412" y="94" width="3" height="3" />
      </g>
    </svg>
  );
}

export function Counter({
  value,
  prefix = "",
  suffix,
  label,
  lite = false,
  frozen = false,
}: {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  lite?: boolean;
  frozen?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [count, setCount] = useState(value);
  const [busted, setBusted] = useState(false);
  const burstTimer = useRef<number | null>(null);
  const triggerBurst = () => {
    setBusted(true);
    if (burstTimer.current !== null) window.clearTimeout(burstTimer.current);
    burstTimer.current = window.setTimeout(() => setBusted(false), 650);
  };
  useEffect(
    () => () => {
      if (burstTimer.current !== null) window.clearTimeout(burstTimer.current);
    },
    []
  );
  useEffect(() => {
    setCount(value);
    if (
      lite ||
      frozen ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      !ref.current
    )
      return;
    let frame = 0;
    let did = false;
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting || did) return;
        did = true;
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min((t - start) / 1000, 1);
          setCount(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) frame = requestAnimationFrame(tick);
          else triggerBurst();
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, lite, frozen]);
  return (
    <button
      type="button"
      className={`stat${busted ? " stat-burst" : ""}`}
      ref={ref}
      onClick={() => {
        setCount(value);
        if (
          !lite &&
          !frozen &&
          !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        )
          triggerBurst();
      }}
      aria-label={`${prefix}${value.toLocaleString("en-US")}${suffix} — ${label}. Click to replay the impact counter.`}
      title="Click to replay the impact counter"
    >
      <strong>
        {prefix}
        {count.toLocaleString("en-US")}
        <span>{suffix}</span>
      </strong>
      <span className="stat-label">{label}</span>
    </button>
  );
}
