export function FeaturedBuild() {
  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-surface-elevated/40">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-success">
            JUST SHIPPED · 4 MIN AGO
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted">
          by @velvetfinance
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
              HyperEVM · Perpetuals
            </div>
            <div className="font-serif text-[28px] leading-tight mb-1">
              Velvet Perps
            </div>
            <div className="text-[11px] font-mono text-text-muted">
              $VLV · forked from GMX V2
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-text-muted">
              SEAL
            </div>
            <div className="text-[28px] font-mono text-success leading-none mt-0.5">
              91<span className="text-[14px] text-text-muted">/100</span>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-text-secondary leading-relaxed mb-5">
          Cross-margin perps with 20x leverage, HyperCore Spot routing, and multi-asset
          collateral. Multisig admin with 48h timelock. Deployed to HyperEVM testnet.
        </p>

        {/* Build steps */}
        <div className="space-y-2 mb-5 font-mono text-[11px]">
          {[
            { step: "describe", detail: "a perps DEX for HyperEVM", done: true },
            { step: "fork", detail: "GMX V2 base · audited by Trail of Bits", done: true },
            { step: "configure", detail: "20x leverage · HyperCore routing", done: true },
            { step: "verify", detail: "Scanner SEAL 91/100", done: true },
            { step: "deploy", detail: "0x74A5…7B8C · testnet", done: true },
            { step: "raise", detail: "on LaunchDev →", done: false },
          ].map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3"
            >
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${s.done ? "bg-accent" : "bg-text-muted"}`}
              />
              <span
                className={`uppercase tracking-wider ${s.done ? "text-text-primary" : "text-text-muted"} w-[72px]`}
              >
                {s.step}
              </span>
              <span
                className={s.done ? "text-text-secondary" : "text-text-muted"}
              >
                {s.detail}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border grid grid-cols-3 gap-3 text-[11px]">
          <div>
            <div className="text-text-muted uppercase tracking-wider mb-1 font-mono">
              Time to testnet
            </div>
            <div className="font-mono text-text-primary">
              17 min
            </div>
          </div>
          <div>
            <div className="text-text-muted uppercase tracking-wider mb-1 font-mono">
              Lines written
            </div>
            <div className="font-mono text-text-primary">0</div>
          </div>
          <div>
            <div className="text-text-muted uppercase tracking-wider mb-1 font-mono">
              Contracts
            </div>
            <div className="font-mono text-text-primary">6 · 1 imm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
