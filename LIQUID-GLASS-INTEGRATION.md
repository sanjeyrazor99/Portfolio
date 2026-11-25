# Global background and liquid glass integration

Implemented in the `testFrontend` checkout at `Portfolio/sanjey-preview`. This is the current Git-backed site; the sibling `3D Portfolio/sanjey-preview` is the older preview copy.

## Layout / React

In `client/src/pages/Home.tsx`, keep the existing mode, mounted and motion state, then use this layout order. Do not place another gradient inside the hero:

```tsx
useLiquidGlass(!mounted || frozen);

// Inside the existing .portfolio root, before the main element:
{mode === "saitama" && (
  <HeroGradientBackground mode={mode} frozen={frozen} />
)}
<BackgroundWorld frozen={frozen} onReady={setBackgroundWebgl} />
<header className="site-header backdrop-blur-xl" data-liquid-glass="nav">
  {/* Existing brand, navigation and controls stay unchanged. */}
</header>
<main id="main">{/* Existing hero and all sections. */}</main>
```

The header's current position before the decorative worlds in the JSX is also valid: explicit stacking puts the background behind it. The global gradient is fixed, covering the viewport continuously across all sections. Garou does not render the gradient component at all.

## Mark existing HTML/JSX panels

Keep all current content, event handlers, refs, ARIA and inert attributes. These are the new opt-in attributes/classes:

```tsx
<div className="project-front backdrop-blur-xl" data-liquid-glass="panel" aria-hidden={flipped} inert={flipped}>...</div>
<div className="project-back backdrop-blur-xl" data-liquid-glass="panel" aria-hidden={!flipped} inert={!flipped}>...</div>
<div className="experience-explorer backdrop-blur-xl" data-liquid-glass="panel">...</div>
<section className="portfolio-chat backdrop-blur-xl" data-liquid-glass="panel" aria-labelledby="portfolio-chat-title">...</section>
<div className="contact-info backdrop-blur-xl" data-liquid-glass="panel">...</div>
```

## CSS tuning

`client/src/liquid-glass.css` is imported after manga-theme.css in main.tsx. Its final overrides control the effect:

```css
.portfolio { --glass-blur:24; --glass-radius:32px; --glass-refraction:12; --glass-tint:.76; }
.portfolio .global-warm-background { position:fixed; inset:0; z-index:0; opacity:1; }
.portfolio.mode-saitama .background-world { background:transparent!important; }
.portfolio #home.hero { background:transparent!important; }
.portfolio header.site-header[data-liquid-glass] {
  --glass-tint:.16;
  background:rgba(250,247,242,.16)!important;
  border-radius:999px!important;
}
.portfolio.mode-garou header.site-header[data-liquid-glass] {
  --glass-tint:.2;
  background:rgba(15,13,23,.2)!important;
}
```

Use the complete CSS file, not just these tuning excerpts: it includes contrast, radius, theme, reduced-transparency, and legacy-selector overrides. Small contrast backings sit behind navigation labels/controls, never across the entire bar. Standard uses #C52828 borders; Garou uses #C4B5FD. Panel tint remains stronger than the navigation to protect long-form text.

## React-safe JavaScript / TypeScript

The complete implementations to copy are:

- `client/src/hooks/useLiquidGlass.ts`: lazy import in useEffect, reduced-motion/low-power checks and teardown.
- `client/src/lib/liquidGlass.ts`: adapted Container shader logic, shared GPU renderer, curved edge normals and tint per marked DOM panel. It inserts only decorative aria-hidden canvases; it never moves React children or captures text.
- `client/src/lib/worldGlassSource.ts`: synchronous live Earth and gradient frame subscriptions.
- `client/src/components/portfolio/EarthScene.tsx`: publishes Earth immediately after rendering.
- `client/src/components/portfolio/HeroGradientScene.tsx`: renders and publishes the global gradient in its R3F frame callback.
- `client/src/components/portfolio/HeroGradientBackground.tsx`: same local-assets gradient wrapper, now marked global-warm-background.

This is an adaptation of the MIT Liquid Glass JS core shader approach, not a literal import of its global vanilla Container. Attribution is in THIRD-PARTY-NOTICES.md. Do not paste upstream CDN script tags or replace React's child nodes. The original library's static full-page html2canvas snapshot would miss the continuously moving 3D background. The adapted sampler composites the live gradient and Earth (plus procedural space) into the shader input; Garou skips the warm input. Body text remains real, selectable DOM.

Reduced motion, Read/Lite mode, low-power heuristics and WebGL failures use CSS backdrop blur. Reduced transparency uses solid panels. The gradient keeps its static warm fallback when motion is disabled and is always absent in Garou.

## Run

```powershell
corepack pnpm install --frozen-lockfile
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4199 --strictPort
```

Validation: npm run check, npm run build, npm test. Existing bundle-size/GSAP warnings do not prevent production output.

## Latest settings (supersedes the earlier mode-only snippet)

Render `<HeroGradientBackground mode={mode} frozen={frozen} />` in the layout for BOTH themes, outside the hero. Garou now has a cosmic shader gradient behind the Earth rather than unmounting the gradient. Speed is 0.15 in HeroGradientScene.tsx. Palette CSS tokens at the end of liquid-glass.css are #FAF7F2 / #D97757 / #B84A4A for Standard and #0F0D17 / #5B21B6 / #C4B5FD for Garou. The current exact JSX/HTML opt-in attributes and complete JS are already in the linked source files above. Blur remains 24px, card radius 32px, refraction 12px, with reduced-motion/low-power CSS fallbacks. Navigation preserves the latest borderless gradient and gradient control tiles requested by the owner.
