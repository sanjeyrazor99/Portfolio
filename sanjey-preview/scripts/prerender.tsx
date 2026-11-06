import React from "react";
import { renderToString } from "react-dom/server";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import App from "../client/src/App";

// Runs after Vite, not in the browser. All browser-only scene initialization is in effects.
const output = resolve("dist/public/index.html");
let html = await readFile(output, "utf8");
const body = renderToString(<App />);
if (
  !body.includes("SANJEY") ||
  !body.includes("NGAI") ||
  !body.includes("Handshake")
)
  throw new Error("Missing portfolio content in prerender.");
html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
await writeFile(output, html);
console.log(
  `Prerendered portfolio: ${body.length.toLocaleString()} characters of crawlable HTML.`
);
