
const NUMBER_PRECISION = 1e-5;
export function isNumberEqual(a: number, b: number) {
  return a - b <= NUMBER_PRECISION;
}
