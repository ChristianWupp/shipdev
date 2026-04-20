import type { ProtocolBase } from "./types";

/**
 * Morpho Blue — isolated lending protocol
 *
 * Minimal, permissionless lending primitive. Good for:
 * - Isolated lending markets with custom risk parameters
 * - Minimal governance surface — immutable singleton contract
 * - Any oracle + any collateral + any loan asset combinations
 * - Gas-efficient single-contract architecture
 */
export const morphoBlue: ProtocolBase = {
  id: "morpho-blue",
  name: "Morpho Blue",
  version: "1.0",
  description:
    "Immutable, permissionless isolated lending protocol. Singleton contract, custom LLTV per market, pluggable oracles and interest rate models. Minimal governance surface.",
  category: "lending",
  supportedChains: ["hyperevm-testnet", "hyperevm"],
  upstream: "Morpho Blue",
  upstreamUrl: "https://github.com/morpho-org/morpho-blue",

  audits: [
    {
      auditor: "Spearbit",
      date: "2024-01",
      reportUrl: "https://github.com/morpho-org/morpho-blue/tree/main/audits",
    },
    {
      auditor: "Cantina",
      date: "2023-11",
    },
  ],

  parameters: [
    // Core
    {
      key: "lltv",
      label: "Liquidation LTV (LLTV)",
      description: "Loan-to-value ratio at which positions become liquidatable",
      type: "percentage",
      default: 86,
      min: 50,
      max: 98,
      group: "core",
    },
    {
      key: "oracleType",
      label: "Oracle Type",
      description: "Price oracle adapter to use for collateral valuation",
      type: "select",
      default: "chainlink",
      options: ["chainlink", "pyth", "redstone", "custom"],
      group: "core",
    },
    {
      key: "interestRateModel",
      label: "Interest Rate Model",
      description: "IRM used for this market — adaptive adjusts rates based on utilization target",
      type: "select",
      default: "adaptive",
      options: ["adaptive", "linear", "custom"],
      group: "core",
    },
    {
      key: "fee",
      label: "Protocol Fee",
      description: "Fee on interest accrued, taken by the protocol (set by governance)",
      type: "percentage",
      default: 0,
      min: 0,
      max: 25,
      group: "core",
    },
    {
      key: "liquidationIncentive",
      label: "Liquidation Incentive",
      description: "Bonus collateral liquidators receive as incentive",
      type: "percentage",
      default: 5,
      min: 1,
      max: 15,
      group: "core",
    },
    {
      key: "targetUtilization",
      label: "Target Utilization",
      description: "Utilization rate the adaptive IRM targets — rates adjust to push toward this",
      type: "percentage",
      default: 90,
      min: 50,
      max: 99,
      group: "core",
    },

    // Token
    {
      key: "tokenName",
      label: "Governance Token Name",
      description: "Name of the protocol's governance token",
      type: "string",
      default: "MyLend",
      group: "token",
    },
    {
      key: "tokenSymbol",
      label: "Token Symbol",
      description: "Ticker symbol",
      type: "string",
      default: "MLEND",
      group: "token",
    },
    {
      key: "tokenSupply",
      label: "Total Supply",
      description: "Total governance token supply",
      type: "number",
      default: 100_000_000,
      min: 1_000,
      max: 1_000_000_000_000,
      group: "token",
    },
    {
      key: "lpRewardsAlloc",
      label: "Lender/Borrower Rewards",
      description: "% of total supply for protocol incentives",
      type: "percentage",
      default: 35,
      min: 0,
      max: 100,
      group: "token",
    },
    {
      key: "teamAlloc",
      label: "Team Allocation",
      description: "% of total supply for the team",
      type: "percentage",
      default: 15,
      min: 0,
      max: 30,
      group: "token",
    },
    {
      key: "treasuryAlloc",
      label: "Treasury Allocation",
      description: "% of total supply for protocol treasury",
      type: "percentage",
      default: 25,
      min: 0,
      max: 50,
      group: "token",
    },
    {
      key: "communityAlloc",
      label: "Community / Airdrop",
      description: "% of total supply for community distribution",
      type: "percentage",
      default: 25,
      min: 0,
      max: 100,
      group: "token",
    },
    {
      key: "vestingCliff",
      label: "Team Vesting Cliff",
      description: "Months before team tokens start unlocking",
      type: "number",
      default: 6,
      min: 0,
      max: 24,
      group: "token",
    },
    {
      key: "vestingDuration",
      label: "Team Vesting Duration",
      description: "Total months for linear vesting after cliff",
      type: "number",
      default: 24,
      min: 6,
      max: 48,
      group: "token",
    },

    // Nest
    {
      key: "nestEnabled",
      label: "Nest Integration",
      description: "Create a Nest pool for the governance token on HyperEVM",
      type: "boolean",
      default: true,
      group: "nest",
    },
    {
      key: "nestPoolType",
      label: "Nest Pool Type",
      description: "Classic AMM or Concentrated Liquidity",
      type: "select",
      default: "classic",
      options: ["classic", "clamm"],
      group: "nest",
    },

    // Admin
    {
      key: "owner",
      label: "Owner / Admin",
      description: "Address that can set protocol fees — only privileged role. Recommend multi-sig.",
      type: "address",
      default: "",
      group: "admin",
    },
    {
      key: "emergencyPause",
      label: "Emergency Pause",
      description: "No global pause — Morpho Blue is immutable. Market creators can pause individual markets via oracle disabling.",
      type: "boolean",
      default: false,
      group: "admin",
    },
    {
      key: "upgradeability",
      label: "Upgrade Authority",
      description: "Morpho Blue is immutable — no proxy pattern, no upgrades possible",
      type: "select",
      default: "immutable",
      options: ["immutable"],
      group: "admin",
    },
  ],

  contracts: [
    {
      name: "Morpho",
      description: "Singleton lending contract. All markets share one contract — handles supply, borrow, repay, liquidate, and market creation.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "createMarket", inputs: [{ name: "marketParams", type: "tuple" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "supply", inputs: [{ name: "marketParams", type: "tuple" }, { name: "assets", type: "uint256" }, { name: "shares", type: "uint256" }, { name: "onBehalf", type: "address" }, { name: "data", type: "bytes" }], outputs: [{ name: "assetsSupplied", type: "uint256" }, { name: "sharesSupplied", type: "uint256" }], stateMutability: "nonpayable" },
        { type: "function", name: "borrow", inputs: [{ name: "marketParams", type: "tuple" }, { name: "assets", type: "uint256" }, { name: "shares", type: "uint256" }, { name: "onBehalf", type: "address" }, { name: "receiver", type: "address" }], outputs: [{ name: "assetsBorrowed", type: "uint256" }, { name: "sharesBorrowed", type: "uint256" }], stateMutability: "nonpayable" },
        { type: "function", name: "repay", inputs: [{ name: "marketParams", type: "tuple" }, { name: "assets", type: "uint256" }, { name: "shares", type: "uint256" }, { name: "onBehalf", type: "address" }, { name: "data", type: "bytes" }], outputs: [{ name: "assetsRepaid", type: "uint256" }, { name: "sharesRepaid", type: "uint256" }], stateMutability: "nonpayable" },
        { type: "function", name: "liquidate", inputs: [{ name: "marketParams", type: "tuple" }, { name: "borrower", type: "address" }, { name: "seizedAssets", type: "uint256" }, { name: "repaidShares", type: "uint256" }, { name: "data", type: "bytes" }], outputs: [{ name: "assetsSeized", type: "uint256" }, { name: "assetsRepaid", type: "uint256" }], stateMutability: "nonpayable" },
      ],
      bytecode: "0x",
    },
    {
      name: "AdaptiveIrm",
      description: "Adaptive interest rate model that adjusts rates to target a specific utilization rate.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "borrowRate", inputs: [{ name: "marketParams", type: "tuple" }, { name: "market", type: "tuple" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "borrowRateView", inputs: [{ name: "marketParams", type: "tuple" }, { name: "market", type: "tuple" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "rateAtTarget", inputs: [{ name: "id", type: "bytes32" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "OracleAdapter",
      description: "Oracle adapter that normalizes price feeds for Morpho Blue markets. Supports Chainlink, Pyth, and custom feeds.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "price", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "BASE_FEED", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
        { type: "function", name: "QUOTE_FEED", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
  ],

  security: {
    baseScore: 9.5,
    privilegedRoles: [
      {
        role: "owner",
        description: "Can set protocol fee and fee recipient — only privileged function on the singleton",
        defaultHolder: "multisig",
        riskLevel: "low",
        capabilities: ["Set protocol fee", "Set fee recipient"],
      },
    ],
    emergencyControls: [
      {
        name: "No Global Pause",
        description: "Morpho Blue has no pause function — the contract is fully immutable with no admin kill switch",
        enabled: false,
        controlledBy: "none",
      },
    ],
    upgradeability: "immutable",
    upgradeDescription:
      "Morpho Blue is fully immutable. No proxy pattern, no admin upgrades. The singleton contract cannot be changed after deployment. Minimal governance surface by design.",
  },
};
