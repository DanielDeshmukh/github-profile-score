export function validateCallout(callout: string): boolean {
  if (!callout || callout.trim().length === 0) return false;
  if (callout.length > 200) return false;
  if (/[<>{}]/.test(callout)) return false;
  return true;
}
