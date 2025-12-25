// Shared numeric utility helpers
// Roman numeral conversion (lowercase) used for sub-question numbering
export function toRoman(num: number): string {
  if (num <= 0) return '';
  const map: [number, string][] = [
    [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'],
    [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'],
    [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']
  ];
  let n = num;
  let res = '';
  for (const [value, sym] of map) {
    while (n >= value) { res += sym; n -= value; }
    if (n === 0) break;
  }
  return res;
}
