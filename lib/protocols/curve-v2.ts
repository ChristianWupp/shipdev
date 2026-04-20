import type { ProtocolBase } from "./types";

/**
 * Curve V2 — StableSwap + CryptoSwap AMM
 *
 * The gold standard for low-slippage swaps. Good for:
 * - Stablecoin/pegged asset swaps with near-zero slippage
 * - Crypto pools with dynamic peg for volatile pairs
 * - Deep liquidity via gauge-directed emissions
 * - Composable factory pools
 */
export const curveV2: ProtocolBase = {
  id: "curve-v2",
  name: "Curve V2",
  version: "2.0",
  description:
    "StableSwap + CryptoSwap AMM. Ultra-low slippage for pegged assets, dynamic peg crypto pools, gauge-directed emissions, and permissionless factory pools.",
  category: "stableswap",
  supportedChains: ["hyperevm-testnet", "hyperevm"],
  upstream: "Curve Finance",
  upstreamUrl: "https://github.com/curvefi/curve-contract",

  audits: [
    {
      auditor: "MixBytes",
      date: "2022-11",
      reportUrl: "https://github.com/curvefi/audits",
    },
    {
      auditor: "ChainSecurity",
      date: "2023-01",
    },
    {
      auditor: "Trail of Bits",
      date: "2022-09",
    },
  ],

  parameters: [
    // Core
    {
      key: "amplificationFactor",
      label: "Amplification Factor (A)",
      description: "StableSwap invariant parameter — higher A means tighter peg, lower slippage near equilibrium",
      type: "number",
      default: 200,
      min: 1,
      max: 10000,
      group: "core",
    },
    {
      key: "swapFee",
      label: "Swap Fee",
      description: "Fee charged on every swap, paid to liquidity providers",
      type: "percentage",
      default: 0.04,
      min: 0.01,
      max: 1.0,
      group: "core",
    },
    {
      key: "adminFee",
      label: "Admin Fee",
      description: "Fraction of swap fees directed to protocol treasury (applied on top of LP fee)",
      type: "percentage",
      default: 50,
      min: 0,
      max: 100,
      group: "core",
    },
    {
      key: "gamma",
      label: "Gamma Parameter",
      description: "CryptoSwap concentration parameter — controls liquidity concentration around the price",
      type: "number",
      default: 0.000145,
      min: 0.00001,
      max: 0.01,
      group: "core",
    },
    {
      key: "poolType",
      label: "Pool Type",
      description: "StableSwap for pegged assets, CryptoSwap for volatile pairs with dynamic peg",
      type: "select",
      default: "stableswap",
      options: ["stableswap", "cryptoswap"],
      group: "core",
    },
    {
      key: "numCoins",
      label: "Number of Pool Assets",
      description: "Number of tokens in the pool (2-4 for StableSwap, 2-3 for CryptoSwap)",
      type: "number",
      default: 2,
      min: 2,
      max: 4,
      group: "core",
    },

    // Token
    {
      key: "tokenName",
      label: "Governance Token Name",
      description: "Name of the AMM governance token",
      type: "string",
      default: "MySwap",
      group: "token",
    },
    {
      key: "tokenSymbol",
      label: "Token Symbol",
      description: "Ticker symbol",
      type: "string",
      default: "MSWAP",
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
      label: "LP Gauge Rewards",
      description: "% of total supply for liquidity gauge emissions",
      type: "percentage",
      default: 40,
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
      description: "Address with admin privileges (recommend multi-sig)",
      type: "address",
      default: "",
      group: "admin",
    },
    {
      key: "emergencyPause",
      label: "Emergency Pause",
      description: "Enable kill_me function to pause swaps in emergencies",
      type: "boolean",
      default: true,
      group: "admin",
    },
    {
      key: "upgradeability",
      label: "Upgrade Authority",
      description: "Pool contracts are immutable once deployed. Factory and gauge controllers can be governed.",
      type: "select",
      default: "immutable",
      options: ["immutable", "proxy", "proxy-with-timelock"],
      group: "admin",
    },
  ],

  contracts: [
    {
      name: "StableSwapPool",
      description: "Core pool for pegged assets using the StableSwap invariant. Handles swaps, deposits, and withdrawals.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "exchange", inputs: [{ name: "i", type: "int128" }, { name: "j", type: "int128" }, { name: "dx", type: "uint256" }, { name: "min_dy", type: "uint256" }], outputs: [{ type: "uint256" }], stateMutability: "nonpayable" },
        { type: "function", name: "add_liquidity", inputs: [{ name: "amounts", type: "uint256[]" }, { name: "min_mint_amount", type: "uint256" }], outputs: [{ type: "uint256" }], stateMutability: "nonpayable" },
        { type: "function", name: "remove_liquidity", inputs: [{ name: "amount", type: "uint256" }, { name: "min_amounts", type: "uint256[]" }], outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "nonpayable" },
        { type: "function", name: "get_virtual_price", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "CryptoSwapPool",
      description: "Pool for volatile pairs using the CryptoSwap invariant with dynamic peg and internal oracle.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "exchange", inputs: [{ name: "i", type: "uint256" }, { name: "j", type: "uint256" }, { name: "dx", type: "uint256" }, { name: "min_dy", type: "uint256" }], outputs: [{ type: "uint256" }], stateMutability: "nonpayable" },
        { type: "function", name: "add_liquidity", inputs: [{ name: "amounts", type: "uint256[]" }, { name: "min_mint_amount", type: "uint256" }], outputs: [{ type: "uint256" }], stateMutability: "nonpayable" },
        { type: "function", name: "price_oracle", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "lp_price", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "Factory",
      description: "Permissionless pool factory. Deploys new StableSwap and CryptoSwap pools with standard parameters.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "deploy_plain_pool", inputs: [{ name: "name", type: "string" }, { name: "symbol", type: "string" }, { name: "coins", type: "address[]" }, { name: "A", type: "uint256" }, { name: "fee", type: "uint256" }], outputs: [{ type: "address" }], stateMutability: "nonpayable" },
        { type: "function", name: "pool_count", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "pool_list", inputs: [{ name: "index", type: "uint256" }], outputs: [{ type: "address" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "GaugeController",
      description: "Manages liquidity gauge weights and voting for emission distribution across pools.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "vote_for_gauge_weights", inputs: [{ name: "gauge_addr", type: "address" }, { name: "user_weight", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "gauge_relative_weight", inputs: [{ name: "addr", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "get_total_weight", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "CRVToken",
      description: "Governance token with vote-escrowed locking (veCRV) for gauge weight voting and fee distribution.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "totalSupply", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "rate", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
  ],

  security: {
    baseScore: 9.3,
    privilegedRoles: [
      {
        role: "admin",
        description: "Factory and gauge controller admin — can set fee parameters and add gauge types",
        defaultHolder: "timelock",
        riskLevel: "high",
        capabilities: ["Set admin fee", "Add gauge types", "Kill pools in emergency", "Set factory parameters"],
      },
      {
        role: "gaugeManager",
        description: "Can add/remove gauges from the controller",
        defaultHolder: "multisig",
        riskLevel: "medium",
        capabilities: ["Add gauges", "Set gauge weights cap"],
      },
    ],
    emergencyControls: [
      {
        name: "Pool Kill",
        description: "Kill switch (kill_me) that disables swaps on a pool — withdrawals remain open",
        enabled: true,
        controlledBy: "admin",
      },
      {
        name: "Gauge Pause",
        description: "Pause reward distribution for a specific gauge",
        enabled: true,
        controlledBy: "admin",
      },
    ],
    upgradeability: "immutable",
    upgradeDescription:
      "Pool contracts are immutable once deployed — no proxy pattern. Factory and GaugeController are governed but pools cannot be upgraded.",
  },
};
