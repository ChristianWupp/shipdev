"use client";

import type {
  ProtocolReport,
  ContractScanResult,
  AttackScenario,
  ImpactCategory,
  Severity,
} from "@/lib/scanner/types";
import { ScoreRing } from "./score-ring";

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

const impactLabels: Record<ImpactCategory, { label: string; icon: string }> = {
  "user-funds": { label: "User Funds", icon: "\u26A0" },
  treasury: { label: "Treasury", icon: "\u{1F4B0}" },
  "token-logic": { label: "Token Logic", icon: "\u26D4" },
  "protocol-halt": { label: "Protocol Halt", icon: "\u23F8" },
  "fee-extraction": { label: "Fee Extraction", icon: "\u{1F4B8}" },
  governance: { label: "Governance", icon: "\u{1F3DB}" },
  oracle: { label: "Oracle", icon: "\u{1F52E}" },
  none: { label: "None", icon: "\u2713" },
};

function ContractCard({ scan }: { scan: ContractScanResult }) {
  const risk = riskLabels[scan.riskLevel];

  return (
    <div className="bg-surface border border-border rounded-[8px] p-4 hover:border-[#2a2a2a] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-text-primary font-medium">{scan.name}</span>
          {scan.isProxy && (
            <span className="text-[9px] uppercase tracking-[0.5px] font-semibold px-[6px] py-[2px] rounded-full bg-[#fbbf2415] text-warning">
              Proxy
            </span>
          )}
        </div>
        <span
          className="text-[9px] uppercase tracking-[0.5px] font-semibold px-[6px] py-[2px] rounded-full shrink-0"
          style={{ background: risk.color + "18", color: risk.color }}
        >
          {risk.label}
        </span>
      </div>

      <p className="text-[11px] text-text-muted leading-[1.5] mb-3">
        {scan.description}
      </p>

      <div className="flex items-center gap-3 text-[10px] mb-2">
        <span className="font-mono text-text-muted">
          {scan.address.slice(0, 6)}...{scan.address.slice(-4)}
        </span>
        {scan.implementationAddress && (
          <span className="text-text-muted">
            impl: <span className="font-mono text-text-secondary">{scan.implementationAddress.slice(0, 8)}...</span>
          </span>
        )}
        {scan.adminAddress && (
          <span className="text-text-muted">
            admin: <span className="font-mono text-text-secondary">{scan.adminAddress.slice(0, 8)}...</span>
            {!scan.adminIsContract && <span className="text-error ml-1">(EOA)</span>}
          </span>
        )}
      </div>

      {/* Impact tags */}
      <div className="flex flex-wrap gap-1">
        {scan.impacts.map((impact) => {
          const info = impactLabels[impact];
          const isRisky = impact === "user-funds" || impact === "treasury";
          return (
            <span
              key={impact}
              className={`text-[9px] px-[6px] py-[2px] rounded-full border ${
                isRisky && scan.riskLevel !== "immutable"
                  ? "border-error/30 text-error bg-error/5"
                  : "border-border text-text-muted"
              }`}
            >
              {info.label}
            </span>
          );
        })}
        {scan.holdsUserFunds && (
          <span className="text-[9px] px-[6px] py-[2px] rounded-full border border-error/30 text-error bg-error/5 font-semibold">
            Holds User Funds
          </span>
        )}
        {scan.hasPauseability && (
          <span className="text-[9px] px-[6px] py-[2px] rounded-full border border-warning/30 text-warning bg-warning/5">
            Pausable
          </span>
        )}
      </div>
    </div>
  );
}

