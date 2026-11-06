# Current portfolio projects

The current portfolio lives in **sanjey-preview/** (React 19, Vite 7, TypeScript, pnpm). See its README for build and architecture notes.

```powershell
cd sanjey-preview
corepack pnpm install --frozen-lockfile
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4199 --strictPort
```

Validation: `npm run check`, `npm run build`, `npm test`.

The standalone **liquid-logo-lab/** is a customized local clone of Paper Design's MIT-licensed Liquid Logo app. Its upstream license remains included. It has theme presets, local image loading, JSON settings export, and browser recording controls. See `liquid-logo-lab/LOCAL-LAB.md`. The original sample monogram is a placeholder pending the owner's transparent PNG; no final logo export has been integrated into the portfolio.

```powershell
cd liquid-logo-lab
corepack pnpm install
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 4200
```

No environment files, dependencies, recordings, or generated builds are committed. This push does not deploy either app.
