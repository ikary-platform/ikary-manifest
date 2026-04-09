export function delay(ms?: number): Promise<void> {
  return new Promise((r) =>
    setTimeout(r, ms ?? 80 + (crypto.getRandomValues(new Uint32Array(1))[0]! / 0x100000000) * 120),
  );
}
