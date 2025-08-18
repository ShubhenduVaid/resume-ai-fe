export function unwrapSingleFencedBlock(input: string): string {
  if (!input) return input;
  const trimmed = input.trim();
  const match = trimmed.match(/^```[a-zA-Z0-9+\-]*\n([\s\S]*)\n```$/);
  if (match) {
    return match[1].trim();
  }
  return input;
}
