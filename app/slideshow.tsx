"use client";

import { useState, useEffect } from "react";

const slides = [
  {
    step: "01",
    label: "Describe",
    caption: "Tell the AI what you want to build in plain English.",
    content: (
      <div className="bg-surface rounded-[12px] border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg">
          <div className="w-[6px] h-[6px] rounded-full bg-[#f87171]" />
          <div className="w-[6px] h-[6px] rounded-full bg-[#fbbf24]" />
          <div className="w-[6px] h-[6px] rounded-full bg-[#34d399]" />
          <span className="text-[11px] text-text-muted ml-2 font-mono">shipdev.xyz</span>
        </div>
        <div className="p-5">
          <div className="flex justify-end mb-3">
            <div className="bg-accent text-black rounded-[10px] rounded-br-[4px] px-3 py-2 text-[12px] max-w-[280px]">
              Build me a DEX on HyperEVM with 0.3% fees and a governance token
            </div>
          </div>
          <div className="bg-surface-elevated border border-border rounded-[10px] rounded-bl-[4px] px-3 py-2 text-[12px] text-text-secondary max-w-[320px] leading-[1.6]">
            <span className="text-text-primary font-medium">Uniswap V2 fork</span> selected. Audited by dapp.org + OpenZeppelin.
            <div className="mt-2 flex flex-col gap-1">
              <div><span className="text-accent">&#x2022;</span> Constant product AMM</div>
              <div><span className="text-accent">&#x2022;</span> Fee: 0.3% to LPs</div>
              <div><span className="text-accent">&#x2022;</span> Token: 100M supply</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "02",
    label: "Configure",
    caption: "Fine-tune parameters with a live security score.",
    content: (
      <div className="bg-surface rounded-[12px] border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg">
          <div className="flex gap-0 text-[11px]">
            <span className="px-3 py-1 text-text-primary border-b-2 border-accent">Configuration</span>
            <span className="px-3 py-1 text-text-muted">Protocol DNA</span>
            <span className="px-3 py-1 text-text-muted">Frontend</span>
            <span className="px-3 py-1 text-text-muted">Contracts</span>
          </div>
        </div>
        <div className="p-5">
          <div className="inline-flex items-center gap-1 bg-[#34d39912] text-success px-2 py-1 rounded-full text-[10px] font-medium mb-3">
            &#x2713; Based on Uniswap V2 (audited)
          </div>
          {[
            ["Fee Structure", "0.30%", true],
            ["Protocol Fee", "10%", true],
            ["Token Supply", "100,000,000", true],
            ["LP Rewards", "40%", true],
            ["Nest Pool", "Classic AMM", false],
          ].map(([label, value, isAccent]) => (
            <div key={label as string} className="flex justify-between items-center py-2 border-b border-[#0f0f0f] text-[12px]">
              <span className="text-text-secondary">{label}</span>
              <span className={isAccent ? "text-accent font-mono font-semibold" : "text-success"}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: "03",
    label: "Preview",
    caption: "See your protocol's frontend before deploying. AI-generated, branded to your project.",
    content: (
      <div className="bg-surface rounded-[12px] border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg">
          <div className="flex gap-0 text-[11px]">
            <span className="px-3 py-1 text-text-muted">Configuration</span>
            <span className="px-3 py-1 text-text-primary border-b-2 border-accent">Frontend</span>
            <span className="px-3 py-1 text-text-muted">Contracts</span>
          </div>
          <span className="text-[9px] uppercase tracking-[1px] text-accent font-semibold">Live Preview</span>
        </div>
        <div className="p-5 bg-bg">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[14px] font-bold">Hyper<span className="text-accent">DEX</span></div>
            <div className="flex gap-2 text-[10px]">
              <span className="text-text-muted px-2 py-1 rounded bg-surface-elevated">Swap</span>
              <span className="text-text-muted px-2 py-1">Pool</span>
              <span className="text-text-muted px-2 py-1">Farm</span>
            </div>
          </div>
          <div className="bg-surface-elevated border border-border rounded-[10px] p-4 max-w-[280px] mx-auto">
            <div className="text-[11px] text-text-muted mb-2">You pay</div>
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
              <span className="text-[18px] text-text-primary font-medium">1.00</span>
              <span className="bg-surface border border-border rounded-[6px] px-2 py-1 text-[11px] text-text-primary font-medium">WHYPE</span>
            </div>
            <div className="text-[11px] text-text-muted mb-2">You receive</div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[18px] text-accent font-medium">2,847.32</span>
              <span className="bg-surface border border-border rounded-[6px] px-2 py-1 text-[11px] text-text-primary font-medium">HDEX</span>
            </div>
            <button className="w-full bg-accent text-black rounded-[8px] py-2 text-[12px] font-semibold">Swap</button>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-[10px]">
            <div className="text-center">
              <div className="text-text-primary font-mono font-semibold">$2.4M</div>
              <div className="text-text-muted">TVL</div>
            </div>
            <div className="text-center">
              <div className="text-text-primary font-mono font-semibold">$892K</div>
              <div className="text-text-muted">24h Vol</div>
            </div>
            <div className="text-center">
              <div className="text-success font-mono font-semibold">0.30%</div>
              <div className="text-text-muted">Fee</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "04",
    label: "Compile",
    caption: "Contracts compile against audited bases. No AI-generated Solidity.",
    content: (
      <div className="bg-surface rounded-[12px] border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg">
          <span className="text-[11px] text-text-muted font-mono">Compile Output</span>
        </div>
        <div className="p-5 font-mono text-[11px] leading-[1.8] text-text-secondary">
          <div className="text-text-muted">$ solc --optimize contracts/</div>
          <div className="mt-2">
            <span className="text-success">&#x2713;</span> Factory.sol <span className="text-text-muted">— 2,847 gas optimized</span>
          </div>
          <div><span className="text-success">&#x2713;</span> Router.sol <span className="text-text-muted">— 1,923 gas optimized</span></div>
          <div><span className="text-success">&#x2713;</span> Pool.sol <span className="text-text-muted">— 4,102 gas optimized</span></div>
          <div><span className="text-success">&#x2713;</span> VeToken.sol <span className="text-text-muted">— 892 gas optimized</span></div>
          <div className="mt-3 text-success font-semibold">4/4 contracts compiled successfully</div>
          <div className="mt-1 text-text-muted">Security score: <span className="text-success font-bold">8.2</span>/10</div>
        </div>
      </div>
    ),
  },
  {
    step: "05",
    label: "Deploy",
    caption: "One click to HyperEVM testnet. Contracts + frontend, live in minutes.",
    content: (
      <div className="bg-surface rounded-[12px] border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg">
          <span className="text-[11px] text-text-muted font-mono">Deploy — HyperEVM Testnet</span>
        </div>
        <div className="p-5 font-mono text-[11px] leading-[1.8] text-text-secondary">
          <div><span className="text-success">&#x2713;</span> Factory deployed <span className="text-accent">0x7a3f...9e2f</span></div>
          <div><span className="text-success">&#x2713;</span> Router deployed <span className="text-accent">0x1b8c...4d7a</span></div>
          <div><span className="text-success">&#x2713;</span> Token deployed <span className="text-accent">0x9f2e...8b1c</span></div>
          <div><span className="text-success">&#x2713;</span> Nest pool created <span className="text-accent">0x3c5d...2a9e</span></div>
          <div className="mt-2"><span className="text-success">&#x2713;</span> Frontend deployed</div>
          <div className="mt-3 py-2 px-3 bg-[#00d4ff12] border border-[#00d4ff30] rounded-[6px] text-accent flex items-center justify-between">
            <span>Live at hyperdex.shipdev.xyz</span>
            <span>&#x2197;</span>
          </div>
        </div>
      </div>
    ),
  },
];

export function Slideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="flex gap-8 items-start">
        <div className="flex flex-col gap-2 shrink-0 pt-2">
          {slides.map((s, i) => (
            <button
              key={s.step}
              onClick={() => setCurrent(i)}
              className={`text-left px-3 py-2 rounded-[8px] transition-colors cursor-pointer ${
                i === current
                  ? "bg-surface-elevated border border-border"
                  : "border border-transparent"
              }`}
            >
              <div className={`font-mono text-[11px] font-semibold ${i === current ? "text-accent" : "text-text-muted"}`}>
                {s.step}
              </div>
              <div className={`text-[13px] font-medium ${i === current ? "text-text-primary" : "text-text-muted"}`}>
                {s.label}
              </div>
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div key={current} className="animate-fade-in">
            {slide.content}
          </div>
          <p className="text-[13px] text-text-secondary mt-4">{slide.caption}</p>
        </div>
      </div>
    </div>
  );
}
