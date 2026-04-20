import type { ProtocolBase } from "./types";

/**
 * Lido V2 — liquid staking protocol
 *
 * The leading liquid staking solution. Good for:
 * - Staking native tokens and receiving liquid staking derivatives (stETH)
 * - Maintaining liquidity while earning staking rewards
 * - Permissionless withdrawals via the WithdrawalQueue
 * - Distributed validator set via StakingRouter
 */
export const lidoV2: ProtocolBase = {
  id: "lido-v2",
  name: "Lido V2",
  version: "2.0",
  description:
    "Liquid staking protocol. Stake native tokens, receive stETH liquid staking derivative, earn rewards while maintaining full DeFi composability.",
  category: "staking",
  supportedChains: ["hyperevm-testnet", "hyperevm"],
  upstream: "Lido V2",
  upstreamUrl: "https://github.com/lidofinance/lido-dao",

  audits: [
    {
      auditor: "MixBytes",
      date: "2023-05",
      reportUrl: "https://github.com/lidofinance/audits",
    },
    {
      auditor: "Sigma Prime",
      date: "2023-04",
    },
    {
      auditor: "Statemind",
      date: "2023-03",
    },
  ],

  parameters: [
    // Core
    {
      key: "stakingFee",
      label: "Staking Fee",
      description: "Fee charged on staking rewards, split between node operators and protocol treasury",
      type: "percentage",
      default: 10,
      min: 0,
      max: 25,
      group: "core",
    },
    {
      key: "withdrawalFee",
      label: "Withdrawal Fee",
      description: "Fee for processing withdrawal requests (set to 0 in most configurations)",
      type: "percentage",
      default: 0,
      min: 0,
      max: 5,
      group: "core",
    },
    {
      key: "oracleCommitteeSize",
      label: "Oracle Committee Size",
      description: "Number of oracle members required to report consensus on rewards",
      type: "number",
      default: 5,
      min: 3,
      max: 15,
      group: "core",
    },
    {
      key: "oracleQuorum",
      label: "Oracle Quorum",
      description: "Minimum oracle members needed to agree for a valid report",
      type: "number",
      default: 3,
      min: 2,
      max: 10,
      group: "core",
    },
    {
      key: "stakingLimit",
      label: "Staking Limit",
      description: "Maximum total stake allowed in the protocol (0 = unlimited)",
      type: "number",
      default: 0,
      min: 0,
      max: 1_000_000_000,
      group: "core",
    },
    {
      key: "rewardsDistribution",
      label: "Rewards Distribution",
      description: "How staking rewards are distributed: rebase (automatic) or claim-based",
      type: "select",
      default: "rebase",
      options: ["rebase", "claim"],
      group: "core",
    },
    {
      key: "nodeOperatorFeeShare",
      label: "Node Operator Fee Share",
      description: "% of the staking fee that goes to node operators (remainder goes to treasury)",
      type: "percentage",
      default: 50,
      min: 0,
      max: 100,
      group: "core",
    },

    // Token
    {
      key: "tokenName",
      label: "Staking Token Name",
      description: "Name of the liquid staking derivative token",
      type: "string",
      default: "MyStaked",
      group: "token",
    },
    {
      key: "tokenSymbol",
      label: "Token Symbol",
      description: "Ticker symbol for the staking derivative",
      type: "string",
      default: "mstETH",
      group: "token",
    },
    {
      key: "tokenSupply",
      label: "Governance Token Supply",
      description: "Total supply of the governance token (separate from the staking derivative)",
      type: "number",
      default: 100_000_000,
      min: 1_000,
      max: 1_000_000_000_000,
      group: "token",
    },
    {
      key: "lpRewardsAlloc",
      label: "Staker Rewards",
      description: "% of governance token supply for staker incentives",
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
      description: "Create a Nest pool for the staking derivative on HyperEVM",
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
      description: "Enable pause function for security incidents — pauses staking and withdrawals",
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
      name: "Lido",
      description: "Core staking contract (stETH). Handles deposits, reward distribution, and rebasing balance.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "submit", inputs: [{ name: "referral", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "payable" },
        { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "getTotalShares", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "getTotalPooledEther", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "getSharesByPooledEth", inputs: [{ name: "ethAmount", type: "uint256" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "WithdrawalQueue",
      description: "Manages stETH withdrawal requests. Users request withdrawals, claim after finalization.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "requestWithdrawals", inputs: [{ name: "amounts", type: "uint256[]" }, { name: "owner", type: "address" }], outputs: [{ name: "requestIds", type: "uint256[]" }], stateMutability: "nonpayable" },
        { type: "function", name: "claimWithdrawals", inputs: [{ name: "requestIds", type: "uint256[]" }, { name: "hints", type: "uint256[]" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "getWithdrawalStatus", inputs: [{ name: "requestIds", type: "uint256[]" }], outputs: [{ name: "statuses", type: "tuple[]" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "StakingRouter",
      description: "Routes stake across node operator modules. Manages operator registry and stake allocation.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "getStakingModules", inputs: [], outputs: [{ name: "modules", type: "tuple[]" }], stateMutability: "view" },
        { type: "function", name: "deposit", inputs: [{ name: "depositsCount", type: "uint256" }, { name: "stakingModuleId", type: "uint256" }, { name: "depositCalldata", type: "bytes" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "getStakingModuleStatus", inputs: [{ name: "stakingModuleId", type: "uint256" }], outputs: [{ type: "uint8" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "AccountingOracle",
      description: "Receives oracle reports on consensus layer balances and distributes rewards.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "submitReportData", inputs: [{ name: "data", type: "tuple" }, { name: "contractVersion", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "getLastProcessingRefSlot", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "getConsensusVersion", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
  ],

  security: {
    baseScore: 9.2,
    privilegedRoles: [
      {
        role: "agent",
        description: "DAO agent (Aragon) controlling protocol upgrades and parameter changes",
        defaultHolder: "timelock",
        riskLevel: "high",
        capabilities: ["Upgrade contracts", "Set fee parameters", "Manage staking modules", "Set staking limits"],
      },
      {
        role: "oracleMember",
        description: "Oracle committee member reporting consensus layer state",
        defaultHolder: "multisig",
        riskLevel: "medium",
        capabilities: ["Submit oracle reports", "Vote on consensus"],
      },
      {
        role: "nodeOperatorManager",
        description: "Manages the set of active node operators",
        defaultHolder: "multisig",
        riskLevel: "medium",
        capabilities: ["Add/remove node operators", "Set operator limits"],
      },
    ],
    emergencyControls: [
      {
        name: "Staking Pause",
        description: "Pause new deposits into the staking protocol",
        enabled: true,
        controlledBy: "agent",
      },
      {
        name: "Withdrawal Pause",
        description: "Pause withdrawal request processing",
        enabled: true,
        controlledBy: "agent",
      },
      {
        name: "Oracle Halt",
        description: "Halt oracle reporting in case of consensus failure",
        enabled: true,
        controlledBy: "agent",
      },
    ],
    upgradeability: "proxy-with-timelock",
    upgradeDescription:
      "Core contracts use proxy pattern governed by Aragon DAO with a 72-hour timelock on upgrades.",
  },
};
