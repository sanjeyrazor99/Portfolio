type HeroProfileProps = {
  character: "garou" | "saitama";
};

/** Original ink silhouettes. Both profiles are drawn facing right. */
export default function HeroProfile({ character }: HeroProfileProps) {
  const garou = character === "garou";

  return (
    <svg viewBox="0 0 240 460" className="block h-auto w-full" aria-hidden="true" focusable="false">
      <g stroke="#161321" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        {!garou && (
          <path fill="#f9f2dc" d="M109 174Q53 168 44 223L12 459H160L148 207Z" />
        )}
        <path
          fill={garou ? "#252238" : "#edbc44"}
          d="M103 171Q85 185 61 199Q36 216 41 263L61 460H200L188 321Q207 275 183 230Q169 201 144 189L139 163Z"
        />
        <path
          fill={garou ? "#141423" : "#b77427"}
          stroke="none"
          d="M44 228Q89 252 115 325L118 460H61L40 270Z"
        />
        <path fill="none" d="M69 221Q88 225 107 246M116 289Q154 301 185 286M124 322L158 333" />
        <path
          fill={garou ? "#312c45" : "#f4ca59"}
          d="M76 218Q107 222 111 259L105 311L124 371L92 390Q66 353 56 317L49 263Q47 231 76 218Z"
        />
        <path
          fill={garou ? "#1d1b2d" : "#be3839"}
          d="M79 353L113 342L132 407Q125 422 99 425L83 412Z"
        />
        <path fill="#242032" d="M115 364L191 353L194 376L122 387Z" />
        {!garou && (
          <>
            <path fill="#f9f2dc" d="M97 169Q130 192 151 187L169 213L139 225L89 191Z" />
            <circle cx="104" cy="191" r="8" fill="#27243a" />
            <path fill="none" d="M150 216L158 255" />
          </>
        )}
        <path
          fill={garou ? "#bd8a7b" : "#e9b395"}
          d="M95 91Q103 58 141 56Q178 55 184 92L185 107L198 129L187 135L187 145L181 149Q178 171 159 175L141 166L141 189Q120 189 101 173L113 144Q93 127 95 91Z"
        />
        <path
          fill={garou ? "#82586a" : "#ad715e"}
          stroke="none"
          d="M111 109Q115 142 138 149L141 166L141 185Q122 182 106 172L115 145Q96 132 96 108Z"
        />
        {garou && (
          <path
            fill="#d1c8e1"
            d="M110 131L89 117L78 100L63 99L78 79L57 68L83 60L67 34L102 47L96 12L131 39L146 19L155 49L177 38L175 63L190 58L182 91L171 79L159 105L150 93L139 126L128 104L121 134Z"
          />
        )}
        <path fill="none" d="M136 118Q124 108 124 124Q126 135 136 138M175 148L185 148" />
        <path fill="#fffbec" d="M162 113L181 107L177 118Z" />
        <path fill="none" d="M175 110L175 116M160 105L178 99" />
      </g>
    </svg>
  );
}
