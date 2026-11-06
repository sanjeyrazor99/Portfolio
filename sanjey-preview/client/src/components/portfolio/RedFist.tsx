import { useId } from "react";

const fingers = [
  "M74 207Q66 144 111 128Q157 114 173 174L169 337Q158 382 114 369Q87 363 81 323Z",
  "M153 177Q142 105 194 92Q243 77 260 152L258 350Q252 398 202 391Q163 388 159 352Z",
  "M247 150Q245 75 303 72Q358 70 363 141L348 357Q339 407 288 402Q251 396 248 358Z",
  "M353 149Q371 89 423 104Q481 118 459 187L423 365Q408 413 362 404Q329 398 337 356Z",
];
export default function RedFist() {
  const id = useId();
  return <svg viewBox="0 0 540 500" aria-hidden="true">
    <defs>
      <linearGradient id={id+"paint"} x2=".25" y2="1">
        <stop stopColor="#7A0F0F"/><stop offset=".48" stopColor="#C21F1F"/><stop offset=".85" stopColor="#FF4A2A"/><stop offset="1" stopColor="#F7DDA0"/>
      </linearGradient>
      <pattern id={id+"dots"} width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#0B0B0F" opacity=".32"/></pattern>
      <filter id={id+"edge"}><feTurbulence baseFrequency=".055" numOctaves="2" seed="12" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="2.5"/></filter>
    </defs>
    <g stroke="#0B0B0F" strokeWidth="5" strokeLinejoin="round" filter={`url(#${id}edge)`}>
      <path className="fist-base" fill="#7A0F0F" d="M75 202Q49 241 77 305L156 347L337 438L425 444Q460 404 465 308L470 175Z"/>
      <path className="fist-thumb" fill={`url(#${id}paint)`} d="M423 334Q454 329 445 377L417 448Q402 480 368 463L278 430Q246 416 259 388Q270 369 310 376L363 391Z"/>
      {fingers.map((path, i) => <g className="fist-knuckle" key={path}>
        <path d={path} fill={`url(#${id}paint)`}/>
        <path d={path} fill={`url(#${id}dots)`} stroke="none"/>
        <path fill="#0B0B0F" stroke="none" transform={`translate(${[104,184,281,394][i]} ${[146,111,93,122][i]}) rotate(${i*8-12})`} d="M-19 0Q-4-18 21-7L28 11 19 31 3 43-6 36-17 39-13 24-23 19Z"/>
        <ellipse className="fist-glint" cx={[133,221,326,439][i]} cy={[184,153,136,162][i]} rx="7" ry="17" transform={`rotate(29 ${[133,221,326,439][i]} ${[184,153,136,162][i]})`} fill="#FF6544" stroke="none"/>
      </g>)}
      <g className="fist-hatch" strokeWidth="3" strokeLinecap="round">
        {[0,1,2,3].flatMap((finger) => Array.from({length:12}, (_, line) => {
          const x = [92,171,262,353][finger] - line * (finger + 1) * .43;
          const y = 248 + line * 8;
          return <path key={finger*12+line} d={`M${x} ${y}l${9+line%4*2} -13`}/>;
        }))}
      </g>
      <path className="fist-rim" d="M101 351q22 15 46 6m25 12q28 19 60 9m30 0q29 20 62 12m26-11q29 20 60 8m-132 32 101 35" fill="none" stroke="#F7DDA0" strokeWidth="6" strokeLinecap="round"/>
    </g>
  </svg>;
}
