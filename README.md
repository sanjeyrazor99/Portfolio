# Sanjey Manian — One Punch, Zero Failures

A responsive static React/TypeScript portfolio built as a printed fight-manga dossier. It keeps the supplied career, résumé, project, skills and contact content; adds original layered SVG Saitama/Garou illustrations, a scroll-driven Three.js Earth enhancement with an always-visible animated SVG fallback, and GSAP ScrollTrigger chapter/rail choreography. There is no backend, account, database, copyrighted anime artwork or scraped audio.

## Run and build

Use Node.js 22+ and pnpm 10.18.0:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:static
```

Preview uses port 3000. Run `pnpm check` for TypeScript, `pnpm test` for the portfolio/content regression suite, and `pnpm build:static` to create the prerendered `dist/public` directory. The build includes crawlable initial React-rendered HTML and client hydration. The site is static; Three.js is lazy-loaded only as an optional desktop enhancement.

## Content, résumé, and contact

`client/src/data/portfolio.ts` is the source of truth for roles, dates, projects, certifications, the complete skill taxonomy, résumé statistics and owner-editable URLs. `client/src/pages/Home.tsx` composes the hero, chapters, navigation, motion modes and closing contact section. The original public-safe résumé files live in `client/public`; both omit the private phone number. The supplied aMuse-Us and MEMEoTron GitHub links are connected. Other project/demo links, a real editing-reel embed and the recipient-verified Formspree endpoint await owner-provided values; placeholders are intentionally not fabricated.

The contact form validates name, email and message. With no Formspree URL configured, it opens an honest prefilled email draft that the visitor must send; it does not claim that an unconfigured submission was sent. Set `portfolioLinks.formspree` in the data file only after creating the owner's form for `maniansanjey@gmail.com` and verifying its recipient.

## Visual and motion modules

- `client/src/components/portfolio/CharacterArt.tsx` contains original, reusable Saitama and Garou SVG groups. Character layers use thick outlines, spot colors and halftone shading; independent CSS transforms animate capes, hair, eyes, torso, Garou's sash and punch poses. The old primitive character scene files were removed.
- `EarthScene.tsx` adds only the optional procedural globe/camera enhancement. `EarthFallback.tsx` always paints the map-textured Earth, orbit lines, twinkling stars and drifting clouds beneath it, including on mobile or when WebGL cannot start.
- `MangaScrollFX.tsx` owns the responsive GSAP ScrollTrigger chapter wipes, pinned 1.5-screen Earth-to-chapter camera passage, horizontal desktop Experience/Projects rails, velocity-driven movement and shared 90 BPM widget clock. Its cleanup restores global styles and triggers.
- `SkillConstellation.tsx` retains the semantic complete skill list alongside draggable nodes, Push/Pull controls and click shockwaves. Read Mode pauses motion without switching to Lite Mode or hiding this list; Lite Mode is separate.
- `client/src/manga-theme.css` loads after `index.css` and applies warm #F5F1E6 paper, screentone grain, black-ink gutters and outlines, #FFD400/#D7263D hero accents and intentional purple/silver Garou panels. Anton, Inter and JetBrains Mono are loaded in `client/index.html`. `client/src/index.css` retains the responsive base styles and project-card interactions.

Read Mode and Lite Mode are OFF initially. Browser `prefers-reduced-motion` is honored without silently toggling either control. Small screens use the always-painted SVG instead of requesting the enhanced WebGL scene. The footer reports actual WebGL and motion state. Sound is OFF initially and uses only a brief opt-in Web Audio tone. Focus outlines, keyboard-operable artwork controls, reduced-motion behavior, a static skill list and phone-free résumé copies are deliberate accessibility/privacy choices.

## SEO and remaining owner assets

SEO fields, original favicon, OG artwork and verified production canonical are in `client/index.html` and `client/public`. Update the canonical and `og:url` if the site moves to another domain. `client/public/manus-routes.json` declares the single page route. The website publication/visibility setting remains controlled by the owner; no access expansion is encoded in the repository.

The eight-role timeline is newest-start-first with the 2020 Origin Story at its base. Impact statements remain in disclosure panels. The editing-reel embed, remaining project/demo URLs and verified Formspree endpoint await the owner; content not provided by the owner remains a clearly identified placeholder.
## Hero ShaderGradient

The hero-only decorative layer uses `@shadergradient/react` 2.4.20 and React Three Fiber 9.8.2 (React 19 compatible). Three 0.187.0 and Rapier 0.14.0 remain unchanged. Palette tokens live in `client/src/manga-theme.css`; `HeroGradientBackground.tsx` reads those tokens and `HeroGradientScene.tsx` interpolates the compiled color uniforms. Flow speed is 0.18. Light CSS print grain replaces the package's heavier postprocessing grain.

The published package embeds legacy Three shader includes. A material-scoped compatibility adapter removes unused environment/transmission includes for this ambient-only, reflection-free layer; it does not patch the existing fist/Earth materials. No remote environment maps or textures are requested. The layer ignores pointer events, clips to the hero, stops rendering offscreen/in hidden tabs, caps DPR, and uses a matching static CSS gradient for reduced motion, Read/Lite modes, constrained devices, unavailable WebGL2, and context loss.

Local preview: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4199 --strictPort`. Validate with `npm run check`, `npm run build`, and `npm test`. The existing Builder JSX locator plugin has a Vite 4/5 peer-range warning under Vite 7; the new React/Three dependencies resolve without peer overrides.

