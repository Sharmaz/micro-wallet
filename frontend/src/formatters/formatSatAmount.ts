const MAXIMUM_SAT_FRACTION_DIGITS = 3;

export function formatSatAmount(amountSat: number) {
  return `${amountSat.toLocaleString("en-US", { maximumFractionDigits: MAXIMUM_SAT_FRACTION_DIGITS })} sat`;
}
