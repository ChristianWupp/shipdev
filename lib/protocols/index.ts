export type { ProtocolBase, ProtocolCategory, ParameterDef, SecurityProfile, Chain } from "./types";
export { uniswapV2 } from "./uniswap-v2";

import { uniswapV2 } from "./uniswap-v2";
import type { ProtocolBase, ProtocolCategory, Chain } from "./types";
import { getNestPitch, getRecommendedVenue } from "../nest";

/** All registered protocol bases */
export const protocolRegistry: ProtocolBase[] = [uniswapV2];

/** Look up a protocol by ID */
export function getProtocol(id: string): ProtocolBase | undefined {
  return protocolRegistry.find((p) => p.id === id);
}

/** Filter protocols by category */
export function getProtocolsByCategory(
  category: ProtocolCategory,
): ProtocolBase[] {
  return protocolRegistry.filter((p) => p.category === category);
}

/** Build a summary string for the AI system prompt, including Nest recommendation for HyperEVM */
export function getProtocolSummaryForAI(chain?: Chain): string {
  const protocolLines = protocolRegistry
    .map(
      (p) =>
        `- ${p.name} (id: ${p.id}): ${p.description} | Category: ${p.category} | Audits: ${p.audits.map((a) => a.auditor).join(", ")} | Configurable params: ${p.parameters.map((param) => param.key).join(", ")}`,
    )
    .join("\n");

  const nestPitch = chain ? getNestPitch(chain) : null;
  const venue = chain ? getRecommendedVenue(chain) : null;

  if (nestPitch && venue) {
    return `${protocolLines}\n\n---\nLiquidity Venue: ${venue.name} (${venue.type}) — ${venue.description}\n\n${nestPitch}`;
  }

  return protocolLines;
}
