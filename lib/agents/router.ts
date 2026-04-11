/**
 * Agent router — classifies user messages and picks the right specialist.
 *
 * This is a lightweight keyword + heuristic router, not an LLM call.
 * Fast, deterministic, zero latency. An LLM-based router would add
 * a round-trip before every message — not worth it for three agents.
 */

import type { AgentRole } from "./types";

interface RouteResult {
  /** Primary agent that handles this message */
  primary: AgentRole;
  /** Optional secondary agent to consult (future: multi-agent) */
  secondary?: AgentRole;
}

// ── keyword sets ───────────────────────────────────────────────────

const PROTOCOL_KEYWORDS = [
  "build",
  "create",
  "deploy",
  "ship",
  "launch",
  "dex",
  "amm",
  "swap",
  "lending",
  "borrow",
  "lend",
  "perpetual",
  "perp",
  "staking",
  "stake",
  "vault",
  "pool",
  "liquidity",
  "token",
  "fee",
  "protocol",
  "fork",
  "configure",
  "config",
  "parameter",
  "param",
  "set",
  "change",
  "adjust",
  "governance",
  "timelock",
  "multisig",
  "owner",
  "admin",
  "upgrade",
  "proxy",
  "nest",
  "hyperevm",
  "uniswap",
  "aave",
  "gmx",
  "base",
  "select",
  "execute",
  "go",
  "ready",
  "let's go",
];

const FRONTEND_KEYWORDS = [
  "frontend",
  "ui",
  "interface",
  "preview",
  "design",
  "theme",
  "color",
  "layout",
  "page",
  "component",
  "button",
  "logo",
  "brand",
  "branding",
  "dark",
  "light",
  "style",
  "css",
  "html",
  "visual",
  "show me",
  "look like",
  "looks like",
  "mockup",
  "wireframe",
  "dashboard",
  "chart",
  "display",
  "responsive",
];

const SECURITY_KEYWORDS = [
  "security",
  "secure",
  "audit",
  "risk",
  "threat",
  "attack",
  "vulnerability",
  "exploit",
  "hack",
  "reentrancy",
  "flash loan",
  "oracle",
  "manipulation",
  "access control",
  "permission",
  "privileged",
  "role",
  "pause",
  "emergency",
  "circuit breaker",
  "seal",
  "compliance",
  "safe",
  "danger",
  "warning",
  "score",
  "rating",
  "analysis",
  "analyze",
  "review",
  "check",
];

// ── scoring ────────────────────────────────────────────────────────

function scoreKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) {
      // Longer keywords are more specific → worth more
      score += kw.length > 6 ? 2 : 1;
    }
  }
  return score;
}

// ── router ─────────────────────────────────────────────────────────

export function routeMessage(message: string): RouteResult {
  const protocolScore = scoreKeywords(message, PROTOCOL_KEYWORDS);
  const frontendScore = scoreKeywords(message, FRONTEND_KEYWORDS);
  const securityScore = scoreKeywords(message, SECURITY_KEYWORDS);

  const scores: [AgentRole, number][] = [
    ["protocol", protocolScore],
    ["frontend", frontendScore],
    ["security", securityScore],
  ];

  // Sort by score descending
  scores.sort((a, b) => b[1] - a[1]);

  const [primary, primaryScore] = scores[0];
  const [secondary, secondaryScore] = scores[1];

  // If no keywords matched at all, default to protocol (the main builder agent)
  if (primaryScore === 0) {
    return { primary: "protocol" };
  }

  // If secondary scored at least half the primary, include it
  if (secondaryScore > 0 && secondaryScore >= primaryScore * 0.5) {
    return { primary, secondary };
  }

  return { primary };
}
