import type { ProtocolBase } from "./types";

/**
 * Uniswap V2 — constant product AMM
 *
 * The simplest and most battle-tested DEX base. Good for:
 * - Standard token swaps with x*y=k invariant
 * - LP provision without concentrated liquidity complexity
 * - Projects that want simplicity and proven security
 */
export const uniswapV2: ProtocolBase = {
  id: "uniswap-v2",
  name: "Uniswap V2",
  version: "1.0.1",
  description:
    "Constant product AMM. The most forked DEX in crypto history. Simple x*y=k invariant, permissionless pair creation, flash swaps.",
  category: "dex",
  supportedChains: ["hyperevm-testnet", "hyperevm"],
  upstream: "Uniswap V2",
  upstreamUrl: "https://github.com/Uniswap/v2-core",

  audits: [
    {
      auditor: "dapp.org",
      date: "2020-02",
      reportUrl: "https://uniswap.org/audit.html",
    },
    {
      auditor: "OpenZeppelin (periphery)",
      date: "2020-04",
    },
  ],

  parameters: [
    // Core
    {
      key: "feeTier",
      label: "Swap Fee",
      description: "Fee charged on every swap, paid to liquidity providers",
      type: "percentage",
      default: 0.3,
      min: 0.01,
      max: 1.0,
      group: "core",
    },
    {
      key: "protocolFee",
      label: "Protocol Fee",
      description:
        "Fraction of swap fees sent to protocol treasury (0 = off, max 1/6 of LP fee)",
      type: "percentage",
      default: 0,
      min: 0,
      max: 0.05,
      group: "core",
    },
    {
      key: "wrappedNative",
      label: "Wrapped Native Token",
      description: "Address of the WHYPE token on HyperEVM",
      type: "address",
      default: "0x0000000000000000000000000000000000000000",
      group: "core",
    },

    // Token
    {
      key: "tokenName",
      label: "Governance Token Name",
      description: "Name of the DEX governance token",
      type: "string",
      default: "MyDEX",
      group: "token",
    },
    {
      key: "tokenSymbol",
      label: "Token Symbol",
      description: "Ticker symbol",
      type: "string",
      default: "MDEX",
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
      label: "LP Rewards Allocation",
      description: "% of total supply allocated to LP incentives",
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

    // Nest Integration (HyperEVM only)
    {
      key: "nestEnabled",
      label: "Nest Integration",
      description:
        "Create a Nest pool for instant liquidity on HyperEVM. Recommended — gives your token a live market from block one.",
      type: "boolean",
      default: true,
      group: "nest",
    },
    {
      key: "nestPoolType",
      label: "Nest Pool Type",
      description: "Classic AMM (x*y=k) or Concentrated Liquidity (CLAMM)",
      type: "select",
      default: "classic",
      options: ["classic", "clamm"],
      group: "nest",
    },
    {
      key: "nestQuoteToken",
      label: "Quote Token",
      description: "Pair your token against WHYPE (native) or USDH (stablecoin)",
      type: "select",
      default: "WHYPE",
      options: ["WHYPE", "USDH"],
      group: "nest",
    },
    {
      key: "nestInitialLiquidityPct",
      label: "Initial LP Allocation",
      description: "% of token supply to seed as initial liquidity on Nest",
      type: "percentage",
      default: 5,
      min: 0,
      max: 20,
      group: "nest",
    },
    {
      key: "nestBribeAllocationPct",
      label: "Egg Initiative Budget",
      description:
        "% of token supply for Egg Initiative bribes — attracts veNEST voters to direct emissions to your pool",
      type: "percentage",
      default: 2,
      min: 0,
      max: 10,
      group: "nest",
    },
    {
      key: "nestBribeEpochs",
      label: "Bribe Duration (epochs)",
      description: "Number of weekly epochs to spread bribes across",
      type: "number",
      default: 4,
      min: 1,
      max: 12,
      group: "nest",
    },

    // Admin
    {
      key: "owner",
      label: "Owner",
      description:
        "Address with admin privileges (recommend multi-sig for mainnet)",
      type: "address",
      default: "",
      group: "admin",
    },
    {
      key: "emergencyPause",
      label: "Emergency Pause",
      description: "Enable a pause function for security incidents",
      type: "boolean",
      default: true,
      group: "admin",
    },
    {
      key: "upgradeability",
      label: "Upgrade Authority",
      description: "Whether contracts can be upgraded after deployment",
      type: "select",
      default: "immutable",
      options: ["immutable", "proxy", "proxy-with-timelock"],
      group: "admin",
    },
  ],

  contracts: [
    {
      name: "UniswapV2Factory",
      description:
        "Creates and manages trading pairs. Stores fee configuration.",
      auditStatus: "audited",
      abi: [
        {
          type: "constructor",
          inputs: [{ name: "_feeToSetter", type: "address" }],
        },
        {
          type: "function",
          name: "createPair",
          inputs: [
            { name: "tokenA", type: "address" },
            { name: "tokenB", type: "address" },
          ],
          outputs: [{ name: "pair", type: "address" }],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "allPairsLength",
          inputs: [],
          outputs: [{ type: "uint256" }],
          stateMutability: "view",
        },
      ],
      bytecode: "0x", // placeholder — real bytecode loaded at compile time
    },
    {
      name: "UniswapV2Router02",
      description:
        "Main entry point for swaps and liquidity operations. Handles multi-hop routing.",
      auditStatus: "audited",
      abi: [
        {
          type: "constructor",
          inputs: [
            { name: "_factory", type: "address" },
            { name: "_WETH", type: "address" },
          ],
        },
        {
          type: "function",
          name: "swapExactTokensForTokens",
          inputs: [
            { name: "amountIn", type: "uint256" },
            { name: "amountOutMin", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "to", type: "address" },
            { name: "deadline", type: "uint256" },
          ],
          outputs: [{ name: "amounts", type: "uint256[]" }],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "addLiquidity",
          inputs: [
            { name: "tokenA", type: "address" },
            { name: "tokenB", type: "address" },
            { name: "amountADesired", type: "uint256" },
            { name: "amountBDesired", type: "uint256" },
            { name: "amountAMin", type: "uint256" },
            { name: "amountBMin", type: "uint256" },
            { name: "to", type: "address" },
            { name: "deadline", type: "uint256" },
          ],
          outputs: [
            { name: "amountA", type: "uint256" },
            { name: "amountB", type: "uint256" },
            { name: "liquidity", type: "uint256" },
          ],
          stateMutability: "nonpayable",
        },
      ],
      bytecode: "0x",
    },
    {
      name: "UniswapV2Pair",
      description:
        "Individual trading pair. Holds reserves, handles swaps, mints/burns LP tokens.",
      auditStatus: "audited",
      abi: [
        {
          type: "function",
          name: "getReserves",
          inputs: [],
          outputs: [
            { name: "reserve0", type: "uint112" },
            { name: "reserve1", type: "uint112" },
            { name: "blockTimestampLast", type: "uint32" },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "swap",
          inputs: [
            { name: "amount0Out", type: "uint256" },
            { name: "amount1Out", type: "uint256" },
            { name: "to", type: "address" },
            { name: "data", type: "bytes" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      bytecode: "0x",
    },
  ],

  security: {
    baseScore: 9.1,
    privilegedRoles: [
      {
        role: "feeToSetter",
        description: "Can change the fee recipient address",
        defaultHolder: "owner",
        riskLevel: "medium",
        capabilities: ["Set protocol fee recipient", "Enable/disable protocol fee"],
      },
      {
        role: "owner",
        description: "Admin of the factory and token contracts",
        defaultHolder: "owner",
        riskLevel: "high",
        capabilities: [
          "Change feeToSetter",
          "Pause contracts (if enabled)",
          "Manage token allocations",
        ],
      },
    ],
    emergencyControls: [
      {
        name: "Emergency Pause",
        description: "Pause all swap and liquidity operations",
        enabled: true,
        controlledBy: "owner",
      },
      {
        name: "Emergency Withdraw",
        description: "Allow LPs to withdraw during pause",
        enabled: true,
        controlledBy: "owner",
      },
    ],
    upgradeability: "immutable",
    upgradeDescription:
      "Contracts are immutable by default. No proxy pattern. Once deployed, code cannot be changed.",
  },
};
