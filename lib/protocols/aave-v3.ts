import type { ProtocolBase } from "./types";

/**
 * Aave V3 — isolated lending markets
 *
 * The most deployed lending protocol. Good for:
 * - Borrow/lend with variable and stable rates
 * - Isolated markets for long-tail assets
 * - Flash loans
 * - E-mode for correlated asset efficiency
 */
export const aaveV3: ProtocolBase = {
  id: "aave-v3",
  name: "Aave V3",
  version: "3.0.2",
  description:
    "Isolated lending protocol with variable/stable rates, flash loans, efficiency mode, and risk-adjusted interest curves.",
  category: "lending",
  supportedChains: ["hyperevm-testnet", "hyperevm"],
  upstream: "Aave V3",
  upstreamUrl: "https://github.com/aave/aave-v3-core",

  audits: [
    {
      auditor: "OpenZeppelin",
      date: "2022-01",
      reportUrl: "https://github.com/aave/aave-v3-core/tree/master/audits",
    },
    {
      auditor: "Trail of Bits",
      date: "2022-01",
    },
    {
      auditor: "Peckshield",
      date: "2022-01",
    },
    {
      auditor: "SigmaPrime",
      date: "2022-09",
    },
  ],

  parameters: [
    // Core
    {
      key: "baseBorrowRate",
      label: "Base Borrow Rate",
      description: "Minimum borrow APR when utilization is 0%",
      type: "percentage",
      default: 0,
      min: 0,
      max: 5,
      group: "core",
    },
    {
      key: "optimalUtilization",
      label: "Optimal Utilization",
      description: "Target utilization rate — interest curve inflects here",
      type: "percentage",
      default: 80,
      min: 50,
      max: 95,
      group: "core",
    },
    {
      key: "variableRateSlope1",
      label: "Rate Slope 1 (below optimal)",
      description: "Interest rate increase per unit utilization below optimal",
      type: "percentage",
      default: 4,
      min: 0.5,
      max: 15,
      group: "core",
    },
    {
      key: "variableRateSlope2",
      label: "Rate Slope 2 (above optimal)",
      description: "Steep interest rate increase above optimal utilization to incentivize repayment",
      type: "percentage",
      default: 75,
      min: 20,
      max: 300,
      group: "core",
    },
    {
      key: "liquidationThreshold",
      label: "Liquidation Threshold",
      description: "LTV at which positions become liquidatable",
      type: "percentage",
      default: 82.5,
      min: 50,
      max: 95,
      group: "core",
    },
    {
      key: "liquidationBonus",
      label: "Liquidation Bonus",
      description: "Discount liquidators receive on collateral",
      type: "percentage",
      default: 5,
      min: 1,
      max: 15,
      group: "core",
    },
    {
      key: "flashLoanEnabled",
      label: "Flash Loans",
      description: "Allow uncollateralized single-block loans",
      type: "boolean",
      default: true,
      group: "core",
    },
    {
      key: "flashLoanPremium",
      label: "Flash Loan Premium",
      description: "Fee charged on flash loan amount",
      type: "percentage",
      default: 0.05,
      min: 0,
      max: 1,
      group: "core",
    },
    {
      key: "reserveFactor",
      label: "Reserve Factor",
      description: "% of interest that goes to protocol treasury",
      type: "percentage",
      default: 10,
      min: 0,
      max: 50,
      group: "core",
    },

    // Token
    {
      key: "tokenName",
      label: "Governance Token Name",
      description: "Name of the lending protocol's governance token",
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
      name: "Pool",
      description: "Core lending pool — handles deposits, borrows, repayments, liquidations",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "supply", inputs: [{ name: "asset", type: "address" }, { name: "amount", type: "uint256" }, { name: "onBehalfOf", type: "address" }, { name: "referralCode", type: "uint16" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "borrow", inputs: [{ name: "asset", type: "address" }, { name: "amount", type: "uint256" }, { name: "interestRateMode", type: "uint256" }, { name: "referralCode", type: "uint16" }, { name: "onBehalfOf", type: "address" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "repay", inputs: [{ name: "asset", type: "address" }, { name: "amount", type: "uint256" }, { name: "interestRateMode", type: "uint256" }, { name: "onBehalfOf", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "nonpayable" },
        { type: "function", name: "liquidationCall", inputs: [{ name: "collateralAsset", type: "address" }, { name: "debtAsset", type: "address" }, { name: "user", type: "address" }, { name: "debtToCover", type: "uint256" }, { name: "receiveAToken", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "flashLoan", inputs: [{ name: "receiverAddress", type: "address" }, { name: "assets", type: "address[]" }, { name: "amounts", type: "uint256[]" }, { name: "interestRateModes", type: "uint256[]" }, { name: "onBehalfOf", type: "address" }, { name: "params", type: "bytes" }, { name: "referralCode", type: "uint16" }], outputs: [], stateMutability: "nonpayable" },
      ],
      bytecode: "0x",
    },
    {
      name: "PoolConfigurator",
      description: "Admin interface for configuring reserve parameters, rate strategies, and risk settings",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "initReserves", inputs: [{ name: "input", type: "tuple[]" }], outputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "setReserveFactor", inputs: [{ name: "asset", type: "address" }, { name: "newReserveFactor", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
      ],
      bytecode: "0x",
    },
    {
      name: "AToken",
      description: "Interest-bearing token representing deposits. Balance increases over time.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "balanceOf", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "scaledBalanceOf", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "VariableDebtToken",
      description: "Tracks variable-rate debt positions. Balance increases with accrued interest.",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "balanceOf", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
        { type: "function", name: "scaledBalanceOf", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
    {
      name: "Oracle",
      description: "Price oracle aggregator for collateral valuation and liquidation thresholds",
      auditStatus: "audited",
      abi: [
        { type: "function", name: "getAssetPrice", inputs: [{ name: "asset", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
      ],
      bytecode: "0x",
    },
  ],

  security: {
    baseScore: 9.5,
    privilegedRoles: [
      {
        role: "poolAdmin",
        description: "Can configure reserve parameters, add/remove assets, set rate strategies",
        defaultHolder: "timelock",
        riskLevel: "high",
        capabilities: ["Configure reserves", "Set rate strategies", "Add assets", "Pause markets"],
      },
      {
        role: "emergencyAdmin",
        description: "Can pause the protocol in emergencies",
        defaultHolder: "multisig",
        riskLevel: "medium",
        capabilities: ["Pause protocol", "Unpause protocol"],
      },
      {
        role: "riskAdmin",
        description: "Can adjust risk parameters (LTV, liquidation thresholds)",
        defaultHolder: "multisig",
        riskLevel: "medium",
        capabilities: ["Set LTV", "Set liquidation threshold", "Set liquidation bonus"],
      },
    ],
    emergencyControls: [
      {
        name: "Market Pause",
        description: "Pause individual markets or entire protocol",
        enabled: true,
        controlledBy: "emergencyAdmin",
      },
      {
        name: "Flash Loan Guard",
        description: "Disable flash loans during incidents",
        enabled: true,
        controlledBy: "poolAdmin",
      },
    ],
    upgradeability: "proxy-with-timelock",
    upgradeDescription: "Contracts use transparent proxy pattern with a 48-hour timelock on upgrades.",
  },
};
