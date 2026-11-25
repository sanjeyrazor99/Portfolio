import { useId } from "react";

/** Always-painted orbital artwork; WebGL only adds depth and lighting above this SVG. */
export default function EarthFallback() {
  const id = useId().replace(/:/g, "");
  const stars = Array.from({ length: 86 }, (_, index) => ({
    x: (index * 137.508 + 21) % 620,
    y: (index * 73.167 + 19) % 520,
    radius: index % 9 === 0 ? 1.7 : index % 3 === 0 ? 1.1 : 0.7,
  }));
  return (
    <svg className="earth-fallback" viewBox="0 0 620 780" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-planet`} cx="34%" cy="30%">
          <stop stopColor="#bdefff" />
          <stop offset=".34" stopColor="#2a9cd4" />
          <stop offset=".78" stopColor="#15598a" />
          <stop offset="1" stopColor="#071c32" />
        </radialGradient>
        <radialGradient id={`${id}-air`}>
          <stop offset=".75" stopColor="#61d5ff" stopOpacity="0" />
          <stop offset=".93" stopColor="#55d9ff" stopOpacity=".22" />
          <stop offset="1" stopColor="#c1f4ff" stopOpacity=".08" />
        </radialGradient>
        <clipPath id={`${id}-clip`}><circle cx="354" cy="203" r="104" /></clipPath>
        <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="11" /></filter>
      </defs>
      <g className="earth-stars">
        {stars.map((star, index) => <circle key={index} className="earth-star" cx={star.x} cy={star.y} r={star.radius} style={{ animationDelay: `${(index % 12) * -0.31}s` }} />)}
      </g>
      <g className="earth-warp-lines" fill="none" stroke="#dff8ff" strokeWidth="1.4" strokeLinecap="round">
        {Array.from({ length: 18 }, (_, index) => {
          const angle = (index / 18) * Math.PI * 2;
          const x = 354 + Math.cos(angle) * 117;
          const y = 203 + Math.sin(angle) * 117;
          const x2 = 354 + Math.cos(angle) * (205 + (index % 3) * 22);
          const y2 = 203 + Math.sin(angle) * (205 + (index % 3) * 22);
          return <path key={index} d={`M ${x} ${y} L ${x2} ${y2}`} />;
        })}
      </g>
      <circle className="earth-aura-blur" cx="354" cy="203" r="131" fill="#57d6ff" filter={`url(#${id}-glow)`} />
      <circle className="earth-orb" cx="354" cy="203" r="123" fill={`url(#${id}-air)`} />
      <g className="earth-orb">
        <circle cx="354" cy="203" r="104" fill={`url(#${id}-planet)`} stroke="#d0f5ff" strokeWidth="2.3" />
        <g clipPath={`url(#${id}-clip)`} className="earth-map-layer">
          <path d="M286 142l20-21 27 9 7 14-15 8-2 20-13 9-4 17-18 8-10-14 4-19-12-16zM344 132l23-13 29 8 20 20-12 13-19-5-12 11-21-9-8-13zM362 192l16-12 24 9 16 21-7 25-15 18-4 24-14 14-10-22 5-25-15-20zM298 214l24-9 10 22-14 16-8 33-21 15-10-26 12-19zM416 168l20-7 15 18-20 16-12-12z" fill="#8caf78" stroke="#d5e5aa" strokeWidth="2" strokeLinejoin="round" />
          <path className="earth-clouds" d="M258 173q29-13 60 1t60 0 64 5m-184 44q38-14 73 2t77-4 57 1m-182 39q40-10 72 4t77-3" fill="none" stroke="#ecfcff" strokeWidth="5" strokeLinecap="round" opacity=".38" />
        </g>
        <ellipse cx="354" cy="203" rx="33" ry="104" fill="none" stroke="#e5fbff" strokeOpacity=".33" strokeWidth="1.3" />
      </g>
      <g className="earth-orbit-lines" fill="none" stroke="#ffd400">
        <ellipse cx="354" cy="203" rx="183" ry="63" transform="rotate(-17 354 203)" strokeWidth="1.1" opacity=".72" />
        <ellipse cx="354" cy="203" rx="206" ry="89" transform="rotate(24 354 203)" strokeWidth=".7" strokeDasharray="3 10" opacity=".5" />
        <circle cx="177" cy="147" r="4" fill="#ffd400" stroke="none" />
      </g>
      <g className="earth-coordinate-lines" stroke="#d6e8ee" strokeOpacity=".33" strokeWidth=".7">
        <path d="M354 62v282M213 203h282" />
      </g>
    </svg>
  );
}
