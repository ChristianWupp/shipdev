"use client";

import type {
  ProtocolReport,
  ContractScanResult,
  AttackScenario,
  ImpactCategory,
  Severity,
  SealCompliance,
  SealCheck,
  CheckStatus,
} from "@/lib/scanner/types";
import { ScoreRing } from "./score-ring";

function formatTvl(tvl: number): string {
  if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`;
  if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(0)}M`;
  return `$${tvl.toLocaleString()}`;
}

const EXPLORER_URLS: Record<string, string> = {
  ethereum: "https://etherscan.io",
  arbitrum: "https://arbiscan.io",
  base: "https://basescan.org",
  optimism: "https://optimistic.etherscan.io",
};

function explorerLink(address: string, chain: string): string {
  const base = EXPLORER_URLS[chain] ?? EXPLORER_URLS.ethereum;
  return `${base}/address/${address}`;
}

function ExplorerLink({ address, chain, short }: { address: string; chain: string; short?: boolean }) {
  const display = short ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
  return (
    <a
      href={explorerLink(address, chain)}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-text-muted hover:text-accent transition-colors underline decoration-border hover:decoration-accent"
    >
      {display}
    </a>
  );
}

const severityColors: Record<Severity, { text: string; bg: string }> = {
  critical: { text: "var(--error)", bg: "rgba(248, 113, 113, 0.1)" },
  high: { text: "#fb923c", bg: "rgba(251, 146, 60, 0.1)" },
  medium: { text: "var(--warning)", bg: "rgba(251, 191, 36, 0.1)" },
  low: { text: "var(--text-secondary)", bg: "rgba(163, 163, 163, 0.1)" },
  info: { text: "var(--text-muted)", bg: "rgba(82, 82, 82, 0.1)" },
};

const riskLabels: Record<ContractScanResult["riskLevel"], { label: string; color: string }> = {
  immutable: { label: "Immutable", color: "var(--success)" },
  governed: { label: "Governed + Timelock", color: "var(--accent)" },
  "upgradeable-governed": { label: "Upgradeable (Multisig)", color: "var(--warning)" },
  "upgradeable-eoa": { label: "Upgradeable (EOA)", color: "var(--error)" },
  unknown: { label: "Unknown", color: "var(--text-muted)" },
};

const statusColors: Record<CheckStatus, { icon: string; color: string }> = {
  pass: { icon: "\u2713", color: "var(--success)" },
  fail: { icon: "\u2717", color: "var(--error)" },
  warn: { icon: "!", color: "var(--warning)" },
  unknown: { icon: "?", color: "var(--text-muted)" },
};

/* ── Contract Card ── */

