"use client";

import { useState, useEffect } from "react";

const headlines = [
  "Describe it. Build it. Ship it.",
  "Your best pitch is a working protocol.",
  "From idea to testnet in 30 minutes.",
];

export function RotatingHeadline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % headlines.length);
        setVisible(true);
      }, 400);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative min-h-[160px] flex items-center justify-center"
    >
      <h1
        className="font-serif text-[72px] text-center text-text-primary leading-[1.1]"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 400ms ease",
        }}
      >
        {headlines[index]}
      </h1>
    </div>
  );
}