## Liquid glass on testFrontend

`client/src/liquid-glass.css` defines `--glass-blur: 10` (CSS pixels) and `--glass-refraction: 12` (edge displacement pixels), warm paper/red and cosmic/lavender styling. It loads last in `client/src/main.tsx`. `Home.tsx` calls `useLiquidGlass` with Read/Lite/system motion state. `client/src/hooks/useLiquidGlass.ts` lazy-loads the enhancement only when permitted. `client/src/lib/liquidGlass.ts` adapts the MIT Liquid Glass JS Container edge-refraction approach; attribution is in THIRD-PARTY-NOTICES.md.

The shared renderer samples live Earth pixels immediately after `EarthScene.tsx` renders, through `worldGlassSource.ts`, and composites them over a procedural space field. It intentionally samples only the Earth/space background, not the whole DOM, the hero fist, or text. This avoids stale html2canvas page captures and text distortion. One GPU context renders up to eight visible panel faces, capped to 800×650 pixels, with a half-resolution shared source, nine blur taps, and a maximum 12.5 updates/sec. No per-panel animation loop, remote assets, new packages, or Three.js dependency changes are introduced. A rotated/tilted card uses its viewport bounding box as the sample window.

Navigation, project faces, and active experience details use translucent CSS blur before the shader is ready and when WebGL is unavailable. Reduced motion, Read/Lite mode, Save-Data, <=4GB reported RAM, <=4 CPU threads, reduced transparency and forced colors skip the GPU enhancement. Hidden tabs skip uploads. Context loss returns all panels to CSS; unmount removes inserted canvases, observers, subscriptions, and GPU resources. Solid styles apply for reduced transparency. Backdrop blur gracefully becomes a translucent panel where the browser lacks backdrop-filter support.

The nested checkout has its own `postcss.config.cjs` to prevent inheriting the parent legacy scaffold's Tailwind 3 configuration. This Vite 7 app uses @tailwindcss/vite / Tailwind 4.

Run `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4199 --strictPort` from this folder. To see the WebGL effect, use a normal-motion browser with Read/Lite off. The accessible CSS fallback is expected when the browser requests reduced motion.

### Minimal curved glass revision

Components now opt in explicitly with `data-liquid-glass="nav"` or `data-liquid-glass="panel"` and Tailwind `backdrop-blur-xl`: Home navigation/contact-info, ProjectCard front/back, ExperienceExplorer outer container, and PortfolioChat. The hook still owns cleanup and fallbacks; the renderer discovers only those marked containers. The shader uses rounded-rectangle distance/normal calculations and each element's computed corner radius, plus per-container tint (`--glass-tint`).

Final tuning tokens are at the end of `client/src/liquid-glass.css`: `--glass-blur:24` (matches backdrop-blur-xl), `--glass-radius:32px`, `--glass-refraction:12`, and `--glass-tint:.76`. Navigation uses a 999px pill radius, a .38 shader tint, and .38/.42 CSS background opacity for Standard/Garou; localized pills protect link/control contrast. Set those CSS tokens to tune the appearance without editing React. Panels retain thin crimson/lavender borders and subtle static halftone. Chat answers, citations, input, and discovery tracking are unchanged. The oversized legacy contact frame was replaced by separate frosted contact-info and chatbot panels.

## Current combined visual settings

The global ShaderGradient is now active in both themes: Standard uses cream #FAF7F2, muted orange #D97757 and restrained crimson #B84A4A; Garou uses #0F0D17, #5B21B6 and #C4B5FD. `HeroGradientScene.tsx` sets uSpeed to 0.15, with lightweight CSS print grain. Both live palettes feed the shared glass source. This supersedes the earlier Garou-without-gradient setup. The navigation retains the owner-approved borderless red/purple gradient shell and cream/lavender gradient control tiles; the unboxed logo sits directly on the bar.

The Earth reference is recreated as original procedural 3D: detailed blue oceans, generated continent silhouettes, noisy terrain relief, water-only specular highlights, polar ice, and an independent cloud shell. `earthTextures.ts` caches the local 1536px atlas shared by the 3D globe and a 1024px lit spherical poster. `DetailedEarthFallback.tsx` paints that poster once for reduced motion and failed/unavailable WebGL. No external texture requests or flat screenshot billboard are used. Decorative registry IDs and chapter/project numbers were removed; factual dates, timeline controls, and project outcomes remain.
