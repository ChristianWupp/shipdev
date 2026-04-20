import type { ProtocolBase } from "./types";

/**
 * Compound V3 (Comet) — single-asset lending
 *
 * Simplified lending model. Good for:
 * - Single borrow asset per market (e.g., USDC)
 * - Multiple collateral types
 * - Lower gas costs than multi-asset pools
 * - Revenue-sharing tokenomics with COMP-style governance
 */
export const compoundV3: ProtocolBase = {
  id: "compound-v3",
  name: "Compound V3",
  version: "1.0",
  description:
    "Single-asset lending protocol (Comet). One borrow asset per market, multiple collaterals. Gas-efficient, battle-tested, governance-ready.",
  category: "lending",
  supportedChains: ["hyperevm-testnet", "hyperevm"],
  upstream: "Compound III (Comet)",
  upstreamUrl: "https://github.com/compound-finance/comet",

  audits: [
    {
      auditor: "OpenZeppelin",
      date: "2022-08",
      reportUrl: "https://github.com/compound-finance/comet/tree/main/audits",
    },
    {
      auditor: "ChainSecurity",
      date: "2022-07",
    },
  ],

  parameters: [
    // Core
    {
      key: "baseToken",
      label: "Base (Borrow) Token",
      description: "The single asset users borrow in this market (e.g., USDC, WHYPE)",
      type: "select",
      default: "USDC",
      options: ["USDC", "WHYPE", "WETH", "USDH"],
      group: "core",
    },
    {
      key: "supplyRate",
      label: "Base Supply APR",
      description: "Annual supply rate at 0% utilization",
      type: "percentage",
      default: 1.5,
      min: 0,
      max: 10,
      group: "core",
    },
    {
      key: "borrowRate",
      label: "Base Borrow APR",
      description: "Annual borrow rate at 0% utilization",
      type: "percentage",
      default: 3.0,
      min: 0.5,
      max: 15,
      group: "core",
    },
    {
      key: "utilizationKink",
      label: "Utilization Kink",
      description: "Target utilization — rate curve steepens above this",
      type: "percentage",
      default: 80,
      min: 50,
      max: 95,
      group: "core",
    },
    {
      key: "liquidationFactor",
      label: "Liquidation Factor",
      description: "Collateral ratio at which liquidation triggers",
      type: "percentage",
      default: 83,
      min: 50,
      max: 95,
      group: "core",
    },
    {
      key: "liquidationPenalty",
      label: "Liquidation Penalty",
      description: "Fee charged to borrowers on liquidation",
      type: "percentage",
      default: 5,
      min: 1,
      max: 20,
      group: "core",
    },
    {
      key: "reserveRate",
      label: "Reserve Rate",
      description: "% of borrow interest going to protocol reserves",
      type: "percentage",
      default: 15,
      min: 0,
      max: 50,
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
      description: "% for protocol usage incentives",
      type: "percentage",
      default: 35,
      min: 0,
      max: 100,
      group: "token",
    },
    {
      key: "teamAlloc",
      label: "Team Allocation",
      description: "% for the team",
      type: "percentage",
      default: 15,
      min: 0,
      max: 30,
      group: "token",
    },
    {
      key: "treasuryAlloc",
      label: "Treasury",
      description: "% for protocol treasury and insurance fund",
      type: "percentage",
      default: 25,
      min: 0,
      max: 50,
      group: "token",
    },
    {
      key: "communityAlloc",
      label: "Community / Airdrop",
      description: "% for community distribution",
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
      name: "Comet",
      description: "Core lending market — supply, borrow, repay, liquidate, absorb",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "supply", inputs: [{ name: "asset", type: "address" }, { name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "withdraw", inputs: [{ name: "asset", type: "address" }, { name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "borrow", inputs: [{ name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "absorb", inputs: [{ name: "absorber", type: "address" }, { name: "accounts", type: "address[]" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "getUtilization", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "CometRewards",
      description: "Distributes governance token rewards to suppliers and borrowers",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "claim", inputs: [{ name: "comet", type: "address" }, { name: "src", type: "address" }, { name: "shouldAccrue", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
      ],
      bytecode: "0x",
    },
    {
      name: "CometProxyAdmin",
      description: "Manages proxy upgrades with timelock",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "upgrade", inputs: [{ name: "proxy", type: "address" }, { name: "implementation", type: "address" }], outputs: [], stateMutability: "nonpayable" },
      ],
      bytecode: "0x",
    },
  ],

  security: {
    baseScore: 9.3,
    privilegedRoles: [
      {
        role: "governor",
        description: "Governance contract controlling protocol parameters",
        defaultHolder: "timelock",
        riskLevel: "high",
        capabilities: ["Upgrade contracts", "Set rates", "Add collateral assets", "Pause markets"],
      },
      {
        role: "pauseGuardian",
        description: "Can pause supply/borrow/liquidation in emergencies",
        defaultHolder: "multisig",
        riskLevel: "medium",
        capabilities: ["Pause protocol"],
      },
    ],
    emergencyControls: [
      {
        name: "Supply Pause",
        description: "Pause new deposits",
        enabled: true,
        controlledBy: "pauseGuardian",
      },
      {
        name: "Borrow Pause",
        description: "Pause new borrows",
        enabled: true,
        controlledBy: "pauseGuardian",
      },
      {
        name: "Absorb Pause",
        description: "Pause liquidations",
        enabled: true,
        controlledBy: "pauseGuardian",
      },
    ],
    upgradeability: "proxy-with-timelock",
    upgradeDescription: "Comet uses a proxy pattern governed by a timelock contract. Upgrades require governance vote + delay.",
  },
};
