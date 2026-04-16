/**
 * Frontend Fork Registry
 *
 * Maps protocol bases to their open-source frontend repos.
 * Instead of AI-generating UIs from scratch, we fork battle-tested
 * frontends and rebrand them with the user's configuration.
 */

export interface FrontendFork {
  /** Protocol base this frontend belongs to */
  baseId: string;
  /** GitHub repo URL */
  repo: string;
  /** Tech stack */
  stack: string;
  /** Key features of the frontend */
  features: string[];
  /** What gets customized when forking */
  customizable: string[];
  /** License */
  license: string;
  /** Preview description for the landing page */
  previewDescription: string;
}

export const frontendRegistry: FrontendFork[] = [
  {
    baseId: "uniswap-v2",
    repo: "https://github.com/Uniswap/interface",
    stack: "React, TypeScript, ethers.js, styled-components",
    features: [
      "Token swap",
      "Liquidity pools",
      "Pool analytics",
      "Token lists",
      "Multi-chain support",
    ],
    customizable: [
      "Branding/colors",
      "Token lists",
      "Fee display",
      "Network configuration",
      "Logo/favicon",
    ],
    license: "GPL-3.0",
    previewDescription:
      "Full-featured DEX interface with swap, pool management, and analytics",
  },
  {
    baseId: "aave-v3",
    repo: "https://github.com/aave/interface",
    stack: "React, TypeScript, ethers.js, MUI",
    features: [
      "Supply/borrow markets",
      "Health factor dashboard",
      "Governance",
      "Staking",
      "Flash loans UI",
    ],
    customizable: [
      "Branding/colors",
      "Market configuration",
      "Risk parameters display",
      "Network config",
    ],
    license: "BUSL-1.1",
    previewDescription:
      "Lending dashboard with market overview, supply/borrow forms, and health monitoring",
  },
  {
    baseId: "compound-v3",
    repo: "https://github.com/compound-finance/palisade",
    stack: "React, TypeScript, wagmi",
    features: [
      "Market dashboard",
      "Supply/withdraw",
      "Borrow/repay",
      "Rewards claiming",
      "Governance",
    ],
    customizable: [
      "Branding/colors",
      "Market assets",
      "Rate display",
      "Network configuration",
    ],
    license: "BSD-3-Clause",
    previewDescription:
      "Clean lending interface with single-market focus and rewards tracking",
  },
  {
    baseId: "gmx-v2",
    repo: "https://github.com/gmx-io/gmx-interface",
    stack: "React, TypeScript, ethers.js, Viem",
    features: [
      "Perpetual trading",
      "Swap",
      "Earn/pools",
      "Position management",
      "Referrals",
    ],
    customizable: [
      "Branding/colors",
      "Trading pairs",
      "Leverage limits",
      "Fee display",
      "Chart provider",
    ],
    license: "MIT",
    previewDescription:
      "Professional trading terminal with charts, positions, and order management",
  },
  {
    baseId: "curve-v2",
    repo: "https://github.com/curvefi/curve-frontend",
    stack: "React, TypeScript, Next.js",
    features: [
      "Pool swap",
      "Deposit/withdraw",
      "Gauge voting",
      "Pool creation",
      "Analytics",
    ],
    customizable: [
      "Branding/colors",
      "Pool types",
      "Gauge configuration",
      "Token lists",
    ],
    license: "MIT",
    previewDescription:
      "StableSwap interface with pool management, voting, and yield farming",
  },
  {
    baseId: "lido-v2",
    repo: "https://github.com/lidofinance/ethereum-staking-widget",
    stack: "React, TypeScript, Next.js, wagmi",
    features: [
      "Stake/unstake",
      "Rewards tracking",
      "Withdrawal queue",
      "APR display",
    ],
    customizable: [
      "Branding/colors",
      "Staking token",
      "Fee display",
      "Network configuration",
    ],
    license: "GPL-3.0",
    previewDescription:
      "Staking widget with real-time APR, rewards tracking, and withdrawal management",
  },
  {
    baseId: "morpho-blue",
    repo: "https://github.com/morpho-org/morpho-blue-frontend",
    stack: "React, TypeScript, Viem, wagmi",
    features: [
      "Market creation",
      "Supply/borrow",
      "Risk metrics",
      "Liquidation dashboard",
    ],
    customizable: [
      "Branding/colors",
      "Market configuration",
      "Oracle display",
      "Risk parameters",
    ],
    license: "MIT",
    previewDescription:
      "Isolated lending markets with risk-focused UI and market creation tools",
  },
  {
    baseId: "predexon",
    repo: "https://github.com/protofire/omen-exchange",
    stack: "React, TypeScript, Next.js, wagmi, Viem",
    features: [
      "Market creation wizard",
      "Binary / categorical / scalar markets",
      "Orderbook + LMSR pool trading",
      "Cross-venue price comparison (Polymarket / Kalshi)",
      "UMA dispute dashboard",
      "Portfolio & resolved markets history",
    ],
    customizable: [
      "Branding/colors",
      "Collateral token",
      "Category taxonomy (sports, politics, crypto)",
      "Predexon API keys",
      "Resolution source labeling",
    ],
    license: "GPL-3.0",
    previewDescription:
      "Prediction markets interface with market creation, cross-venue routing, and optimistic oracle resolution",
  },
];

/** Get the frontend fork info for a protocol base */
export function getFrontendForBase(
  baseId: string,
): FrontendFork | undefined {
  return frontendRegistry.find((f) => f.baseId === baseId);
}
