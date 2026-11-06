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
