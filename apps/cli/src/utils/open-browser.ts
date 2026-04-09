import { exec } from 'node:child_process';

/**
 * Opens a file path or URL in the system default browser.
 * Resolves when the open command exits (not when the browser loads the page).
 */
export function openBrowser(target: string): Promise<void> {
  const cmd =
    process.platform === 'darwin'
      ? `open "${target}"`
      : process.platform === 'win32'
        ? `start "" "${target}"`
        : `xdg-open "${target}"`;

  return new Promise((resolve) => {
    exec(cmd, (err) => {
      if (err) {
        // Non-fatal — the caller already printed the path
        console.error('[ikary] Could not open browser:', err.message);
      }
      resolve();
    });
  });
}
