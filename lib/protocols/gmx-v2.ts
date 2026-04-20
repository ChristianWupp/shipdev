import type { ProtocolBase } from "./types";

/**
 * GMX V2 — decentralized perpetuals exchange
 *
 * High-leverage perpetual trading with multi-asset pools. Good for:
 * - Perpetual futures with up to 50x leverage
 * - GM liquidity pools with auto-rebalancing
 * - Low-slippage execution via oracle-based pricing
 * - Revenue sharing with liquidity providers
 */
export const gmxV2: ProtocolBase = {
  id: "gmx-v2",
  name: "GMX V2",
  version: "2.0",
  description:
    "Decentralized perpetuals exchange with GM liquidity pools, oracle-based pricing, up to 50x leverage, and revenue sharing with LPs.",
  category: "perpetuals",
  supportedChains: ["hyperevm-testnet", "hyperevm"],
  upstream: "GMX V2",
  upstreamUrl: "https://github.com/gmx-io/gmx-synthetics",

  audits: [
    {
      auditor: "Trail of Bits",
      date: "2023-03",
      reportUrl: "https://github.com/gmx-io/gmx-synthetics/tree/main/audits",
    },
    {
      auditor: "ABDK Consulting",
      date: "2023-05",
    },
  ],

  parameters: [
    // Core
    {
      key: "maxLeverage",
      label: "Max Leverage",
      description: "Maximum allowed leverage for perpetual positions",
      type: "number",
      default: 50,
      min: 2,
      max: 100,
      group: "core",
    },
    {
      key: "fundingRateFactor",
      label: "Funding Rate Factor",
      description: "Multiplier for funding rate calculation — higher values mean funding adjusts faster",
      type: "number",
      default: 100,
      min: 10,
      max: 1000,
      group: "core",
    },
    {
      key: "positionFeeBps",
      label: "Position Fee",
      description: "Fee charged on opening and closing positions (basis points)",
      type: "percentage",
      default: 0.1,
      min: 0.01,
      max: 0.5,
      group: "core",
    },
    {
      key: "liquidationFee",
      label: "Liquidation Fee",
      description: "Fixed fee deducted from collateral on liquidation",
      type: "number",
      default: 5,
      min: 1,
      max: 20,
      group: "core",
    },
    {
      key: "keeperFee",
      label: "Keeper Fee",
      description: "Gas compensation paid to keepers for executing orders",
      type: "number",
      default: 0.2,
      min: 0.01,
      max: 1,
      group: "core",
    },
    {
      key: "gmPoolComposition",
      label: "GM Pool Composition",
      description: "How GM pool value is split between long and short tokens",
      type: "select",
      default: "50/50",
      options: ["50/50", "70/30", "80/20"],
      group: "core",
    },
    {
      key: "swapFeeBps",
      label: "Swap Fee",
      description: "Fee for direct token swaps through the vault",
      type: "percentage",
      default: 0.3,
      min: 0.01,
      max: 1.0,
      group: "core",
    },

    // Token
    {
      key: "tokenName",
      label: "Governance Token Name",
      description: "Name of the perpetuals protocol governance token",
      type: "string",
      default: "MyPerp",
      group: "token",
    },
    {
      key: "tokenSymbol",
      label: "Token Symbol",
      description: "Ticker symbol",
      type: "string",
      default: "MPERP",
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
      label: "GM/LP Rewards",
      description: "% of total supply for liquidity provider incentives",
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
      description: "% of total supply for protocol treasury and insurance fund",
      type: "percentage",
      default: 20,
      min: 0,
      max: 50,
      group: "token",
    },
    {
      key: "communityAlloc",
      label: "Community / Airdrop",
      description: "% of total supply for community distribution",
      type: "percentage",
      default: 30,
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
      description: "Address with admin privileges (recommend multi-sig for mainnet)",
      type: "address",
      default: "",
      group: "admin",
    },
    {
      key: "emergencyPause",
      label: "Emergency Pause",
      description: "Enable pause function for security incidents",
      type: "boolean",
      default: true,
      group: "admin",
    },
    {
      key: "upgradeability",
      label: "Upgrade Authority",
      description: "Whether contracts can be upgraded after deployment",
      type: "select",
      default: "proxy-with-timelock",
      options: ["immutable", "proxy", "proxy-with-timelock"],
      group: "admin",
    },
  ],

  contracts: [
    {
      name: "Vault",
      description: "Core vault holding all pool assets. Manages deposits, withdrawals, and position collateral.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "deposit", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "withdraw", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }, { name: "receiver", type: "address" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "getPoolAmount", inputs: [{ name: "token", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "getReservedAmount", inputs: [{ name: "token", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "Router",
      description: "Entry point for user interactions — routes swap and position requests to the correct handler.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "swap", inputs: [{ name: "path", type: "address[]" }, { name: "amountIn", type: "uint256" }, { name: "minOut", type: "uint256" }, { name: "receiver", type: "address" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "approvePlugin", inputs: [{ name: "plugin", type: "address" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "pluginTransfer", inputs: [{ name: "token", type: "address" }, { name: "account", type: "address" }, { name: "receiver", type: "address" }, { name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
      ],
      bytecode: "0x",
    },
    {
      name: "PositionRouter",
      description: "Handles leveraged position creation and closure with keeper-based execution.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "createIncreasePosition", inputs: [{ name: "path", type: "address[]" }, { name: "indexToken", type: "address" }, { name: "amountIn", type: "uint256" }, { name: "minOut", type: "uint256" }, { name: "sizeDelta", type: "uint256" }, { name: "isLong", type: "bool" }, { name: "acceptablePrice", type: "uint256" }], outputs: [], stateMutability: "payable" },
        { type: "function", name: "createDecreasePosition", inputs: [{ name: "path", type: "address[]" }, { name: "indexToken", type: "address" }, { name: "collateralDelta", type: "uint256" }, { name: "sizeDelta", type: "uint256" }, { name: "isLong", type: "bool" }, { name: "receiver", type: "address" }, { name: "acceptablePrice", type: "uint256" }], outputs: [], stateMutability: "payable" },
        { type: "function", name: "executeIncreasePosition", inputs: [{ name: "key", type: "bytes32" }, { name: "executionFee", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
      ],
      bytecode: "0x",
    },
    {
      name: "OrderBook",
      description: "Manages limit orders and stop-loss/take-profit orders for perpetual positions.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "createIncreaseOrder", inputs: [{ name: "path", type: "address[]" }, { name: "amountIn", type: "uint256" }, { name: "indexToken", type: "address" }, { name: "minOut", type: "uint256" }, { name: "sizeDelta", type: "uint256" }, { name: "isLong", type: "bool" }, { name: "triggerPrice", type: "uint256" }, { name: "triggerAboveThreshold", type: "bool" }], outputs: [], stateMutability: "payable" },
        { type: "function", name: "cancelIncreaseOrder", inputs: [{ name: "orderIndex", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "executeIncreaseOrder", inputs: [{ name: "account", type: "address" }, { name: "orderIndex", type: "uint256" }, { name: "feeReceiver", type: "address" }], outputs: [], stateMutability: "nonpayable" },
      ],
      bytecode: "0x",
    },
    {
      name: "GlpManager",
      description: "Manages GM/GLP pool token minting and redemption. Controls pool composition and rebalancing.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "addLiquidity", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }, { name: "minUsdg", type: "uint256" }, { name: "minGlp", type: "uint256" }], outputs: [{ type: "uint256" }], stateMutability: "nonpayable" },
        { type: "function", name: "removeLiquidity", inputs: [{ name: "tokenOut", type: "address" }, { name: "glpAmount", type: "uint256" }, { name: "minOut", type: "uint256" }, { name: "receiver", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "nonpayable" },
        { type: "function", name: "getAum", inputs: [{ name: "maximise", type: "bool" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
  ],

  security: {
    baseScore: 9.0,
    privilegedRoles: [
      {
        role: "gov",
        description: "Governance address controlling protocol parameters and fee distribution",
        defaultHolder: "timelock",
        riskLevel: "high",
        capabilities: ["Set fees", "Configure leverage limits", "Add markets", "Set keeper addresses"],
      },
      {
        role: "keeper",
        description: "Automated keeper that executes pending orders and position requests",
        defaultHolder: "multisig",
        riskLevel: "medium",
        capabilities: ["Execute pending orders", "Execute position requests", "Liquidate positions"],
      },
      {
        role: "liquidator",
        description: "Can trigger liquidation of underwater positions",
        defaultHolder: "none",
        riskLevel: "low",
        capabilities: ["Liquidate undercollateralized positions"],
      },
    ],
    emergencyControls: [
      {
        name: "Trading Pause",
        description: "Pause all new position creation and order execution",
        enabled: true,
        controlledBy: "gov",
      },
      {
        name: "Deposit Pause",
        description: "Pause new GM/GLP pool deposits",
        enabled: true,
        controlledBy: "gov",
      },
      {
        name: "Withdrawal Guard",
        description: "Rate-limit large withdrawals during incidents",
        enabled: true,
        controlledBy: "gov",
      },
    ],
    upgradeability: "proxy-with-timelock",
    upgradeDescription:
      "Core contracts use proxy pattern with a 24-hour timelock. Parameter changes require governance approval.",
  },
};