function ContractCard({ scan, chain }: { scan: ContractScanResult; chain: string }) {
  const risk = riskLabels[scan.riskLevel];
  const adminInfo = scan.adminInfo;

  return (
    <div className="bg-surface border border-border rounded-[8px] p-4 hover:border-[#2a2a2a] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-text-primary font-medium">{scan.name}</span>
          {scan.isProxy && (
            <span className="text-[9px] uppercase tracking-[0.5px] font-semibold px-[6px] py-[2px] rounded-full bg-[#fbbf2415] text-warning">Proxy</span>
          )}
        </div>
        <span
          className="text-[9px] uppercase tracking-[0.5px] font-semibold px-[6px] py-[2px] rounded-full shrink-0"
          style={{ background: risk.color + "18", color: risk.color }}
        >{risk.label}</span>
      </div>

      <p className="text-[11px] text-text-muted leading-[1.5] mb-3">{scan.description}</p>

      <div className="flex items-center gap-3 text-[10px] mb-2 flex-wrap">
        <ExplorerLink address={scan.address} chain={chain} short />
        {scan.implementationAddress && (
          <span className="text-text-muted">impl: <ExplorerLink address={scan.implementationAddress} chain={chain} short /></span>
        )}
        {scan.adminAddress && (
          <span className="text-text-muted">
            admin: <ExplorerLink address={scan.adminAddress} chain={chain} short />
            {adminInfo?.type === "eoa" && <span className="text-error ml-1">(EOA)</span>}
            {adminInfo?.type === "safe" && (
              <span className="text-accent ml-1">({adminInfo.threshold}-of-{adminInfo.signerCount} Safe)</span>
            )}
          </span>
        )}
        {scan.timelockInfo?.detected && (
          <span className="text-accent">{scan.timelockInfo.formatted} timelock</span>
        )}
      </div>

      {/* Signers */}
      {adminInfo?.type === "safe" && adminInfo.signers.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[#1a1a1e]">
          <div className="text-[9px] uppercase tracking-[0.5px] text-text-muted font-semibold mb-1">
            Signers ({adminInfo.threshold} of {adminInfo.signerCount} required)
          </div>
          <div className="flex flex-wrap gap-1">
            {adminInfo.signers.map((signer) => (
              <a key={signer.address} href={explorerLink(signer.address, chain)} target="_blank" rel="noopener noreferrer"
                className="text-[10px] font-mono bg-surface-elevated border border-border rounded px-2 py-[2px] hover:border-accent/30 transition-colors">
                {signer.ensName ? (
                  <span className="text-accent">{signer.ensName}</span>
                ) : (
                  <span className="text-text-muted">{signer.address.slice(0, 6)}...{signer.address.slice(-4)}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Impact tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        {scan.impacts.filter((i) => i !== "none").map((impact) => {
          const isRisky = (impact === "user-funds" || impact === "treasury") && scan.riskLevel !== "immutable";
          return (
            <span key={impact} className={`text-[9px] px-[6px] py-[2px] rounded-full border ${isRisky ? "border-error/30 text-error bg-error/5" : "border-border text-text-muted"}`}>
              {impact.replace("-", " ")}
            </span>
          );
        })}
        {scan.holdsUserFunds && (
          <span className="text-[9px] px-[6px] py-[2px] rounded-full border border-error/30 text-error bg-error/5 font-semibold">Holds User Funds</span>
        )}
        {scan.hasPauseability && (
          <span className="text-[9px] px-[6px] py-[2px] rounded-full border border-warning/30 text-warning bg-warning/5">Pausable</span>
        )}
      </div>
    </div>
  );
}

/* ── Attack Scenario Card ── */

function AttackScenarioCard({ scenario }: { scenario: AttackScenario }) {
  const sev = severityColors[scenario.severity];

  return (
    <div className="border rounded-[8px] p-4" style={{ borderColor: sev.text + "30", background: sev.bg }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-[1px]"
          style={{ background: sev.text + "20", color: sev.text }}>!</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[13px] text-text-primary font-medium">{scenario.title}</span>
            <span className="text-[9px] uppercase tracking-[0.5px] font-semibold px-[6px] py-[2px] rounded-full"
              style={{ background: sev.text + "20", color: sev.text }}>{scenario.severity}</span>
            {scenario.hasTimelock && (
              <span className="text-[9px] uppercase tracking-[0.5px] font-semibold px-[6px] py-[2px] rounded-full bg-accent/10 text-accent">
                {scenario.timelockDuration ?? "Timelocked"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="ml-9 space-y-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.5px] text-text-muted font-semibold mb-1">Attack Vector</div>
          <p className="text-[12px] text-text-secondary leading-[1.5]">{scenario.vector}</p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.5px] font-semibold mb-1" style={{ color: sev.text }}>Impact on users</div>
          <p className="text-[12px] text-text-primary leading-[1.5] font-medium">{scenario.userImpact}</p>
        </div>
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="text-[10px] text-text-muted">Affects:</span>
          {scenario.affectedContracts.map((name) => (
            <span key={name} className="text-[10px] font-mono text-text-secondary bg-surface-elevated px-2 py-[2px] rounded">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── SEAL Compliance ── */

function SealComplianceSection({ compliance }: { compliance: SealCompliance }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-[10px] uppercase tracking-[2px] text-accent font-semibold">SEAL Compliance</div>
        <span className="text-[10px] text-text-muted">Security Alliance framework assessment</span>
        <span className={`text-[11px] font-bold ml-auto ${compliance.score >= 70 ? "text-success" : compliance.score >= 40 ? "text-warning" : "text-error"}`}>
          {compliance.score}/100
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {compliance.checks.map((check) => {
          const cfg = statusColors[check.status];
          return (
            <div key={check.id} className="bg-surface border border-border rounded-[6px] px-3 py-2 flex items-start gap-2">
              <span className="text-[11px] font-bold mt-[1px]" style={{ color: cfg.color }}>{cfg.icon}</span>
              <div>
                <span className="text-[12px] text-text-primary font-medium">{check.label}</span>
                <p className="text-[10px] text-text-muted leading-[1.4] mt-[2px]">{check.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Contract Relationship Diagram ── */

function ContractDiagram({ contracts }: { contracts: ContractScanResult[] }) {
  const proxies = contracts.filter((c) => c.isProxy);
  const immutables = contracts.filter((c) => c.riskLevel === "immutable");
  const governed = contracts.filter((c) => c.riskLevel === "governed" || c.riskLevel === "upgradeable-governed");

  if (contracts.length === 0) return null;

  // Collect unique admins
  const admins = new Map<string, { contracts: string[]; info: ContractScanResult["adminInfo"]; timelock: ContractScanResult["timelockInfo"] }>();
  for (const c of contracts) {
    if (c.adminAddress) {
      if (!admins.has(c.adminAddress)) {
        admins.set(c.adminAddress, { contracts: [], info: c.adminInfo, timelock: c.timelockInfo });
      }
      admins.get(c.adminAddress)!.contracts.push(c.name);
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-[10px] uppercase tracking-[2px] text-accent font-semibold">Control Flow</div>
        <span className="text-[10px] text-text-muted">Who controls what</span>
      </div>

      <div className="bg-surface border border-border rounded-[10px] p-5 space-y-4">
        {Array.from(admins.entries()).map(([adminAddr, data]) => (
          <div key={adminAddr} className="flex items-start gap-3">
            {/* Admin */}
            <div className="shrink-0 w-[200px]">
              <div className={`border rounded-[6px] px-3 py-2 text-[11px] ${
                data.info?.type === "safe"
                  ? "border-accent/30 bg-accent/5"
                  : data.info?.type === "eoa"
                    ? "border-error/30 bg-error/5"
                    : "border-border"
              }`}>
                <div className="font-medium text-text-primary">
                  {data.info?.type === "safe" ? `${data.info.threshold}-of-${data.info.signerCount} Safe` :
                   data.info?.type === "eoa" ? "EOA (Single Key)" : "Contract"}
                </div>
                <div className="font-mono text-text-muted text-[9px] mt-[2px]">{adminAddr.slice(0, 10)}...</div>
                {data.info?.type === "safe" && data.info.signers.length > 0 && (
                  <div className="mt-1 text-[9px] text-text-muted">
                    {data.info.signers.slice(0, 3).map((s) => s.ensName || `${s.address.slice(0, 6)}...`).join(", ")}
                    {data.info.signers.length > 3 && ` +${data.info.signers.length - 3}`}
                  </div>
                )}
              </div>
            </div>

            {/* Arrow with timelock */}
            <div className="flex flex-col items-center justify-center shrink-0 pt-2">
              <div className="text-text-muted text-[10px]">
                {data.timelock?.detected ? (
                  <span className="text-accent">{data.timelock.formatted} &rarr;</span>
                ) : (
                  <span className="text-error">instant &rarr;</span>
                )}
              </div>
            </div>

            {/* Controlled contracts */}
            <div className="flex flex-wrap gap-1 pt-1">
              {data.contracts.map((name) => {
                const scan = contracts.find((c) => c.name === name);
                const holdsUserFunds = scan?.holdsUserFunds;
                return (
                  <span key={name} className={`text-[10px] px-2 py-[3px] rounded border ${
                    holdsUserFunds ? "border-error/30 bg-error/5 text-error font-semibold" : "border-border text-text-secondary"
                  }`}>
                    {name}
                    {scan?.isProxy && " (proxy)"}
                  </span>
                );
              })}
            </div>
          </div>
        ))}

        {/* Immutable contracts */}
        {immutables.length > 0 && (
          <div className="flex items-start gap-3 pt-2 border-t border-border">
            <div className="shrink-0 w-[200px]">
              <div className="border border-success/30 bg-success/5 rounded-[6px] px-3 py-2 text-[11px]">
                <div className="font-medium text-success">No Admin</div>
                <div className="text-text-muted text-[9px] mt-[2px]">Immutable — cannot be changed</div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center shrink-0 pt-2">
              <span className="text-success text-[10px]">locked &rarr;</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {immutables.map((c) => (
                <span key={c.address} className="text-[10px] px-2 py-[3px] rounded border border-success/20 text-success">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Report ── */

export function ScannerReport({ report }: { report: ProtocolReport }) {
  const { summary, contracts, attackScenarios, protocol, sealCompliance, liveTvl } = report;

  return (
    <div className="animate-fade-in">
      {/* Header with score */}
      <div className="flex items-start gap-8 mb-8">
        <ScoreRing score={report.overallRiskScore} />
        <div className="flex-1 pt-2">
          <div className="text-[10px] uppercase tracking-[2px] text-accent font-semibold mb-1">
            Protocol Risk Assessment
          </div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[18px] text-text-primary font-semibold">{protocol.name}</span>
            {liveTvl && (
              <span className="font-mono text-[14px] text-accent font-bold">{formatTvl(liveTvl)} TVL</span>
            )}
          </div>
          <p className="text-[12px] text-text-muted mb-3 max-w-[480px] leading-[1.5]">{protocol.description}</p>

          <div className="flex gap-5 text-[11px]">
            <div><span className="text-text-muted">Contracts: </span><span className="text-text-primary font-medium">{summary.totalContracts}</span></div>
            <div><span className="text-success font-medium">{summary.immutableContracts} immutable</span></div>
            <div><span className="text-warning font-medium">{summary.upgradeableContracts} upgradeable</span></div>
            <div><span className="text-text-muted">Admins: </span><span className="text-text-primary font-medium">{summary.uniqueAdmins}</span></div>
            {summary.maxTimelockDelay && (
              <div><span className="text-accent font-medium">{summary.maxTimelockDelay} timelock</span></div>
            )}
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {liveTvl && summary.userFundsAtRisk && (
              <span className="text-[10px] px-2 py-[3px] rounded-full bg-error/10 text-error border border-error/20 font-semibold">
                {formatTvl(liveTvl)} in upgradeable contracts
              </span>
            )}
            {!liveTvl && summary.userFundsAtRisk && (
              <span className="text-[10px] px-2 py-[3px] rounded-full bg-error/10 text-error border border-error/20 font-semibold">
                User funds in upgradeable contracts
              </span>
            )}
            {summary.treasuryAtRisk && (
              <span className="text-[10px] px-2 py-[3px] rounded-full bg-warning/10 text-warning border border-warning/20 font-semibold">
                Treasury at risk
              </span>
            )}
            {summary.hasTimelock && (
              <span className="text-[10px] px-2 py-[3px] rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold">
                Governance timelock detected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control flow diagram */}
      <ContractDiagram contracts={contracts} />

      {/* Proxy explainer — only if there are upgradeable contracts */}
      {summary.upgradeableContracts > 0 && (
        <div className="bg-surface border border-border rounded-[10px] p-5 mb-8">
          <div className="text-[10px] uppercase tracking-[1px] text-accent font-semibold mb-2">
            Why upgradeable proxies exist
          </div>
          <p className="text-[12px] text-text-secondary leading-[1.6] mb-3">
            Upgradeable proxies let protocols fix bugs and add features after deployment.
            Your funds sit in the <span className="text-text-primary font-medium">proxy contract</span> (the address you deposit to),
            but the actual logic runs from a separate <span className="text-text-primary font-medium">implementation contract</span>.
            An admin can swap the implementation — which means they can change what the code does with your money.
          </p>
          <p className="text-[12px] text-text-secondary leading-[1.6] mb-3">
            The security question is: <span className="text-text-primary font-medium">who is the admin, and what does it take for them to swap the implementation?</span>
          </p>
          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div className="border border-error/20 bg-error/5 rounded-[6px] p-3">
              <div className="text-error font-semibold mb-1">Worst: EOA admin</div>
              <div className="text-text-muted">One private key controls everything. Leak = instant drain. No vote, no delay.</div>
            </div>
            <div className="border border-warning/20 bg-warning/5 rounded-[6px] p-3">
              <div className="text-warning font-semibold mb-1">Better: Multisig</div>
              <div className="text-text-muted">Multiple signers must approve. Need to compromise N signers simultaneously.</div>
            </div>
            <div className="border border-accent/20 bg-accent/5 rounded-[6px] p-3">
              <div className="text-accent font-semibold mb-1">Best: Governance + timelock</div>
              <div className="text-text-muted">Community votes, then a delay before execution. Everyone can see what&apos;s coming.</div>
            </div>
          </div>
        </div>
      )}

      {/* Attack scenarios */}
      {attackScenarios.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-[10px] uppercase tracking-[2px] text-error font-semibold">Attack Scenarios</div>
            <span className="text-[10px] text-text-muted">What happens if keys are compromised</span>
          </div>
          <div className="space-y-3">
            {attackScenarios.map((scenario) => (
              <AttackScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </div>
      )}

      {/* SEAL Compliance */}
      <SealComplianceSection compliance={sealCompliance} />

      {/* Contract breakdown */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-[10px] uppercase tracking-[2px] text-accent font-semibold">Contract Map</div>
          <span className="text-[10px] text-text-muted">Every contract, who controls it, what it touches</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {contracts.map((scan) => (
            <ContractCard key={scan.address} scan={scan} chain={protocol.chain} />
          ))}
        </div>
      </div>

      {/* Bottom line */}
      <div className="bg-surface border border-border rounded-[10px] p-5 mb-6">
        <div className="text-[10px] uppercase tracking-[1px] text-text-muted font-semibold mb-2">Bottom Line</div>
        <p className="text-[13px] text-text-secondary leading-[1.6]">
          {summary.immutableContracts === summary.totalContracts ? (
            <>All {summary.totalContracts} contracts are immutable. No admin keys can change contract behavior. This is the safest architecture.</>
          ) : summary.userFundsAtRisk ? (
            <>
              <span className="text-error font-medium">
                User funds{liveTvl ? ` (${formatTvl(liveTvl)})` : ""} sit in upgradeable contracts.
              </span>{" "}
              If {summary.uniqueAdmins === 1 ? "the admin key is" : `any of the ${summary.uniqueAdmins} admin keys are`}{" "}
              compromised, an attacker could upgrade contract logic and drain deposits.
              {summary.hasTimelock
                ? ` A ${summary.maxTimelockDelay} governance timelock provides a window to detect and respond.`
                : " No timelock detected — upgrades can happen instantly."}
              {" "}This is the #1 attack vector for state-sponsored hackers (Lazarus Group).
              {" "}SEAL compliance: {sealCompliance.score}/100.
            </>
          ) : (
            <>
              User funds are in immutable contracts, but {summary.upgradeableContracts} contract{summary.upgradeableContracts > 1 ? "s are" : " is"}{" "}
              upgradeable. Admin key compromise could affect protocol operations
              {summary.treasuryAtRisk ? " and treasury" : ""}, but deposited user funds are not directly at risk.
              {" "}SEAL compliance: {sealCompliance.score}/100.
            </>
          )}
        </p>
      </div>

      {/* Methodology & how to verify */}
      <div className="bg-surface border border-border rounded-[10px] p-5 mb-6">
        <div className="text-[10px] uppercase tracking-[1px] text-accent font-semibold mb-3">
          How This Works — Verify It Yourself
        </div>

        <div className="space-y-3 text-[11px] text-text-secondary leading-[1.6]">
          <div>
            <span className="text-text-primary font-medium">What we check on-chain:</span> For each contract, we read the bytecode via RPC, check{" "}
            <a href="https://eips.ethereum.org/EIPS/eip-1967" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">EIP-1967</a>{" "}
            storage slots for proxy/admin detection, call <span className="font-mono text-accent">getOwners()</span> and{" "}
            <span className="font-mono text-accent">getThreshold()</span> on admin contracts (Gnosis Safe), and{" "}
            <span className="font-mono text-accent">getMinDelay()</span> for timelocks. ENS names via reverse lookup. TVL from{" "}
            <a href="https://defillama.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">DeFiLlama API</a>.
          </div>

          <div>
            <span className="text-text-primary font-medium">How to verify proxy status yourself:</span> Go to any contract on{" "}
            <a href={EXPLORER_URLS[protocol.chain]} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              {protocol.chain === "ethereum" ? "Etherscan" : protocol.chain}
            </a>
            {" "}&rarr; click &quot;More Options&quot; &rarr; &quot;Is this a proxy?&quot; &rarr; Etherscan will show you the implementation address. Or read storage slot{" "}
            <span className="font-mono text-[10px] text-text-muted">0x3608...2bbc</span> directly.
          </div>

          <div>
            <span className="text-text-primary font-medium">How to verify Safe signers:</span> Go to the admin address on Etherscan &rarr; &quot;Read Contract&quot; &rarr;{" "}
            call <span className="font-mono text-accent">getOwners()</span> and <span className="font-mono text-accent">getThreshold()</span>.
            Or check <a href="https://app.safe.global" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">app.safe.global</a> directly.
          </div>

          <div className="border-t border-border pt-3">
            <span className="text-warning font-medium">What we DON&apos;T check:</span> This scanner only analyzes the contracts listed above.
            Most protocols have additional contracts (auxiliary modules, collateral adapters, oracles, periphery).
            We don&apos;t verify source code, audit reports, or off-chain infrastructure (frontends, APIs, DNS).
            Always cross-reference with the protocol&apos;s own documentation and audit reports.
          </div>

          <div>
            <span className="text-warning font-medium">Contract selection is not exhaustive:</span> We scan {summary.totalContracts} key contracts
            for {protocol.name}. The full protocol may have dozens more. Use the &quot;Custom scan&quot; option above to add any contract address you want to check.
          </div>
        </div>
      </div>

      <div className="text-[10px] text-text-muted text-right">
        Scanned {new Date(report.timestamp).toLocaleString()} | {protocol.chain}
        {liveTvl && " | TVL via DeFiLlama"} | All data from on-chain reads — verify on{" "}
        <a href={EXPLORER_URLS[protocol.chain]} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          {protocol.chain === "ethereum" ? "Etherscan" : protocol.chain}
        </a>
      </div>
    </div>
  );
}
