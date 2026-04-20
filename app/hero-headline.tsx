"use client";

import { useEffect, useState } from "react";

const HEADLINES = [
  { main: "Describe it. Build it.", accent: "Ship it." },
  { main: "Your best pitch is a", accent: "working protocol." },
  { main: "From idea to testnet in", accent: "30 minutes." },
  { main: "Fork the audited base.", accent: "Configure the rest." },
];

export function HeroHeadline() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setI((x) => (x + 1) % HEADLINES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <h1
      className="font-serif text-[56px] md:text-[72px] font-normal leading-[0.98] tracking-tight min-h-[140px] md:min-h-[170px] transition-opacity duration-[400ms] ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {HEADLINES[i].main}{" "}
      <span className="italic text-accent">{HEADLINES[i].accent}</span>
    </h1>
  );
}
