"use client";

import type { ProjectState } from "@/lib/project-state";
import { calculateSecurityScore, PENALTIES } from "@/lib/security/scoring";

interface SecurityPanelProps {
  project: ProjectState;
}

export function SecurityPanel({ project }: SecurityPanelProps) {
  const base = project.selectedBase;

  if (!base) {
    const categories = [
      { icon: "\u2696", label: "Audit Coverage", description: "Third-party review of all deployed contracts" },
      { icon: "\u26D1", label: "Admin Centralization", description: "Single-key vs multi-sig ownership analysis" },
      { icon: "\u21BB", label: "Upgradeability", description: "Proxy patterns, timelocks, and immutability" },
      { icon: "\u23F8", label: "Emergency Controls", description: "Pause mechanisms for active exploit response" },
      { icon: "\u25CE", label: "Token Concentration", description: "Team and insider allocation risk assessment" },
      { icon: "\u23F3", label: "Vesting Schedule", description: "Cliff duration and unlock timeline analysis" },
    ];

    return (
      <div className="flex flex-col h-full bg-bg border-l border-border p-4">
        <div className="text-[11px] uppercase tracking-[1px] text-text-muted font-semibold mb-3">
          Security
        </div>
        <div className="flex-1 flex flex-col">
          <div className="text-[12px] text-text-secondary mb-4">
            Our security scoring evaluates 6 risk categories
          </div>
          <div className="space-y-[6px]">
            {categories.map((cat) => (
              <div
                key={cat.label}
                className="bg-surface border border-border rounded-[6px] p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] text-text-muted">{cat.icon}</span>
                  <span className="text-[11px] text-text-secondary font-medium">
                    {cat.label}
                  </span>
                </div>
                <div className="text-[10px] text-text-muted leading-[1.4] ml-5">
                  {cat.description}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-surface border border-border rounded-[6px] p-3">
            <div className="text-[10px] text-text-muted leading-[1.4]">
              Scoring methodology is open-source
            </div>
            <code className="text-[9px] font-mono text-accent mt-1 block">
              lib/security/scoring.ts
            </code>
          </div>
        </div>
      </div>
    );
  }

  const { total, factors, riskCount, cautionCount } = calculateSecurityScore(
    base,
    project.parameters,
  );

  const scoreColor =
    total >= 8 ? "text-success" : total >= 6 ? "text-warning" : "text-error";
  const barColor =
    total >= 8
      ? "var(--success)"
      : total >= 6
        ? "var(--warning)"
        : "var(--error)";

  return (
    <div className="flex flex-col h-full bg-bg border-l border-border overflow-y-auto">
      {/* Score */}
      <div className="text-center py-4 px-4">
        <div className={`font-mono text-[36px] font-bold ${scoreColor}`}>
          {total.toFixed(1)}
        </div>
        <div className="text-[11px] text-text-muted">Security Score</div>
        <div className="h-1 bg-surface-elevated rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${total * 10}%`, background: barColor }}
          />
        </div>
        {(riskCount > 0 || cautionCount > 0) && (
          <div className="flex justify-center gap-3 mt-2 text-[10px]">
            {riskCount > 0 && (
              <span className="text-error">
                {riskCount} risk{riskCount > 1 ? "s" : ""}
              </span>
            )}
            {cautionCount > 0 && (
              <span className="text-warning">
                {cautionCount} caution{cautionCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* Risk assessment */}
        <div>
          <div className="text-[11px] uppercase tracking-[1px] text-text-muted font-semibold mb-2">
            Risk Assessment
          </div>
          <div className="space-y-[6px]">
            {factors.map((f) => (
              <div
                key={f.label}
                className={`bg-surface border rounded-[6px] p-3 ${
                  f.level === "risk"
                    ? "border-error/30"
                    : f.level === "caution"
                      ? "border-warning/30"
                      : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] ${
                        f.level === "risk"
                          ? "text-error"
                          : f.level === "caution"
                            ? "text-warning"
                            : "text-success"
                      }`}
                    >
                      {f.level === "risk"
                        ? "\u2717"
                        : f.level === "caution"
                          ? "\u26A0"
                          : "\u2713"}
                    </span>
                    <span className="text-[11px] text-text-primary font-medium">
                      {f.label}
                    </span>
                  </div>
                  {f.penalty > 0 && (
                    <span className="text-[10px] font-mono text-error shrink-0">
                      -{f.penalty.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-text-muted mt-1 ml-5 leading-[1.4]">
                  {f.detail}
                </div>
                <div className="text-[9px] text-text-muted mt-1 ml-5 uppercase tracking-[0.5px]">
                  {f.category}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology link */}
        <div className="bg-surface border border-border rounded-[6px] p-3">
          <div className="text-[11px] text-text-primary font-medium mb-1">
            Open-source scoring
          </div>
          <div className="text-[10px] text-text-muted leading-[1.4] mb-2">
            This score is fully transparent. Every factor, penalty weight, and
            rationale is documented in our scoring module.
          </div>
          <div className="flex items-center justify-between">
            <code className="text-[9px] font-mono text-accent">
              lib/security/scoring.ts
            </code>
            <div className="flex gap-3 text-[9px]">
              <span className="text-text-muted">
                Max penalty per factor:{" "}
                <span className="text-text-secondary font-mono">
                  {Math.max(...Object.values(PENALTIES)).toFixed(1)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Audit reports */}
        <div>
          <div className="text-[11px] uppercase tracking-[1px] text-text-muted font-semibold mb-2">
            Audit Reports
          </div>
          <div className="bg-surface border border-border rounded-[8px] p-3 space-y-1">
            {base.audits.map((audit) => (
              <div
                key={audit.auditor}
                className="flex justify-between py-1 text-[11px]"
              >
                <span className="text-text-secondary">{audit.auditor}</span>
                <span className="text-text-muted">{audit.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
