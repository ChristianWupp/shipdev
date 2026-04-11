/** Agent system types and tier configuration */

export type AgentRole = "protocol" | "frontend" | "security";

export type UserTier = "explorer" | "builder" | "protocol" | "enterprise";

export interface AgentDef {
  role: AgentRole;
  name: string;
  /** Short label for the UI badge */
  badge: string;
  description: string;
}

export interface TierConfig {
  tier: UserTier;
  model: string;
  /** Max builds per month (0 = unlimited) */
  buildLimit: number;
}

/** The three specialist agents */
export const AGENTS: Record<AgentRole, AgentDef> = {
  protocol: {
    role: "protocol",
    name: "Protocol Architect",
    badge: "PA",
    description:
      "Selects audited bases, configures parameters, reasons about protocol design trade-offs.",
  },
  frontend: {
    role: "frontend",
    name: "Frontend Engineer",
    badge: "FE",
    description:
      "Forks and customizes protocol UIs, generates preview HTML, handles branding.",
  },
  security: {
    role: "security",
    name: "Security Analyst",
    badge: "SA",
    description:
      "Threat modeling, access control analysis, SEAL compliance, audit status checks.",
  },
};

/** Tier-to-model mapping via OpenRouter */
export const TIERS: Record<UserTier, TierConfig> = {
  explorer: {
    tier: "explorer",
    model: "anthropic/claude-haiku-4-5-20251001",
    buildLimit: 10,
  },
  builder: {
    tier: "builder",
    model: "anthropic/claude-sonnet-4",
    buildLimit: 100,
  },
  protocol: {
    tier: "protocol",
    model: "anthropic/claude-opus-4",
    buildLimit: 0,
  },
  enterprise: {
    tier: "enterprise",
    model: "anthropic/claude-opus-4",
    buildLimit: 0,
  },
};

/** Get the OpenRouter model ID for a given tier */
export function getModelForTier(tier: UserTier): string {
  return TIERS[tier].model;
}
