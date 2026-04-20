const TICKER_ITEMS = [
  { protocol: "HyperSwap", base: "Algebra V3", type: "DEX", chain: "HyperEVM", tvl: "$2.4M" },
  { protocol: "LendHype", base: "Aave V3", type: "Lending", chain: "HyperEVM", tvl: "$5.1M" },
  { protocol: "PerpHype", base: "GMX V2", type: "Perps", chain: "HyperEVM", tvl: "$1.8M" },
  { protocol: "StableVault", base: "Curve V2", type: "StableSwap", chain: "HyperEVM", tvl: "$890K" },
  { protocol: "BorrowDAO", base: "Morpho Blue", type: "Lending", chain: "HyperEVM", tvl: "$1.2M" },
  { protocol: "LiquidStake", base: "Lido V2", type: "Staking", chain: "HyperEVM", tvl: "$4.3M" },
  { protocol: "PredexonX", base: "Predexon", type: "Prediction", chain: "HyperEVM", tvl: "$340K" },
];

export function TickerStrip() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="border-b border-border bg-bg overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 px-4 py-2 border-r border-border bg-surface">
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
            ◉ SHIPPED VIA SHIPDEV
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden h-[32px]">
          <div className="ticker-track flex items-center h-full gap-10 whitespace-nowrap absolute">
            {items.map((a, i) => (
              <div
                key={`${a.protocol}-${i}`}
                className="flex items-center gap-3 text-[11px] font-mono"
              >
                <span className="inline-block w-1 h-1 rounded-full bg-success" />
                <span className="text-text-secondary uppercase tracking-wider">
                  {a.protocol}
                </span>
                <span className="text-text-muted">{a.type}</span>
                <span className="text-accent">fork: {a.base}</span>
                <span className="text-text-muted">{a.chain}</span>
                <span className="text-text-muted">{a.tvl}</span>
                <span className="text-text-muted/50">·</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ticker-track {
          animation: ticker-scroll 55s linear infinite;
          will-change: transform;
          padding-left: 1.5rem;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
