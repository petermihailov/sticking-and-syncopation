export function filterPatterns(patterns: string[], targetPatterns: string[]): string[] {
  return patterns.filter(pattern => targetPatterns.includes(pattern))
}

export function isCapitalLetter(char: string): boolean {
  return char === char.toUpperCase()
}

export function appendPatternToResult(result: any[], pattern: string): void {
  for (const char of pattern) {
    result.push(char as any)
  }
}