/**
 * Generates the HTML for a self-contained manifest preview.
 *
 * The generated file is placed next to a copy of renderer.iife.js
 * in a temp directory and opened directly in the system browser.
 */
const FAVICON_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">` +
  `<rect width="64" height="64" rx="12" fill="#060B17"/>` +
  `<path d="M17 46L24 18H30L23 46H17ZM34 46L41 18H47L40 46H34Z" fill="#E7ECF8"/>` +
  `<path d="M30 34H47" stroke="#3B82F6" stroke-width="4" stroke-linecap="round"/>` +
  `</svg>`;

const FAVICON_DATA_URI = `data:image/svg+xml;base64,${btoa(FAVICON_SVG)}`;

export function generatePreviewHtml(compiledManifest: unknown): string {
  const manifestJson = JSON.stringify(compiledManifest);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/svg+xml" href="${FAVICON_DATA_URI}" />
  <title>IKARY Preview</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body, #root { margin: 0; padding: 0; height: 100%; }
    body { font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>window.__IKARY_MANIFEST__ = ${manifestJson};</script>
  <script src="./renderer.iife.js"></script>
</body>
</html>
`;
}
