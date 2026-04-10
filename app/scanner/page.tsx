"use client";

import { useState } from "react";
import type { SecurityReport } from "@/lib/scanner/types";
import { ScannerReport } from "./scanner-report";

const CHAINS = [
  { id: "ethereum", label: "Ethereum" },
  { id: "arbitrum", label: "Arbitrum" },
  { id: "base", label: "Base" },
  { id: "optimism", label: "Optimism" },
];

const EXAMPLES = [
  { label: "USDC Proxy", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  { label: "Uniswap V3 Router", address: "0xE592427A0AEce92De3Edee1F18E0157C05861564" },
  { label: "Aave V3 Pool", address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" },
];

export default function ScannerPage() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scan(targetAddress?: string) {
    const addr = targetAddress ?? address;
    if (!addr.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr.trim(), chain }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Scan failed");
      } else {
        setReport(data as SecurityReport);
      }
    } catch {
      setError("Network error — could not reach scanner API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-[1200px] mx-auto w-full">
        <a href="/" className="text-[14px] font-bold tracking-tight">
          ship<span className="text-accent">dev</span>
        </a>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[1px] text-accent font-semibold">
            Scanner
          </span>
        </div>
      </nav>

      <main className="flex-1 max-w-[760px] mx-auto w-full px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="text-[10px] uppercase tracking-[2px] text-accent font-semibold mb-2">
            Protocol Security
          </div>
          <h1 className="font-serif text-[36px] font-normal leading-tight mb-3">
            Security posture scanner
          </h1>
          <p className="text-[15px] text-text-secondary max-w-[540px] leading-[1.6]">
            Paste a contract address. Get a full security report: multi-sig status,
            privileged roles, proxy patterns, upgradeability, kill switches, and
            SEAL org compliance.
          </p>
        </div>

        {/* Input */}
        <div className="bg-surface border border-border rounded-[12px] p-5 mb-6">
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && scan()}
              placeholder="0x..."
              className="flex-1 bg-surface-elevated border border-border rounded-[6px] px-4 py-[10px] text-[13px] font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-accent/40 transition-colors"
            />
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              className="bg-surface-elevated border border-border rounded-[6px] px-3 py-[10px] text-[12px] text-text-secondary outline-none focus:border-accent/40 transition-colors cursor-pointer"
            >
              {CHAINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.address}
                  onClick={() => {
                    setAddress(ex.address);
                    scan(ex.address);
                  }}
                  className="text-[10px] text-text-muted hover:text-accent border border-border rounded-full px-3 py-[4px] transition-colors cursor-pointer"
                >
                  {ex.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => scan()}
              disabled={loading || !address.trim()}
              className="bg-accent text-black rounded-[6px] px-6 py-[10px] text-[13px] font-semibold cursor-pointer hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Scanning..." : "Scan"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
            <div className="text-[12px] text-text-muted">
              Analyzing on-chain data...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-surface border border-error/30 rounded-[8px] p-4 mb-6">
            <div className="text-[12px] text-error font-medium">{error}</div>
          </div>
        )}

        {/* Report */}
        {report && !loading && <ScannerReport report={report} />}

        {/* Empty state */}
        {!report && !loading && !error && (
          <div className="text-center py-20">
            <div className="text-[13px] text-text-muted mb-2">
              Enter a contract address to begin
            </div>
            <div className="text-[11px] text-text-muted">
              Supports Ethereum, Arbitrum, Base, and Optimism
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <div className="text-[11px] text-text-muted">
          ShipDev Scanner — On-chain security analysis via bytecode + storage slot inspection
        </div>
      </footer>
    </div>
  );
}
