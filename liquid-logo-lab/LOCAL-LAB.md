# Sanjey's local Liquid Metal Lab

Cloned from https://github.com/paper-design/liquid-logo. Upstream MIT license is retained. This is a separate React 19 / Next.js lab; the React 19 / Vite 7 portfolio dependencies are unchanged.

## Run

`corepack pnpm install`

`node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 4200`

Open http://127.0.0.1:4200. The root page processes files locally and does not use the upstream Vercel upload or sharing route. Analytics is removed. The bundled SM mark is an original placeholder, not the user's supplied logo. Choose a transparent PNG or SVG to replace it.

## Starting presets

| Setting | Saitama | Garou |
| --- | --- | --- |
| Highlight | #FAF7F2 | #C4B5FD |
| Metal | #F5C400 | #5B21B6 |
| Shadow | #C52828 | #0F0D17 |
| Speed | 0.15 | 0.12 |
| Refraction / dispersion | 0.012 | 0.018 |
| Pattern scale | 2 | 2 |
| Edge | 0.4 | 0.4 |
| Pattern blur | 0.005 | 0.005 |
| Liquid | 0.07 | 0.07 |

These are starting settings, pending the actual logo. Controls download exact settings as JSON. The upstream `refraction` parameter is labeled dispersion in its UI. We added three color uniforms to its custom liquid shader. Although the repo depends on @paper-design/shaders-react, the logo demo's active renderer uses its own WebGL2 canvas and mask preprocessing; the custom preset values are not interchangeable package props.

## Recording

WebM VP9 records 1080×1080 at a requested 30fps / 5Mbps for 8 seconds. Motion follows a cosine-based periodic time path, returning to the same phase every eight seconds. Browser scheduling can introduce a join or dropped frames, so inspect the downloaded clip. Keep the tab visible. Transparent background is requested, but browser MediaRecorder implementations may flatten alpha. MP4 is offered only when the browser reports support; use opaque background for MP4. No verified final-logo asset exists until the user supplies the PNG.

For an opaque MP4 conversion with FFmpeg installed, first record with transparency unchecked, then run:

`ffmpeg -i sanjey-garou-opaque.webm -an -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart sanjey-garou.mp4`

For alpha, verify decoded frames and alpha metadata in an alpha-aware editor before publishing; re-encoding a flattened browser recording cannot recover transparency. For guaranteed alpha, export lossless RGBA frames from a deterministic renderer and encode VP9 with yuva420p separately.

## Put the finished assets in the Vite portfolio

After reviewing the actual-logo clips, copy opaque MP4/WebM or verified alpha WebM into `sanjey-preview/client/public/`. Use a theme-selected `<video autoPlay muted loop playsInline>` plus the static original logo for reduced motion or failed playback. Host locally bundled files; no hosted iframe or runtime asset service is required. No portfolio logo has been replaced yet.

Validation: `corepack pnpm exec tsc --noEmit`. The root page and both presets were inspected in-browser; a Garou sample WebM recording successfully downloaded. MP4/alpha and seamless-loop visual validation are still pending.
