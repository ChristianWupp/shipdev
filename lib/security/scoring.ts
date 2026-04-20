/**
 * ShipDev Security Scoring Model v1.0
 * ====================================
 *
 * Open-source, transparent protocol security scoring.
 * Source: https://github.com/shipdev-xyz/shipdev/blob/main/lib/security/scoring.ts
 *
 * HOW IT WORKS
 * ------------
 * Every protocol starts at 10.0 (perfect score).
 * Each risk factor deducts a fixed penalty.
 * The final score = 10.0 - sum(penalties), clamped to [0, 10].
 *
 * WHY THESE FACTORS
 * -----------------
 * Each factor maps to a real category of DeFi exploits and rug pulls.
 * Penalties are weighted by historical impact and frequency:
 *
 *   - Unaudited code:     The #1 source of exploits. Wormhole ($320M), Ronin ($620M),
 *                         and most bridge hacks involved unaudited or under-audited code.
 *
 *   - EOA admin:          Single-key ownership is how most rug pulls execute.
 *                         Multi-sig (3/5+) is the industry standard for any protocol
 *                         holding user funds.
 *
 *   - Upgradeability:     Upgradeable proxies let admins change contract logic.
 *                         Without a timelock, changes are instant — no time for users
 *                         to exit. With a timelock, there's a delay (typically 48-72hrs).
 *
 *   - Emergency controls: Pausability lets protocols freeze operations during an active
 *                         exploit. Without it, funds drain until the block is mined.
 *
 *   - Token concentration: Team allocations above 20% create insider dump risk.
 *                          Well-structured projects keep team + investor below 25%.
 *
 *   - Vesting schedule:   Short vesting cliffs (<3 months) allow early insiders to sell
 *                         immediately. 6+ month cliffs with 12-24mo linear unlock is standard.
 *
 * SCORE INTERPRETATION
 * --------------------
 *   9.0 - 10.0  Excellent  — Fully audited, immutable, multi-sig, good tokenomics
 *   7.0 -  8.9  Good       — Minor risks present but manageable
 *   5.0 -  6.9  Caution    — Significant risks that should be addressed before mainnet
 *   0.0 -  4.9  High Risk  — Critical issues, not safe for user funds
 *
 * CONTRIBUTING
 * ------------
 * This is open source. If you think a factor is missing or a weight is wrong,
 * open a PR. We want this to be the most transparent scoring in DeFi.
 */

import type { ProtocolBase } from "../protocols/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RiskLevel = "safe" | "caution" | "risk";

export interface ScoreFactor {
  /** Short label shown in the UI */
  label: string;
  /** Explanation of why this matters */
  detail: string;
  /** Points deducted (0 = no penalty) */
  penalty: number;
  /** Risk classification */
  level: RiskLevel;
  /** Which real-world exploit category this maps to */
  category: "audit" | "admin" | "upgradeability" | "operations" | "tokenomics";
}

export interface SecurityScore {
  /** Final score out of 10 */
  total: number;
  /** Breakdown of all factors evaluated */
  factors: ScoreFactor[];
  /** Number of risk-level issues */
  riskCount: number;
  /** Number of caution-level issues */
  cautionCount: number;
}

// ---------------------------------------------------------------------------
// Penalty constants — change these to adjust the model
// ---------------------------------------------------------------------------

export const PENALTIES = {
  /** Per unaudited contract */
  UNAUDITED_CONTRACT: 1.5,
  /** Owner is a single EOA wallet */
  EOA_OWNER: 1.0,
  /** Upgradeable proxy with no timelock */
  PROXY_NO_TIMELOCK: 1.5,
  /** Upgradeable proxy with timelock */
  PROXY_WITH_TIMELOCK: 0.5,
  /** No emergency pause function */
  NO_EMERGENCY_PAUSE: 0.5,
  /** Team token allocation exceeds 20% */
  HIGH_TEAM_ALLOCATION: 0.5,
  /** Vesting cliff shorter than 3 months */
  SHORT_VESTING_CLIFF: 0.5,
} as const;

// ---------------------------------------------------------------------------
// Scoring function
// ---------------------------------------------------------------------------

