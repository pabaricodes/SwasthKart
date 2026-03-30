export function assertSameCurrency(a: string, b: string) {
  if (a !== b) throw new Error(`Currency mismatch: ${a} vs ${b}`);
}
