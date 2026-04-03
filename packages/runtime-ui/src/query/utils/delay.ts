export function delay(ms?: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms ?? 80 + Math.random() * 120));
}
