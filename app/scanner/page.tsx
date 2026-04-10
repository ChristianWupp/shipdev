"use client";

import { useState, useEffect } from "react";
import type { ProtocolReport } from "@/lib/scanner/types";
import { ScannerReport } from "./scanner-report";

interface ProtocolSummary {
  id: string;
  name: string;
  chain: string;
  tvl?: string;
  description: string;
}

export default function ScannerPage() {
  const [protocols, setProtocols] = useState<ProtocolSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [report, setReport] = useState<ProtocolReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/scanner")
      .then((r) => r.json())
      .then((data) => setProtocols(data))
      .catch(() => {});
  }, []);

  async function scan(protocolId: string) {
    setSelectedId(protocolId);
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocolId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Scan failed");
      } else {
        setReport(data as ProtocolReport);
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
            Protocol Scanner
          </span>
        </div>
      </nav>

      <main className="flex-1 max-w-[840px] mx-auto w-full px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="text-[10px] uppercase tracking-[2px] text-accent font-semibold mb-2">
            Protocol Security
          </div>
          <h1 className="font-serif text-[36px] font-normal leading-tight mb-3">
            What happens if the keys leak?
          </h1>
          <p className="text-[15px] text-text-secondary max-w-[600px] leading-[1.6]">
            Pick a protocol. We scan every contract, trace who controls what, and
            show you exactly what a compromised key can do to your money.
            The same threat model North Korea is running.
          </p>
        </div>

        {/* Protocol selector */}
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-[1px] text-text-muted font-semibold mb-3">
            Select a protocol to analyze
          </div>
          <div className="grid grid-cols-2 gap-3">
            {protocols.map((p) => (
              <button
                key={p.id}
                onClick={() => scan(p.id)}
                disabled={loading}
                className={`text-left bg-surface border rounded-[8px] p-4 cursor-pointer transition-colors disabled:opacity-60 ${
                  selectedId === p.id
                    ? "border-accent/40"
                    : "border-border hover:border-[#2a2a2a]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] text-text-primary font-semibold">
                    {p.name}
                  </span>
                  {p.tvl && (
                    <span className="font-mono text-[11px] text-text-muted">
                      {p.tvl}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-muted leading-[1.4] line-clamp-2">
                  {p.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
            <div className="text-[12px] text-text-muted">
              Scanning all contracts on-chain...
            </div>
            <div className="text-[10px] text-text-muted space-y-1 text-center">
              <div>Reading bytecode, proxy slots, admin addresses</div>
              <div>Resolving Gnosis Safe signers + ENS names</div>
              <div>Fetching live TVL from DeFiLlama</div>
              <div>Computing SEAL compliance score</div>
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <div className="text-[11px] text-text-muted">
          ShipDev Scanner — Protocol-level threat modeling via bytecode + storage slot analysis
        </div>
      </footer>
    </div>
  );
}
