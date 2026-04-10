/**
 * Nest Integration Layer
 *
 * Types for integrating ShipDev-deployed protocols with Nest,
 * the ve(3,3) MetaDEX on HyperEVM. When deploying to HyperEVM,
 * Nest is the recommended liquidity venue because:
 *
 * 1. AMM liquidity from day one via pool creation
 * 2. Emissions-driven LP incentives via the Egg Initiative
 * 3. Arb against HyperCore Spot if listed — free market making
 * 4. Access to Hyperliquid, the Everything Exchange
 */

/** Pool types available on Nest */
export type NestPoolType = "classic" | "clamm" | "ichi";

/** Nest integration configuration chosen by the protocol deployer */
export interface NestIntegrationConfig {
  /** Whether to create a Nest pool post-deploy */
  enabled: boolean;
  /** Pool type: classic (x*y=k), clamm (concentrated), ichi (single-sided) */
  poolType: NestPoolType;
  /** Quote token to pair against (WHYPE or USDH) */
  quoteToken: "WHYPE" | "USDH";
  /** % of token supply to seed as initial LP */
  initialLiquidityPct: number;
  /** Amount of quote token to pair with initial LP (in ETH/HYPE units) */
  initialQuoteAmount: number;
  /** % of token supply to allocate as Egg Initiative bribes */
  bribeAllocationPct: number;
  /** Number of epochs to spread bribes across */
  bribeEpochs: number;
}

/** Default Nest integration config for new deployments */
export const DEFAULT_NEST_CONFIG: NestIntegrationConfig = {
  enabled: true,
  poolType: "classic",
  quoteToken: "WHYPE",
  initialLiquidityPct: 5,
  initialQuoteAmount: 0,
  bribeAllocationPct: 2,
  bribeEpochs: 4,
};

/** Result of Nest pool creation */
export interface NestPoolResult {
  poolAddress: string;
  poolType: NestPoolType;
  tokenAddress: string;
  quoteTokenAddress: string;
  txHash: string;
}

/** Result of bribe deposit */
export interface NestBribeResult {
  bribeContractAddress: string;
  tokenAddress: string;
  amountPerEpoch: string;
  totalEpochs: number;
  txHash: string;
}

/** Full result of Nest integration steps */
export interface NestIntegrationResult {
  pool?: NestPoolResult;
  bribe?: NestBribeResult;
  lpSeed?: {
    lpTokenAddress: string;
    tokenAmount: string;
    quoteAmount: string;
    txHash: string;
  };
}

/** Liquidity venue — Nest is the default on HyperEVM, extensible for multi-chain */
export interface LiquidityVenue {
  id: string;
  name: string;
  chain: string;
  type: "ve33" | "uniswap-v3" | "balancer" | "custom";
  description: string;
  /** Whether this venue is the recommended default for its chain */
  recommended: boolean;
  /** URL to the venue's app */
  appUrl: string;
}

/** Registry of supported liquidity venues by chain */
export const LIQUIDITY_VENUES: LiquidityVenue[] = [
  {
    id: "nest",
    name: "Nest",
    chain: "hyperevm",
    type: "ve33",
    description:
      "The ve(3,3) MetaDEX on HyperEVM. HYPE-aligned liquidity with emissions-driven LP incentives, Egg Initiative bribes, and arb against HyperCore Spot.",
    recommended: true,
    appUrl: "https://app.nestwap.com",
  },
  {
    id: "nest-testnet",
    name: "Nest (Testnet)",
    chain: "hyperevm-testnet",
    type: "ve33",
    description: "Nest testnet deployment for development and testing.",
    recommended: true,
    appUrl: "https://testnet.nestwap.com",
  },
];

/** Get the recommended liquidity venue for a chain */
export function getRecommendedVenue(chain: string): LiquidityVenue | undefined {
  return LIQUIDITY_VENUES.find((v) => v.chain === chain && v.recommended);
}

/** Get all venues for a chain */
export function getVenuesForChain(chain: string): LiquidityVenue[] {
  return LIQUIDITY_VENUES.filter((v) => v.chain === chain);
}
