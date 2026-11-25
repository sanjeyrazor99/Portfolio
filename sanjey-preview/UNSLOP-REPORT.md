# Portfolio craft pass

Direction confirmed by owner: keep gradients and glass prominent, and retain the One Punch Man-inspired theme.

- Product: Sanjey's AI/data portfolio for recruiters.
- Character: confident, technical, illustrated.
- World: a printed manga dossier over a cinematic Earth backdrop.
- Moments: the interactive fist and detailed Earth remain the rich visual centerpieces.
- Signature: thin crimson/lavender ink rules around glass surfaces.

Audit: tablet navigation overflow; hero lettering competing with the fist; weak body-text hierarchy; repeated decorative labels; heavy frames; excess card hover scaling; a black hero rendering artifact.

Passes: consistent 4px spacing and card padding; three readable text roles while retaining theme gradients; 16px control icons; sentence-case section metadata; Inter for résumé/chat copy with Bangers display headings; contained hero scene beside a readable introduction; nested control radii inside the existing 32px glass panels; retained original procedural fist/Earth/city art; reduced unnecessary hover scaling while keeping deliberate punch, physics and theme motion.

Implementation: client/src/portfolio-polish.css, imported after liquid-glass.css. Functional features, content facts, section order, dual themes, physics and chatbot retrieval are preserved. User preferences explicitly override the skill's default recommendation to remove hue gradients and decorative visuals. No generated image or image prompt was needed: the existing procedural scene remains the core visual.

Workflow credit: unslop by Damir Sokolovsky (@heydamir), https://heydamir.design/unslop, CC BY 4.0. This report and the polish stylesheet retain attribution.

## Hero-only follow-up

Approved scope: hero only, preserving One Punch-inspired artwork, gradients, glass, dual themes and name physics. `hero-refinement.css` adds a localized glass reading surface, an intentional name hierarchy, shorter actions, aligned icons, stronger link contrast and a stacked mobile scene. The Earth moves to the upper right during the home chapter to clear the name row. Desktop pause control moves below the scene, away from the planet. No later sections were redesigned.

Nine passes: 24px/20px glass padding and 8/12/16/24px grouping; theme-aware text contrast on the glass; 16px action icons and 14px metadata icons; factual LLM/data-pipeline copy and shorter action labels; Bangers display / Inter body hierarchy; introduction and interactive scene separated; 28px outer glass and 12px controls; original procedural fist and Earth retained; existing intentional punch/physics motion kept with reduced-motion behavior unchanged. No image prompt or generated art was required.

Verified Standard tablet view and 390px Garou mobile view, including no horizontal overflow and both actions fitting one row. Attribution: unslop by Damir Sokolovsky (@heydamir), CC BY 4.0.

## Experience Explorer follow-up

Approved direction: one continuous glass dossier, compact supporting timeline, selected role and results as the main reading area. Scope is the Experience section only; gradients and glass remain part of the manga identity.

1. Spacing: consistent 8/12/16/20/24/32px grouping; removed nested frame padding and clipped detail scrolling.
2. Color: warm paper/crimson and cosmic ink/lavender use the same three text roles; the outer section owns one tinted glass frame.
3. Icons: previous/next and timeline use 16px Lucide icons with 1.5px strokes, aligned with their labels.
4. Copy: timeline gets a clear disclosure label; removed the redundant chapter stamp and scroll instruction without altering career facts.
5. Type: clear role-title hierarchy, readable 15px/26px bullets, quieter dates and 12px metadata.
6. Layout: role list and detail lead on desktop; the timeline is collapsed by default but all bars and its scrubber remain available. Mobile retains all eight role accordions.
7. Details: selected roles have one thin ink rule; filters and skill controls use restrained surface steps; keyboard/focus affordances remain.
8. Visuals: the existing Earth/gradient remains visible around and through the single glass surface; no generated image or prompt was needed.
9. Motion: short content changes retained with the existing reduced-motion gate; removed redundant nested backdrop processing when the GPU glass layer is active.

Manual checks: Data Engineering filter shows two roles; Next selects the research role; career timeline opens/closes and retains its range input; 390px mobile has no horizontal overflow; accordion selection changes roles; Garou text uses #f0eaff against the dark glass. React change scope: ExperienceExplorer.tsx, the Experience section's data attribute in Home.tsx, and main.tsx stylesheet import. Presentation lives in experience-refinement.css.

Workflow credit: unslop by Damir Sokolovsky (@heydamir), https://heydamir.design/unslop, CC BY 4.0.

## Projects gallery follow-up

Approved direction: illustrated project dossiers on glass, one wider lead card and four compact cards, explicit Details controls and visible supplied GitHub links. Scope is Projects only; all five projects remain in their existing order.

1. Spacing: 24px gutters/card padding, 32px lead-card padding and consistent action gaps.
2. Color: warm paper/crimson and cosmic ink/lavender glass; restrained metadata and tags; rich illustration color stays inside previews.
3. Icons: 16px action icons, 1.5px stroke; removed redundant folder icon.
4. Copy: factual section introduction, explicit Details/Back to overview labels, and clearly marked illustrative previews. Removed misleading live-room chrome and tiny pseudo-code; all project facts and verified URLs remain.
5. Type: 22px card titles / 28px lead title, 14px/24px body, quiet 12px context.
6. Layout: wide two-column lead card above four cards; single-column mobile; contained previews with larger legible labels.
7. Details: category is quiet text, thin title-selection ink rule, nested radii; existing GitHub links visible before flipping; no fabricated links for missing assets.
8. Visuals: original game, pipeline, analytics and robotics diagrams remain. MEMEoTron preview becomes a readable Images & text → OCR + Nemotron → Trend analysis flow. No generated images or image prompts were required.
9. Motion: flip and drag/tilt preserved, reduced-motion behavior retained, decorative continuous card drift removed. Escape closes details and restores focus to the opener.

Verified: aMuse-Us Details focuses Back to overview; Escape closes and restores opener focus. Front GitHub links match the two supplied URLs. At 390px, all five projects remain with no horizontal overflow; defense-pipeline details render in Garou with #f0eaff text. TypeScript, production build and all 18 tests pass. Changes remain local on testFrontend.

Workflow credit: unslop by Damir Sokolovsky (@heydamir), https://heydamir.design/unslop, CC BY 4.0.
