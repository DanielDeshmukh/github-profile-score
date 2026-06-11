export function normalize(value: number, min: number, max: number, targetMax: number = 20): number {
  if (max === min) return targetMax;
  const clamped = Math.max(min, Math.min(max, value));
  const normalized = ((clamped - min) / (max - min)) * targetMax;
  return Math.round(Math.max(0, Math.min(targetMax, normalized)));
}
