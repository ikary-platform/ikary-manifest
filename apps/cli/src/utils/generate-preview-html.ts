/**
 * Generates the HTML for a self-contained manifest preview.
 *
 * The generated file is placed next to a copy of renderer.iife.js
 * in a temp directory and opened directly in the system browser.
 */
export function generatePreviewHtml(compiledManifest: unknown): string {
  const manifestJson = JSON.stringify(compiledManifest);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
