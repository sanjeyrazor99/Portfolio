import { useId } from "react";

export type CharacterArtProps = {
  character: "saitama" | "garou";
  pose?: "back" | "standing" | "punch" | "fighting";
  className?: string;
  label?: string;
};

const ink = "#171717";
const outline = {
  stroke: ink,
  strokeWidth: 4,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

function Saitama({
  pose,
  dots,
}: {
  pose: "back" | "standing" | "punch" | "fighting";
  dots: string;
}) {
  const back = pose === "back";
  const punch = pose === "punch" || pose === "fighting";
  return (
    <g className={`char-saitama char-saitama-${pose}`} {...outline}>
      {/* Cape attached behind shoulders */}
      <g className="char-saitama-cape char-cape">
        <path
          d={
            back
              ? "M111 174 Q157 153 208 176 L250 197 Q279 300 275 398 Q220 463 159 479 Q97 452 45 399 Q51 290 72 198Z"
              : "M113 182 Q78 181 37 208 Q48 278 33 375 Q65 402 98 408 L112 300 L218 301 L239 405 Q277 395 295 366 Q267 260 207 184Z"
          }
          fill="#fff"
        />
        <path
          d={
            back
              ? "M159 180 Q212 196 222 269 Q229 350 261 401 Q224 448 160 466 Q191 383 172 318 Q154 249 132 187Z"
              : "M242 242 Q269 300 287 363 Q273 384 247 393 L218 300Z"
          }
          fill="#D8DCE3"
          stroke="none"
        />
        <path
          d={
            back
              ? "M111 174 Q157 153 208 176 L250 197 Q279 300 275 398 Q220 463 159 479 Q97 452 45 399 Q51 290 72 198Z"
              : "M113 182 Q78 181 37 208 Q48 278 33 375 Q65 402 98 408 L112 300 L218 301 L239 405 Q277 395 295 366 Q267 260 207 184Z"
          }
          fill={`url(#${dots})`}
          stroke="none"
          opacity=".25"
        />
        <circle cx="120" cy="190" r="7" fill="#333" />
        <circle cx="201" cy="190" r="7" fill="#333" />
        <path
          d={
            back
              ? "M111 174 Q157 153 208 176 L250 197 Q279 300 275 398 Q220 463 159 479 Q97 452 45 399 Q51 290 72 198Z"
              : "M113 182 Q78 181 37 208 Q48 278 33 375 Q65 402 98 408 L112 300 L218 301 L239 405 Q277 395 295 366 Q267 260 207 184Z"
          }
          fill="none"
        />
      </g>
      {/* Feet and legs */}
      <g className="char-saitama-legs">
        <path
          d={
            back
              ? "M118 341 L209 341 L204 436 L185 476 L121 472 L105 437Z"
              : "M137 322 L211 321 L203 421 L225 477 L172 487 L140 436 L116 482 L64 479 L106 419 L91 342Z"
          }
          fill="#F2C84B"
        />
        <path
          d="M110 411 Q150 428 207 409 L204 439 Q159 456 101 438Z"
          fill="#D9A92E"
          stroke="none"
        />
        {!back && (
          <path
            d="M78 448 L126 452 L113 488 Q89 500 55 486Z M172 449 L212 438 L242 481 Q222 500 183 487Z"
            fill="#B5382A"
          />
        )}
        {back && (
          <path
            d="M112 443 Q153 457 204 442 L188 478 L121 475Z"
            fill="#B5382A"
          />
        )}
        <path
          d={
            back
              ? "M118 341 L209 341 L204 436 L185 476 L121 472 L105 437Z"
              : "M137 322 L211 321 L203 421 L225 477 L172 487 L140 436 L116 482 L64 479 L106 419 L91 342Z"
          }
          fill="none"
        />
      </g>
      {/* Torso suit */}
      <g className="char-saitama-torso">
        <path
          d="M119 181 Q157 161 196 181 L228 199 L247 319 Q197 350 87 326 L92 215Z"
          fill="#F2C84B"
        />
        <path
          d="M94 270 Q160 287 239 266 L247 319 Q177 350 87 326Z"
          fill="#D9A92E"
          stroke="none"
        />
        <path
          d="M131 185 L159 219 L185 185 L177 211 L159 227 L138 211Z"
          fill="#fff"
        />
        <path
          d="M156 220 L162 220 L163 301 L156 301Z"
          fill="#fff"
          stroke="none"
        />
        <path
          d="M92 300 Q164 315 244 296 L246 322 Q167 341 89 328Z"
          fill="#242321"
        />
        <ellipse cx="164" cy="317" rx="13" ry="13" fill="#D9A92E" />
        <circle cx="164" cy="317" r="6" fill="#F2C84B" stroke="none" />
        <path
          d="M119 181 Q157 161 196 181 L228 199 L247 319 Q197 350 87 326 L92 215Z"
          fill="none"
        />
      </g>
      {/* Head, rear or expressive simple front */}
      <g className="char-saitama-head">
        <path
          d={
            back
              ? "M119 92 Q119 47 159 40 Q202 42 207 91 L201 146 Q187 175 160 178 Q131 171 119 144Z"
              : "M111 94 Q110 43 160 37 Q211 42 209 96 L202 146 Q187 176 160 177 Q131 172 117 144Z"
          }
          fill="#F1C9A9"
        />
        <ellipse cx="111" cy="112" rx="11" ry="19" fill="#F1C9A9" />
        <ellipse cx="209" cy="112" rx="11" ry="19" fill="#F1C9A9" />
        <path
          d="M122 125 Q134 135 146 126 M174 126 Q187 135 199 124"
          fill="none"
          stroke="#9b6d58"
          strokeWidth="2"
        />
        {!back && (
          <g className="char-saitama-face">
            <g className="char-blink char-saitama-eyes">
              <path
                d="M132 105 L146 103 M174 103 L188 105"
                fill="none"
                stroke={ink}
                strokeWidth="2.5"
              />
              <circle cx="140" cy="114" r="2.6" fill={ink} stroke="none" />
              <circle cx="180" cy="114" r="2.6" fill={ink} stroke="none" />
            </g>
            <path
              d="M160 113 L157 127 L162 128 M150 143 Q160 145 171 143"
              fill="none"
              stroke={ink}
              strokeWidth="2"
            />
          </g>
        )}
        <path
          d={
            back
              ? "M119 92 Q119 47 159 40 Q202 42 207 91 L201 146 Q187 175 160 178 Q131 171 119 144Z"
              : "M111 94 Q110 43 160 37 Q211 42 209 96 L202 146 Q187 176 160 177 Q131 172 117 144Z"
          }
          fill="none"
        />
      </g>
      {/* Arms and crossed gloves; punch pose projects a clear red fist */}
      <g className="char-saitama-arms">
        {back ? (
          <>
            <path
              d="M100 205 Q73 228 91 278 L110 302 L133 285 L119 260 L131 218Z"
              fill="#F2C84B"
            />
            <path
              d="M214 205 Q244 228 225 277 L207 302 L185 284 L198 257 L185 218Z"
              fill="#F2C84B"
            />
            <path
              d="M88 266 L133 280 L119 310 Q101 319 85 300Z M190 279 L228 264 L235 299 Q220 319 201 308Z"
              fill="#B5382A"
            />
          </>
        ) : punch ? (
          <>
            <path
              d="M106 208 Q78 229 102 265 L142 283 L161 253 L132 233Z"
              fill="#F2C84B"
            />
            <path
              d="M206 205 Q240 216 227 251 L194 268 L177 244 L198 229Z"
              fill="#F2C84B"
            />
            <path
              d="M91 238 Q59 229 45 205 Q32 190 20 201 Q14 214 30 233 L59 261 Q74 273 105 268Z"
              fill="#B5382A"
            />
            <path
              d="M18 202 Q27 185 42 196 L53 211 L40 231 L24 222Z"
              fill="#C94A38"
            />
            <path
              d="M178 244 L211 258 L198 288 Q179 298 162 281Z"
              fill="#B5382A"
            />
          </>
        ) : (
          <>
            <path
              d="M105 204 Q76 218 89 258 L135 293 L151 270 L119 244Z"
              fill="#F2C84B"
            />
            <path
              d="M213 204 Q243 221 226 259 L183 294 L167 270 L198 243Z"
              fill="#F2C84B"
            />
            <path
              d="M116 257 L155 269 L149 300 Q133 311 117 298 L99 281Z M169 268 L208 255 L225 280 L202 301 Q184 312 168 298Z"
              fill="#B5382A"
            />
            <path
              d="M126 276 Q157 290 195 276"
              fill="none"
              stroke="#7d241d"
              strokeWidth="2"
            />
          </>
        )}
        {!back && (
          <path
            d="M106 208 Q76 218 89 258 L135 293 L151 270 L119 244Z M213 204 Q243 221 226 259 L183 294 L167 270 L198 243Z"
            fill="none"
          />
        )}
      </g>
    </g>
  );
}

function Garou() {
  return (
    <g className="char-garou char-garou-fighting" {...outline}>
      <g className="char-garou-legs">
        <path
          d="M127 250 L175 256 L162 341 L129 391 L95 386 L120 335 L89 328 L54 371 L23 355 L67 290Z"
          fill="#E9E6DA"
        />
        <path
          d="M173 253 L222 264 L260 311 L301 337 L282 367 L231 348 L193 320 L184 389 L147 393 L153 333Z"
          fill="#E9E6DA"
        />
        <path
          d="M31 346 L67 360 L51 383 L19 374Z M267 352 L291 332 L318 346 L306 371 L280 376Z"
          fill="#202020"
        />
        <path
          d="M124 300 L158 309 L137 350 L107 346Z M202 297 L230 316 L252 341 L230 342Z"
          fill="#c9c6bc"
          stroke="none"
        />
      </g>
      <g className="char-garou-torso">
        <path
          d="M127 142 Q157 129 186 144 L220 166 L236 243 Q203 274 160 267 Q113 272 79 243 L99 168Z"
          fill="#242425"
        />
        <path
          d="M110 165 Q157 184 204 164 L218 218 Q163 242 94 216Z"
          fill="#333334"
          stroke="none"
        />
        <path
          d="M127 142 Q157 129 186 144 L220 166 L236 243 Q203 274 160 267 Q113 272 79 243 L99 168Z"
          fill="none"
        />
      </g>
      <g className="char-garou-sash char-sash">
        <path
          d="M107 221 Q157 240 222 217 L229 239 Q163 265 99 242Z"
          fill="#d6bd78"
        />
        <path
          d="M204 231 L226 225 L251 319 L236 349 L228 316 L217 342 L214 307Z"
          fill="#d6bd78"
        />
        <path
          d="M115 237 Q157 252 209 235"
          fill="none"
          stroke="#f0dca4"
          strokeWidth="3"
        />
      </g>
      <g className="char-garou-arms">
        <path
          d="M101 169 Q76 159 62 189 L40 239 Q32 255 46 264 Q61 268 70 246 L95 218 L124 209Z"
          fill="#242425"
        />
        <path
          d="M47 246 Q28 243 17 257 Q10 269 23 276 L49 273 L63 258Z"
          fill="#c99772"
        />
        <path
          d="M209 168 Q237 159 250 186 L275 224 Q285 239 272 250 Q257 253 247 233 L224 213 L198 207Z"
          fill="#242425"
        />
        <path
          d="M268 227 Q286 213 302 220 L318 235 Q319 246 307 247 L295 241 L291 257 Q282 263 276 251 L273 244 Q265 256 259 246Z"
          fill="#c99772"
        />
        <path
          d="M101 169 Q76 159 62 189 L40 239 Q32 255 46 264 M209 168 Q237 159 250 186 L275 224"
          fill="none"
        />
      </g>
      <g className="char-garou-energy" fill="none" strokeLinecap="round">
        <path
          d="M317 232 Q335 213 329 193 Q322 176 338 166"
          stroke="#7B2CBF"
          strokeWidth="4"
          opacity=".8"
        />
        <path
          d="M308 248 Q329 238 322 222 Q315 206 336 194"
          stroke="#C0C6D4"
          strokeWidth="2.5"
          opacity=".92"
        />
        <path
          d="M319 229 Q326 225 335 226"
          stroke="#ffffff"
          strokeWidth="2"
          opacity=".92"
        />
      </g>
      <g className="char-garou-head">
        <g className="char-garou-hair char-spikes">
          <path
            d="M120 104 L108 80 L123 86 L116 57 L137 73 L143 39 L158 66 L177 31 L181 66 L208 45 L199 78 L221 69 L206 99 L201 130 Q184 153 157 153 Q131 149 119 129Z"
            fill="#e9e8e4"
          />
          <path
            d="M121 104 L111 84 L125 92 L122 64 L142 82 L151 48 L163 78 L179 41 L184 77 L208 57 L198 86"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
          />
          <path
            d="M127 88 L142 102 M159 66 L162 91 M187 68 L182 96"
            fill="none"
            stroke="#aeb5c1"
            strokeWidth="2.5"
          />
        </g>
        <g className="char-garou-face">
          <path
            d="M121 96 Q142 82 165 88 L197 92 L204 121 Q192 143 162 146 Q134 142 121 124Z"
            fill="#c99772"
          />
          <ellipse cx="121" cy="114" rx="6" ry="10" fill="#c99772" />
          <path
            d="M124 105 L147 101 L156 107 M170 107 L195 101"
            fill="none"
            stroke="#29221e"
            strokeWidth="4"
          />
          <path
            d="M136 115 L145 114 M177 114 L187 115"
            fill="none"
            stroke="#171717"
            strokeWidth="3"
          />
          <path
            d="M160 114 L156 127 L162 128 M147 137 Q163 131 178 137"
            fill="none"
            stroke="#5d342c"
            strokeWidth="3"
          />
          <path
            d="M121 96 Q142 82 165 88 L197 92 L204 121 Q192 143 162 146 Q134 142 121 124Z"
            fill="none"
          />
        </g>
      </g>
    </g>
  );
}

export default function CharacterArt({
  character,
  pose = "standing",
  className,
  label,
}: CharacterArtProps) {
  const rawId = useId();
  const id = `character-dots-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const decorative = !label;
  return (
    <svg
      className={`character-art character-art--${character} ${className ?? ""}`}
      viewBox={character === "saitama" ? "0 0 330 510" : "0 0 340 420"}
      role={decorative ? undefined : "img"}
      aria-label={label}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.25" fill="#777" />
        </pattern>
      </defs>
      {character === "saitama" ? <Saitama pose={pose} dots={id} /> : <Garou />}
    </svg>
  );
}