export function calculateSecurityScore(
  base: ProtocolBase,
  parameters: Record<string, string | number | boolean>,
): SecurityScore {
  const factors: ScoreFactor[] = [];

  // 1. AUDIT COVERAGE
  const unaudited = base.contracts.filter((c) => c.auditStatus === "unaudited");
  if (unaudited.length === 0) {
    factors.push({
      label: "Full audit coverage",
      detail: `All ${base.contracts.length} contracts audited by ${base.audits.map((a) => a.auditor).join(", ")}`,
      penalty: 0,
      level: "safe",
      category: "audit",
    });
  } else {
    factors.push({
      label: `${unaudited.length} unaudited contract${unaudited.length > 1 ? "s" : ""}`,
      detail: `${unaudited.map((c) => c.name).join(", ")} — no third-party security review. This is the #1 source of DeFi exploits.`,
      penalty: unaudited.length * PENALTIES.UNAUDITED_CONTRACT,
      level: "risk",
      category: "audit",
    });
  }

  // 2. ADMIN CENTRALIZATION
  const owner = parameters.owner;
  if (owner && typeof owner === "string" && owner.startsWith("0x")) {
    factors.push({
      label: "Owner is EOA",
      detail:
        "Single wallet controls admin functions. Multi-sig (3/5) is the industry standard for protocols holding user funds.",
      penalty: PENALTIES.EOA_OWNER,
      level: "risk",
      category: "admin",
    });
  } else {
    factors.push({
      label: "No EOA admin risk",
      detail: "Admin control is not concentrated in a single wallet",
      penalty: 0,
      level: "safe",
      category: "admin",
    });
  }

  // 3. UPGRADEABILITY
  const upgradeability = parameters.upgradeability ?? base.security.upgradeability;
  if (upgradeability === "proxy") {
    factors.push({
      label: "Upgradeable (no timelock)",
      detail:
        "Contracts can be changed instantly by the owner. This is the mechanism behind most rug pulls — users have zero time to exit.",
      penalty: PENALTIES.PROXY_NO_TIMELOCK,
      level: "risk",
      category: "upgradeability",
    });
  } else if (upgradeability === "proxy-with-timelock") {
    factors.push({
      label: "Upgradeable (with timelock)",
      detail:
        "Upgrades require a delay period (typically 48-72hrs), giving users time to review changes and exit if needed.",
      penalty: PENALTIES.PROXY_WITH_TIMELOCK,
      level: "caution",
      category: "upgradeability",
    });
  } else {
    factors.push({
      label: "Immutable contracts",
      detail:
        "Code cannot be changed after deployment. This is the highest security guarantee — what you audit is what runs forever.",
      penalty: 0,
      level: "safe",
      category: "upgradeability",
    });
  }

  // 4. EMERGENCY CONTROLS
  if (parameters.emergencyPause === false) {
    factors.push({
      label: "No emergency pause",
      detail:
        "Protocol cannot be paused during an active exploit. Funds may drain continuously until a fix is deployed on-chain.",
      penalty: PENALTIES.NO_EMERGENCY_PAUSE,
      level: "caution",
      category: "operations",
    });
  } else {
    factors.push({
      label: "Emergency pause enabled",
      detail: "Protocol can be paused to halt operations during a security incident",
      penalty: 0,
      level: "safe",
      category: "operations",
    });
  }

  // 5. TOKEN CONCENTRATION
  const teamAlloc = Number(parameters.teamAlloc ?? 15);
  if (teamAlloc > 20) {
    factors.push({
      label: `Team allocation: ${teamAlloc}%`,
      detail: `Above 20% increases insider dump risk. Well-structured projects keep team + investor allocation below 25%.`,
      penalty: PENALTIES.HIGH_TEAM_ALLOCATION,
      level: "caution",
      category: "tokenomics",
    });
  } else {
    factors.push({
      label: `Team allocation: ${teamAlloc}%`,
      detail: "Within normal range (≤20%)",
      penalty: 0,
      level: "safe",
      category: "tokenomics",
    });
  }

  // 6. VESTING SCHEDULE
  const cliff = Number(parameters.vestingCliff ?? 6);
  if (cliff < 3) {
    factors.push({
      label: `Vesting cliff: ${cliff} months`,
      detail:
        "Short cliff (<3 months) allows early team selling before the project proves itself. 6+ months is the industry standard.",
      penalty: PENALTIES.SHORT_VESTING_CLIFF,
      level: "caution",
      category: "tokenomics",
    });
  } else {
    factors.push({
      label: `Vesting cliff: ${cliff} months`,
      detail: "Adequate lock-up period before team tokens begin unlocking",
      penalty: 0,
      level: "safe",
      category: "tokenomics",
    });
  }

  const totalPenalty = factors.reduce((sum, f) => sum + f.penalty, 0);

  return {
    total: Math.max(0, Math.min(10, 10 - totalPenalty)),
    factors,
    riskCount: factors.filter((f) => f.level === "risk").length,
    cautionCount: factors.filter((f) => f.level === "caution").length,
  };
}
