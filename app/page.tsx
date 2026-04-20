import { HeroHeadline } from "./hero-headline";
import { Slideshow } from "./slideshow";
import { HeroPrompt } from "./hero-prompt";
import { TickerStrip } from "./ticker-strip";
import { FeaturedBuild } from "./featured-build";

const protocols = [
  {
    name: "HyperSwap",
    type: "DEX",
    base: "Algebra V3",
    auditor: "MixBytes + Paladin",
    chain: "HyperEVM",
    stats: { tvl: "$2.4M", volume: "$892K/day", pools: "12" },
    description:
      "Concentrated liquidity DEX with ve(3,3) tokenomics and dynamic fees.",
  },
  {
    name: "LendHype",
    type: "Lending",
    base: "Aave V3",
    auditor: "OpenZeppelin",
    chain: "HyperEVM",
    stats: { tvl: "$5.1M", volume: "$340K/day", pools: "8" },
    description:
      "Isolated lending markets with risk-adjusted interest rates and flash loans.",
  },
  {
    name: "PerpHype",
    type: "Perpetuals",
    base: "GMX V2",
    auditor: "Trail of Bits",
    chain: "HyperEVM",
    stats: { tvl: "$1.8M", volume: "$1.2M/day", pools: "6" },
    description:
      "Perpetual futures exchange with up to 50x leverage and multi-asset collateral.",
  },
];

