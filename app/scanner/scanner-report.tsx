"use client";

import type { SecurityReport, CheckResult, CheckStatus } from "@/lib/scanner/types";
import { ScoreRing } from "./score-ring";

const statusConfig: Record<CheckStatus, { icon: string; color: string; bg: string }> = {
  pass: { icon: "\u2713", color: "var(--success)", bg: "rgba(52, 211, 153, 0.1)" },
  fail: { icon: "\u2717", color: "var(--error)", bg: "rgba(248, 113, 113, 0.1)" },
  warn: { icon: "!", color: "var(--warning)", bg: "rgba(251, 191, 36, 0.1)" },
  unknown: { icon: "?", color: "var(--text-muted)", bg: "rgba(82, 82, 82, 0.1)" },
};

function CheckCard({ result }: { result: CheckResult }) {
  const cfg = statusConfig[result.status];

  return (
    <div className="bg-surface border border-border rounded-[8px] p-4 hover:border-[#2a2a2a] transition-colors">
      <div className="flex items-start gap-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 mt-[1px]"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] text-text-primary font-medium">
              {result.label}
            </span>
            <span
              className="text-[9px] uppercase tracking-[0.5px] font-semibold px-[6px] py-[2px] rounded-full"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {result.status}
            </span>
            <span className="text-[9px] uppercase tracking-[0.5px] text-text-muted border border-border rounded-full px-[6px] py-[2px]">
              {result.severity}
            </span>
          </div>
          <p className="text-[12px] text-text-secondary leading-[1.6]">
            {result.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ScannerReport({ report }: { report: SecurityReport }) {
  if (!report.isContract) {
    return (
      <div className="bg-surface border border-error/30 rounded-[10px] p-6 text-center">
        <div className="text-error text-[15px] font-semibold mb-2">
          Not a Contract
        </div>
        <p className="text-[13px] text-text-secondary">
          <span className="font-mono text-[11px] text-text-muted">{report.address}</span>
          {" "}is an externally owned account (EOA), not a smart contract.
        </p>
      </div>
    );
  }

  const checks = Object.values(report.checks);
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const passCount = checks.filter((c) => c.status === "pass").length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-8 mb-8">
        <ScoreRing score={report.overallScore} />
        <div className="flex-1 pt-2">
          <div className="text-[10px] uppercase tracking-[2px] text-accent font-semibold mb-1">
            Security Posture
          </div>
          <div className="font-mono text-[13px] text-text-secondary mb-3 break-all">
            {report.address}
          </div>
          <div className="flex gap-4 text-[11px]">
            <span className="text-error font-medium">{failCount} critical</span>
            <span className="text-warning font-medium">{warnCount} warnings</span>
            <span className="text-success font-medium">{passCount} passed</span>
          </div>

          {/* Metadata */}
          <div className="flex gap-4 mt-3 text-[11px] text-text-muted">
            <span>
              Bytecode:{" "}
              <span className="font-mono text-text-secondary">
                {(report.metadata.bytecodeSize / 1024).toFixed(1)} KB
              </span>
            </span>
            {report.metadata.implementationAddress && (
              <span>
                Impl:{" "}
                <span className="font-mono text-text-secondary">
                  {report.metadata.implementationAddress.slice(0, 10)}...
                </span>
              </span>
            )}
            {report.metadata.adminAddress && (
              <span>
                Admin:{" "}
                <span className="font-mono text-text-secondary">
                  {report.metadata.adminAddress.slice(0, 10)}...
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Check cards */}
      <div className="grid grid-cols-1 gap-3">
        {checks.map((result) => (
          <CheckCard key={result.id} result={result} />
        ))}
      </div>

      {/* Timestamp */}
      <div className="mt-6 text-[10px] text-text-muted text-right">
        Scanned {new Date(report.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
