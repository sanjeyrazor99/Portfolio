import { useId } from 'react';
import './manga-world.css';

/** Original vector scenery: a caped rooftop observer / cosmic martial artist,
 * a ruined city and impact terrain. No licensed artwork or quoted dialogue. */
export default function MangaWorld(){
  const id=useId().replace(/:/g,'');
  const towers=Array.from({length:23},(_,i)=>({x:i*69-60,w:43+(i*17)%32,h:90+(i*73)%210}));
  return <div className="manga-world" aria-hidden="true">
    <div className="manga-world-haze"/>
    <svg className="manga-world-art" viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMax slice" focusable="false">
      <defs>
        <pattern id={id+'windows'} width="16" height="23" patternUnits="userSpaceOnUse"><path d="M4 5h4v8H4z" fill="currentColor" opacity=".35"/></pattern>
        <pattern id={id+'dots'} width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="currentColor"/></pattern>
        <linearGradient id={id+'fade'} x2="0" y2="1"><stop stopColor="white" stopOpacity="0"/><stop offset="1" stopColor="white"/></linearGradient>
        <mask id={id+'terrain'}><rect width="1440" height="1000" fill={'url(#'+id+'fade)'}/></mask>
      </defs>
      <g className="world-impact-lines" fill="none" stroke="currentColor">
        {Array.from({length:34},(_,i)=>{const a=i/34*Math.PI*2;return <path key={i} d={`M${720+Math.cos(a)*490} ${340+Math.sin(a)*290} L${720+Math.cos(a)*1050} ${340+Math.sin(a)*760}`} strokeWidth={i%4===0?2:.6}/>;})}
        <ellipse cx="1070" cy="280" rx="190" ry="69" transform="rotate(-24 1070 280)"/>
        <ellipse cx="1070" cy="280" rx="215" ry="78" transform="rotate(-24 1070 280)" strokeDasharray="80 30 4 20"/>
      </g>
      <g className="world-city-far" stroke="currentColor" strokeWidth="1.2">
        {towers.map((b,i)=><g key={i}><path d={`M${b.x} 910V${910-b.h}l${b.w*.5} -${i%3*11} ${b.w*.5} ${i%3*11}V910z`} fill="currentColor" fillOpacity=".18"/><rect x={b.x+4} y={920-b.h} width={b.w-8} height={b.h-14} fill={'url(#'+id+'windows)'} stroke="none"/>{i%4===0&&<path d={`M${b.x+b.w/2} ${910-b.h}v-38m-13 25h26`} fill="none"/>}</g>)}
      </g>
      <g className="world-terrain" mask={'url(#'+id+'terrain)'} fill="none" stroke="currentColor">
        <path d="M-70 1040L385 764 605 844 845 736 1040 840 1510 700V1100z" fill="currentColor" fillOpacity=".06"/>
        {[0,1,2,3].map(i=><ellipse key={i} cx="1040" cy="940" rx={145+i*87} ry={27+i*17} strokeWidth={i===0?3:1.4} transform="rotate(-10 1040 940)"/>)}
        <path d="M1040 940l-105-43-45 12-86-39-63 8-103-76m296 100-26-61 18-20-32-62m148 177 54-68-8-29 72-83m-95 170 166 12 22-18 122 24M1040 940l-102 64-24-8-68 44" strokeWidth="2"/>
      </g>
      <g className="world-rooftop" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M-40 1000V914h189v-98h108v-94l56 15 18 22 31-17 44 28v230m1034 0V870h-100v-76l-36 9-23-21-50 12v206" fill="currentColor" fillOpacity=".18"/>
        <path d="M-40 913h189m-18-7h36m89-89h150m-138-95 19 91 32 18-9 49 51 33m-59-150 43 47-5 38 23 19" fill="none"/>
        <path d="M614 1000V869h224v131m-234-130h245v-13H604z" fill="currentColor" fillOpacity=".13"/>
      </g>
      <g className="world-caped-observer" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
        <ellipse cx="732" cy="682" rx="13" ry="16"/>
        <path d="M716 702q15-8 31 0l9 64-8 41 6 46h-15l-7-48-8 48h-14l5-48-7-43z"/>
        <path className="world-cape" d="M718 703q-8 47-34 103 42 17 85-4-13-40-25-99l-12 9z" fillOpacity=".12" strokeWidth="2"/>
        <path d="M713 854h17m7 0h19" fill="none" strokeWidth="3"/>
      </g>
      <g className="world-cosmic-fighter" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="m716 694-10-16 16 3 6-20 8 18 16-11-6 17 16 4-19 12z" fillOpacity=".6"/>
        <path d="m720 703 23-4 9 39-19 17-27-20z" fillOpacity=".2"/>
        <path d="m712 710-25 24-25-10m77-17 25 14 23-16m-57 45-27 39-32 25m64-64 24 41 36 15" fill="none" strokeWidth="9" strokeLinecap="round"/>
        <path d="m666 814-16 9m145-19 18 7" fill="none" strokeWidth="5"/>
      </g>
      <g className="world-floating-rubble" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="1.5">
        {[[140,290,1],[1260,410,1.5],[340,500,.7],[1120,650,.6],[600,190,.45],[880,550,.7]].map(([x,y,s],i)=><g key={i} className={'rubble rubble-'+i} style={{transformOrigin:`${x}px ${y}px`}}><path d={`M${x} ${y}l${21*s} -${14*s} ${17*s} ${10*s} -${5*s} ${22*s} -${27*s} ${5*s}z`}/><path d={`M${x} ${y}l${17*s} ${9*s} ${21*s} -${13*s}m-${21*s} ${13*s} -${6*s} ${14*s}`} fill="none"/></g>)}
      </g>
      <path d="M0 1000V890q300-120 580 55t860-35v90z" fill={'url(#'+id+'dots)'} opacity=".08"/>
    </svg>
  </div>;
}
