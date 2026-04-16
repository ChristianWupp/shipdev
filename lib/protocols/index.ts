export type { ProtocolBase, ProtocolCategory, ParameterDef, SecurityProfile, Chain } from "./types";
export { uniswapV2 } from "./uniswap-v2";
export { aaveV3 } from "./aave-v3";
export { compoundV3 } from "./compound-v3";
export { gmxV2 } from "./gmx-v2";
export { lidoV2 } from "./lido-v2";
export { curveV2 } from "./curve-v2";
export { morphoBlue } from "./morpho-blue";
export { predexon } from "./predexon";

import { uniswapV2 } from "./uniswap-v2";
import { aaveV3 } from "./aave-v3";
import { compoundV3 } from "./compound-v3";
import { gmxV2 } from "./gmx-v2";
import { lidoV2 } from "./lido-v2";
import { curveV2 } from "./curve-v2";
import { morphoBlue } from "./morpho-blue";
import { predexon } from "./predexon";
import type { ProtocolBase, ProtocolCategory, Chain } from "./types";
import { getNestPitch, getRecommendedVenue } from "../nest";

/** All registered protocol bases */
export const protocolRegistry: ProtocolBase[] = [uniswapV2, aaveV3, compoundV3, gmxV2, lidoV2, curveV2, morphoBlue, predexon];

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
