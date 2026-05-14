function fnv1a32(input: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function pickVariant<T extends string>(args: {
  experimentKey: string;
  subjectId: string;
  variants: readonly T[];
}) {
  const { experimentKey, subjectId, variants } = args;
  const idx = fnv1a32(`${experimentKey}:${subjectId}`) % variants.length;
  return variants[idx];
}