function AttackScenarioCard({ scenario }: { scenario: AttackScenario }) {
  const sev = severityColors[scenario.severity];

  return (
    <div
      className="border rounded-[8px] p-4"
      style={{ borderColor: sev.text + "30", background: sev.bg }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-[1px]"
          style={{ background: sev.text + "20", color: sev.text }}
        >
          {scenario.severity === "critical" ? "!" : scenario.severity === "high" ? "!" : "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] text-text-primary font-medium">
              {scenario.title}
            </span>
            <span
              className="text-[9px] uppercase tracking-[0.5px] font-semibold px-[6px] py-[2px] rounded-full"
              style={{ background: sev.text + "20", color: sev.text }}
            >
              {scenario.severity}
            </span>
            {scenario.hasTimelock && (
              <span className="text-[9px] uppercase tracking-[0.5px] font-semibold px-[6px] py-[2px] rounded-full bg-accent/10 text-accent">
                Timelocked
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="ml-9 space-y-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.5px] text-text-muted font-semibold mb-1">
            Attack Vector
          </div>
          <p className="text-[12px] text-text-secondary leading-[1.5]">{scenario.vector}</p>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.5px] text-text-muted font-semibold mb-1">
            What the attacker can do
          </div>
          <p className="text-[12px] text-text-secondary leading-[1.5]">{scenario.capability}</p>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.5px] font-semibold mb-1" style={{ color: sev.text }}>
            Impact on users
          </div>
          <p className="text-[12px] text-text-primary leading-[1.5] font-medium">{scenario.userImpact}</p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-text-muted">Affects:</span>
          {scenario.affectedContracts.map((name) => (
            <span key={name} className="text-[10px] font-mono text-text-secondary bg-surface-elevated px-2 py-[2px] rounded">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScannerReport({ report }: { report: ProtocolReport }) {
  const { summary, contracts, attackScenarios, protocol } = report;

  const criticalScenarios = attackScenarios.filter((s) => s.severity === "critical");
  const highScenarios = attackScenarios.filter((s) => s.severity === "high");

  return (
    <div className="animate-fade-in">
      {/* Header with score */}
      <div className="flex items-start gap-8 mb-8">
        <ScoreRing score={report.overallRiskScore} />
        <div className="flex-1 pt-2">
          <div className="text-[10px] uppercase tracking-[2px] text-accent font-semibold mb-1">
            Protocol Risk Assessment
          </div>
          <div className="text-[18px] text-text-primary font-semibold mb-1">
            {protocol.name}
          </div>
          <p className="text-[12px] text-text-muted mb-3 max-w-[480px] leading-[1.5]">
            {protocol.description}
          </p>

          {/* Quick stats */}
          <div className="flex gap-5 text-[11px]">
            <div>
              <span className="text-text-muted">Contracts: </span>
              <span className="text-text-primary font-medium">{summary.totalContracts}</span>
            </div>
            <div>
              <span className="text-success font-medium">{summary.immutableContracts} immutable</span>
            </div>
            <div>
              <span className="text-warning font-medium">{summary.upgradeableContracts} upgradeable</span>
            </div>
            <div>
              <span className="text-text-muted">Admins: </span>
              <span className="text-text-primary font-medium">{summary.uniqueAdmins}</span>
            </div>
          </div>

          {/* Risk flags */}
          <div className="flex gap-2 mt-3">
            {summary.userFundsAtRisk && (
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

      {/* Attack scenarios — the main event */}
      {attackScenarios.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-[10px] uppercase tracking-[2px] text-error font-semibold">
              Attack Scenarios
            </div>
            <span className="text-[10px] text-text-muted">
              What happens if keys are compromised
            </span>
          </div>

          {criticalScenarios.length > 0 && (
            <div className="mb-2 text-[11px] text-error font-semibold">
              {criticalScenarios.length} critical scenario{criticalScenarios.length > 1 ? "s" : ""} — user funds at direct risk
            </div>
          )}

          <div className="space-y-3">
            {attackScenarios.map((scenario) => (
              <AttackScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </div>
      )}

      {/* Contract breakdown */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-[10px] uppercase tracking-[2px] text-accent font-semibold">
            Contract Map
          </div>
          <span className="text-[10px] text-text-muted">
            Every contract, who controls it, what it touches
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {contracts.map((scan) => (
            <ContractCard key={scan.address} scan={scan} />
          ))}
        </div>
      </div>

      {/* Bottom line */}
      <div className="bg-surface border border-border rounded-[10px] p-5 mb-6">
        <div className="text-[10px] uppercase tracking-[1px] text-text-muted font-semibold mb-2">
          Bottom Line
        </div>
        <p className="text-[13px] text-text-secondary leading-[1.6]">
          {summary.immutableContracts === summary.totalContracts ? (
            <>
              All {summary.totalContracts} contracts are immutable. No admin keys can change contract behavior.
              This is the safest possible architecture — no private key leak can affect user funds.
            </>
          ) : summary.userFundsAtRisk ? (
            <>
              <span className="text-error font-medium">User funds sit in upgradeable contracts.</span>{" "}
              If {summary.uniqueAdmins === 1 ? "the admin key is" : `any of the ${summary.uniqueAdmins} admin keys are`}{" "}
              compromised, an attacker could upgrade contract logic and drain deposits.
              {summary.hasTimelock
                ? " A governance timelock provides a window to detect and respond to malicious upgrades."
                : " No timelock was detected — upgrades can happen instantly."}
              {" "}This is the #1 attack vector for state-sponsored hackers (Lazarus Group).
            </>
          ) : (
            <>
              User funds are in immutable contracts, but {summary.upgradeableContracts} contract{summary.upgradeableContracts > 1 ? "s are" : " is"}{" "}
              upgradeable. Admin key compromise could affect protocol operations
              {summary.treasuryAtRisk ? " and treasury funds" : ""}, but deposited user funds are not directly at risk.
            </>
          )}
        </p>
      </div>

      <div className="text-[10px] text-text-muted text-right">
        Scanned {new Date(report.timestamp).toLocaleString()} | {protocol.chain}
      </div>
    </div>
  );
}
