const STATUS_WORDS = [
  'Bambazoling',
  'Schema-checking',
  'Layout-braiding',
  'Cell-weaving',
  'Patch-shaping',
  'Manifest-tuning',
  'Artifact-aligning',
] as const;

export function getStatusWord(index: number): string {
  return STATUS_WORDS[index % STATUS_WORDS.length];
}

export function getRandomStatusWord(): string {
  return STATUS_WORDS[Math.floor(Math.random() * STATUS_WORDS.length)];
}
