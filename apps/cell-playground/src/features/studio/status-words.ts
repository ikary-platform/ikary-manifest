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
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return STATUS_WORDS[arr[0]! % STATUS_WORDS.length];
}