function BgGrid() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none opacity-[0.04]"
      style={{
        backgroundImage:
          "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }}
    />
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-8 h-[56px] flex items-center justify-between w-full">
          <div className="text-[14px] font-bold tracking-tight">
            ship<span className="text-accent">dev</span>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-text-secondary">
            <a
              href="#how-it-works"
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              Docs
            </a>
            <a
              href="#protocol-library"
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              Bases
            </a>
            <a
              href="https://scanner.shipdev.xyz"
              className="hover:text-text-primary transition-colors cursor-pointer"
              target="_blank"
              rel="noopener noreferrer"
            >
              Scanner ↗
            </a>
            <a
              href="https://launchdev.xyz"
              className="hover:text-text-primary transition-colors cursor-pointer"
              target="_blank"
              rel="noopener noreferrer"
            >
              LaunchDev ↗
            </a>
            <a
              href="/sign-in"
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="bg-accent text-black text-[12px] font-semibold rounded-[6px] px-4 py-[6px] hover:bg-accent-hover transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <TickerStrip />

      {/* Hero — split layout */}
      <section className="relative border-b border-border overflow-hidden">
        <BgGrid />
        {/* Radial cyan glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, #00d4ff10 0%, transparent 55%)",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 mb-6 text-[11px] uppercase tracking-wider text-accent font-mono">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Now live on HyperEVM · shipdev.xyz
            </div>

            <HeroHeadline />

            <p className="mt-6 text-[18px] text-text-secondary leading-relaxed max-w-[580px] mb-8">
              Describe what you want to build. We select audited bases, configure
              your parameters, generate your frontend, and deploy to testnet.
              Fork-first, not generate-first.
            </p>

            <HeroPrompt />

            {/* Trust row */}
            <div className="mt-10 grid grid-cols-4 gap-x-6 max-w-[580px] border-t border-border pt-6">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-mono">
                  Audited bases
                </div>
                <div className="font-mono text-[18px] text-text-primary">8+</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-mono">
                  Idea to testnet
                </div>
                <div className="font-mono text-[18px] text-text-primary">
                  &lt;1hr
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-mono">
                  Dev cost
                </div>
                <div className="font-mono text-[18px] text-text-primary">$0</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-mono">
                  Lines written
                </div>
                <div className="font-mono text-[18px] text-success">0</div>
              </div>
            </div>
          </div>

          <FeaturedBuild />
        </div>
      </section>

      {/* Slideshow — prompt to testnet */}
      <section className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-mono">
                See it in action
              </div>
              <h2 className="font-serif text-[32px] leading-tight">
                From prompt to testnet
              </h2>
            </div>
            <div className="text-[11px] font-mono text-text-muted hidden md:block">
              describe ▸ fork ▸ configure ▸ deploy
            </div>
          </div>
          <Slideshow />
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-border"
      >
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <div className="mb-10 max-w-[560px]">
            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-mono">
              How it works
            </div>
            <h2 className="font-serif text-[40px] leading-[1.05]">
              The fork-first approach.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[1100px]">
            {[
              {
                n: "01",
                title: "No AI-generated smart contracts",
                body: "Every protocol starts from battle-tested, professionally audited code. Uniswap V3, Aave V3, GMX V2, Compound — the same contracts securing billions in production. The AI never writes Solidity. It selects the right base and configures parameters within safe bounds.",
              },
              {
                n: "02",
                title: "Security scoring in real time",
                body: "Every parameter change is evaluated against a security model. Privileged roles, upgrade paths, fee bounds, oracle dependencies — visible at a glance. Owner is an EOA? You'll see a warning. Upgrade proxy without timelock? Flagged instantly.",
              },
              {
                n: "03",
                title: "Frontend generated, not templated",
                body: "The AI generates a custom React frontend matched to your protocol configuration. Not a generic swap UI bolted on — your token name, your branding, your specific features. Deployed to Vercel alongside the contracts.",
              },
              {
                n: "04",
                title: "Testnet first, always",
                body: "Everything deploys to HyperEVM testnet. Test your protocol with real transactions, share it with your community, iterate on parameters — before committing any real capital. When you're ready, mainnet deployment is one click away.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="bg-surface border border-border rounded-[10px] p-5 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-accent">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-text-primary mb-2">
                  {s.title}
                </h3>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built with ShipDev */}
      <section className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-mono">
                Built with ShipDev
              </div>
              <h2 className="font-serif text-[32px] leading-tight">
                Protocols shipping on HyperEVM
              </h2>
            </div>
            <div className="text-[11px] font-mono text-text-muted hidden md:block">
              {protocols.length} featured · continuously growing
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {protocols.map((p) => (
              <div
                key={p.name}
                className="bg-surface border border-border rounded-[10px] p-5 flex gap-6 items-start hover:border-accent/30 transition-colors"
              >
                <div className="shrink-0 w-[160px] bg-surface-elevated border border-border rounded-[8px] p-3 overflow-hidden">
                  {p.type === "DEX" && (
                    <div className="flex flex-col gap-2">
                      <div className="bg-bg border border-border rounded-[4px] px-2 py-[6px] flex items-center justify-between">
                        <span className="text-[9px] text-text-muted">From</span>
                        <span className="text-[9px] text-text-primary font-mono font-medium">
                          ETH
                        </span>
                      </div>
                      <div className="bg-bg border border-border rounded-[4px] px-2 py-[6px] flex items-center justify-between">
                        <span className="text-[9px] text-text-muted">To</span>
                        <span className="text-[9px] text-text-primary font-mono font-medium">
                          USDC
                        </span>
                      </div>
                      <div className="bg-accent rounded-[4px] py-[5px] text-center">
                        <span className="text-[9px] text-black font-semibold">
                          Swap
                        </span>
                      </div>
                    </div>
                  )}
                  {p.type === "Lending" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] text-text-muted uppercase tracking-[0.5px]">
                          Supply APY
                        </span>
                        <span className="text-[9px] text-success font-mono font-medium">
                          3.2%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] text-text-muted uppercase tracking-[0.5px]">
                          Borrow APY
                        </span>
                        <span className="text-[9px] text-warning font-mono font-medium">
                          5.8%
                        </span>
                      </div>
                      <div className="bg-bg border border-border rounded-[4px] px-2 py-[6px] flex items-center justify-between">
                        <span className="text-[9px] text-text-muted">Amount</span>
                        <span className="text-[9px] text-text-primary font-mono font-medium">
                          1,000
                        </span>
                      </div>
                      <div className="bg-accent rounded-[4px] py-[5px] text-center">
                        <span className="text-[9px] text-black font-semibold">
                          Supply
                        </span>
                      </div>
                    </div>
                  )}
                  {p.type === "Perpetuals" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] text-text-muted uppercase tracking-[0.5px]">
                          ETH/USD
                        </span>
                        <span className="text-[9px] text-text-primary font-mono font-medium">
                          $3,842
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {["10x", "25x", "50x"].map((lev) => (
                          <div
                            key={lev}
                            className={`flex-1 text-center rounded-[3px] py-[3px] text-[8px] font-mono font-medium ${
                              lev === "10x"
                                ? "bg-accent-subtle text-accent border border-accent/30"
                                : "bg-bg text-text-muted border border-border"
                            }`}
                          >
                            {lev}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex-1 bg-success rounded-[4px] py-[5px] text-center">
                          <span className="text-[9px] text-black font-semibold">
                            Long
                          </span>
                        </div>
                        <div className="flex-1 bg-error rounded-[4px] py-[5px] text-center">
                          <span className="text-[9px] text-black font-semibold">
                            Short
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[15px] text-text-primary font-semibold">
                      {p.name}
                    </span>
                    <span className="bg-surface-elevated border border-border rounded-[6px] px-2 py-[2px] text-[10px] text-text-muted uppercase tracking-[0.5px]">
                      {p.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-success">
                      <span className="w-[5px] h-[5px] rounded-full bg-success inline-block" />
                      {p.chain}
                    </span>
                  </div>
                  <div className="text-[13px] text-text-secondary leading-[1.6] mb-3">
                    {p.description}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <span className="text-text-muted">forked from</span>
                    <span className="text-accent">{p.base}</span>
                    <span className="text-text-muted mx-1">·</span>
                    <span className="text-text-muted">audited by</span>
                    <span className="text-success">{p.auditor}</span>
                  </div>
                </div>

                <div className="flex gap-6 shrink-0">
                  <div className="text-right">
                    <div className="font-mono text-[14px] font-bold text-text-primary">
                      {p.stats.tvl}
                    </div>
                    <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-mono">
                      TVL
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[14px] font-bold text-text-primary">
                      {p.stats.volume}
                    </div>
                    <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-mono">
                      Volume
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[14px] font-bold text-text-primary">
                      {p.stats.pools}
                    </div>
                    <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-mono">
                      Pools
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why fork-first */}
      <section className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <div className="mb-10 max-w-[560px]">
            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-mono">
              Why this matters
            </div>
            <h2 className="font-serif text-[40px] leading-[1.05]">
              Your users deserve <span className="italic">audited code.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px]">
            <div className="bg-surface border border-border rounded-[10px] p-5">
              <div className="text-[10px] uppercase tracking-wider text-error mb-3 font-mono">
                AI-generated contracts
              </div>
              <div className="flex flex-col gap-2.5 text-[13px] text-text-secondary">
                {[
                  "Novel code with unknown vulnerabilities",
                  "No audit trail, no security guarantees",
                  "Hallucinated Solidity patterns",
                  "Your TVL is the audit",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <span className="text-error mt-[2px]">✕</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-accent/20 rounded-[10px] p-5">
              <div className="text-[10px] uppercase tracking-wider text-accent mb-3 font-mono">
                ShipDev fork-first
              </div>
              <div className="flex flex-col gap-2.5 text-[13px] text-text-secondary">
                {[
                  "Battle-tested code securing $B+ in production",
                  "Audited by MixBytes, OpenZeppelin, Trail of Bits",
                  "Only parameters change, not logic",
                  "Real-time security scoring on every config change",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <span className="text-success mt-[2px]">✓</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The trio */}
      <section className="border-t border-border bg-surface-elevated/20">
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <div className="mb-10 max-w-[620px]">
            <div className="text-[10px] uppercase tracking-wider text-accent mb-2 font-mono">
              The 0-to-1 stack
            </div>
            <h2 className="font-serif text-[40px] leading-[1.05]">
              Three products. <span className="italic">One loop.</span>
            </h2>
            <p className="mt-4 text-[14px] text-text-secondary leading-relaxed">
              ShipDev ships your protocol. Scanner verifies it. LaunchDev raises
              capital for it. Each product stands alone. Together they collapse
              the 0-to-1 cycle from 6 months into 14 days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface border border-accent/30 rounded-[10px] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-wider text-accent font-mono">
                  01 · Build
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  you are here
                </span>
              </div>
              <h3 className="text-[18px] font-semibold mb-2">ShipDev</h3>
              <p className="text-[12px] text-text-secondary leading-relaxed mb-4">
                Describe a protocol. AI forks an audited base, configures
                parameters, generates the frontend, deploys to HyperEVM.
              </p>
              <div className="text-[11px] font-mono text-text-muted">
                shipdev.xyz
              </div>
            </div>

            <a
              href="https://scanner.shipdev.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-surface border border-border rounded-[10px] p-5 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-wider text-accent font-mono">
                  02 · Verify
                </div>
                <span className="text-[10px] font-mono text-text-muted group-hover:text-accent transition-colors">
                  ↗
                </span>
              </div>
              <h3 className="text-[18px] font-semibold mb-2">Scanner</h3>
              <p className="text-[12px] text-text-secondary leading-relaxed mb-4">
                Protocol threat intelligence. SEAL scoring, attack scenarios,
                signer analysis. Plus a wallet scanner for revoking risky
                approvals in one click.
              </p>
              <div className="text-[11px] font-mono text-text-muted">
                scanner.shipdev.xyz
              </div>
            </a>

            <a
              href="https://launchdev.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-surface border border-border rounded-[10px] p-5 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-wider text-accent font-mono">
                  03 · Raise
                </div>
                <span className="text-[10px] font-mono text-text-muted group-hover:text-accent transition-colors">
                  ↗
                </span>
              </div>
              <h3 className="text-[18px] font-semibold mb-2">LaunchDev</h3>
              <p className="text-[12px] text-text-secondary leading-relaxed mb-4">
                EVM-native raise primitive. Dutch-auction templates, transparent
                cap tables, agent participation via x402. MetaDAO, for EVM.
              </p>
              <div className="text-[11px] font-mono text-text-muted">
                launchdev.xyz
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Founder testimonial */}
      <section className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <div className="flex flex-col items-center text-center">
            <div className="text-[10px] uppercase tracking-wider text-accent mb-6 font-mono">
              From the founder
            </div>
            <blockquote className="font-serif italic text-[24px] text-text-secondary leading-[1.6] max-w-[700px] mb-5">
              &ldquo;Every protocol I&apos;ve shipped started the same way — three months finding devs, two months of audit theatre, and a launch window that closed before we were ready. ShipDev exists because that cycle is broken. Fork audited code, configure it to your vision, ship it before the market moves.&rdquo;
            </blockquote>
            <div className="text-[12px] text-text-muted font-mono">
              — Christian W., Founder
            </div>
          </div>
        </div>
      </section>

      {/* Audited bases */}
      <section id="protocol-library" className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-mono">
                Protocol library
              </div>
              <h2 className="font-serif text-[32px] leading-tight">
                Audited bases, ready to fork
              </h2>
            </div>
            <div className="text-[11px] font-mono text-text-muted hidden md:block">
              8 bases · expanding
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { name: "Algebra V3", type: "DEX", auditor: "MixBytes" },
              { name: "Uniswap V3", type: "DEX", auditor: "Trail of Bits" },
              { name: "Aave V3", type: "Lending", auditor: "OpenZeppelin" },
              { name: "Compound V3", type: "Lending", auditor: "OpenZeppelin" },
              { name: "GMX V2", type: "Perpetuals", auditor: "Trail of Bits" },
              { name: "Lido V2", type: "Staking", auditor: "MixBytes" },
              { name: "Curve V2", type: "StableSwap", auditor: "MixBytes" },
              { name: "Morpho Blue", type: "Lending", auditor: "Spearbit" },
            ].map((b) => (
              <div
                key={b.name}
                className="bg-surface border border-border rounded-[8px] px-4 py-3 flex items-center gap-3 hover:border-accent/30 transition-colors"
              >
                <div>
                  <div className="text-[13px] text-text-primary font-medium">
                    {b.name}
                  </div>
                  <div className="text-[10px] text-text-muted font-mono">
                    {b.type} · <span className="text-success">{b.auditor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-24 text-center">
          <h2 className="font-serif text-[48px] leading-[1.05] mb-4">
            Ready to <span className="italic text-accent">ship?</span>
          </h2>
          <p className="text-[15px] text-text-secondary mb-8 max-w-[460px] mx-auto">
            Describe your protocol. Deploy to testnet. No code, no developers,
            no trust issues.
          </p>
          <a
            href="/builder"
            className="inline-block bg-accent text-black rounded-[8px] px-8 py-3 text-[14px] font-semibold hover:bg-accent-hover transition-colors"
          >
            Start building →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-8 flex items-center justify-between text-[11px] text-text-muted font-mono">
          <span>ShipDev — Ship protocols, not pitches.</span>
          <span>
            Part of the trio: Scanner · LaunchDev ·{" "}
            <span className="text-accent">ShipDev</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
