import { formatFiatEquivalent } from "../formatters/formatFiatEquivalent";
import { usePrice } from "../hooks/usePrice";

type BalanceSummaryProps = {
  balanceSat: number | null;
  hasBalanceFetchFailed: boolean;
};

export function BalanceSummary({ balanceSat, hasBalanceFetchFailed }: BalanceSummaryProps) {
  const { bitcoinPrice } = usePrice();

  if (hasBalanceFetchFailed) return <span className="text-red-400">Backend offline</span>;
  if (balanceSat === null) return "Loading...";

  return (
    <div className="flex flex-col items-center gap-1">
      <div>
        <span className="text-white text-2xl font-semibold">{balanceSat.toLocaleString("en-US")}</span>
        <span className="text-green-600 ml-1">sat</span>
      </div>
      {bitcoinPrice && (
        <span className="text-neutral-400 text-xs">{formatFiatEquivalent(balanceSat, bitcoinPrice)}</span>
      )}
    </div>
  );
}
