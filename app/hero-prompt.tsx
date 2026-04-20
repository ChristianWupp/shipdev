"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroPrompt() {
  const [text, setText] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    router.push(`/builder?prompt=${encodeURIComponent(text.trim())}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-[640px] flex flex-col gap-3"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe your protocol... e.g. 'A concentrated liquidity DEX with ve(3,3) tokenomics on HyperEVM'"
        className="w-full h-[120px] bg-surface-elevated border border-border rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent/40 transition-colors"
      />
      <button
        type="submit"
        className="self-end bg-accent text-black rounded-[8px] px-6 py-[10px] text-[14px] font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
      >
        Ship it &rarr;
      </button>
    </form>
  );
}
