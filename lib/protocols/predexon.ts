import type { ProtocolBase } from "./types";

/**
 * Predexon — prediction market creation & routing
 *
 * Predexon is the intelligence and execution layer for prediction markets:
 * non-custodial routing across Polymarket, Kalshi, and on-chain CTF venues,
 * real-time market data via WebSocket, and cross-venue portfolio tracking.
 *
 * Under the hood ShipDev deploys Gnosis Conditional Tokens Framework (CTF)
 * for on-chain market primitives and wires UMA's Optimistic Oracle V3 for
 * resolution. Predexon's APIs handle discovery, cross-venue matching, and
 * streaming. Good for:
 * - Binary and categorical markets (sports, politics, crypto, world events)
 * - Sourcing liquidity across Polymarket + Kalshi in one interface
 * - Custom resolution windows with optimistic oracle + dispute game
 * - Operator-run market makers with configurable fees
 */
export const predexon: ProtocolBase = {
  id: "predexon",
  name: "Predexon",
  version: "1.0",
  description:
    "Prediction market protocol with cross-venue routing (Polymarket, Kalshi), Gnosis CTF conditional tokens on-chain, and UMA Optimistic Oracle V3 for resolution.",
  category: "prediction-market",
  supportedChains: ["hyperevm-testnet", "hyperevm", "base", "arbitrum"],
  upstream: "Predexon + Gnosis CTF + UMA OOv3",
  upstreamUrl: "https://predexon.com",

  audits: [
    {
      auditor: "OpenZeppelin",
      date: "2020-06",
      reportUrl: "https://blog.openzeppelin.com/conditional-tokens-framework-audit",
    },
    {
      auditor: "OpenZeppelin",
      date: "2023-07",
      reportUrl: "https://blog.openzeppelin.com/uma-optimistic-oracle-v3-audit",
    },
    {
      auditor: "Trail of Bits",
      date: "2023-05",
    },
  ],

  parameters: [
    // Core
    {
      key: "marketType",
      label: "Market Type",
      description:
        "Binary (yes/no), categorical (N outcomes), or scalar (numeric range) markets",
      type: "select",
      default: "binary",
      options: ["binary", "categorical", "scalar"],
      group: "core",
    },
    {
      key: "collateralToken",
      label: "Collateral Token",
      description:
        "ERC-20 used to mint outcome tokens and settle payouts. USDC recommended for parity with Polymarket.",
      type: "select",
      default: "USDC",
      options: ["USDC", "USDT", "DAI", "WETH"],
      group: "core",
    },
    {
      key: "resolutionSource",
      label: "Resolution Mechanism",
      description:
        "UMA optimistic oracle (permissionless + dispute game), admin-resolved (operator calls settle), or Predexon aggregator (cross-references Polymarket/Kalshi outcomes)",
      type: "select",
      default: "uma-optimistic",
      options: ["uma-optimistic", "admin", "predexon-aggregator"],
      group: "core",
    },
    {
      key: "disputeWindow",
      label: "Dispute Window (hours)",
      description:
        "Time after a proposed resolution during which the outcome can be disputed on UMA. Longer = safer, shorter = faster payouts.",
      type: "number",
      default: 24,
      min: 2,
      max: 168,
      group: "core",
    },
    {
      key: "tradingFee",
      label: "Trading Fee",
      description: "Fee on each buy/sell of outcome tokens, paid to the market operator",
      type: "percentage",
      default: 2,
      min: 0,
      max: 10,
      group: "core",
    },
    {
      key: "marketCreationFee",
      label: "Market Creation Fee",
      description:
        "Flat fee (in collateral token) required to open a new market — deters spam",
      type: "number",
      default: 100,
      min: 0,
      max: 10_000,
      group: "core",
    },
    {
      key: "minLiquidity",
      label: "Minimum Initial Liquidity",
      description:
        "Minimum collateral the market creator must seed — too-thin markets produce unreliable prices",
      type: "number",
      default: 1_000,
      min: 100,
      max: 1_000_000,
      group: "core",
    },
    {
      key: "lmsrB",
      label: "LMSR Liquidity Parameter (b)",
      description:
        "Logarithmic Market Scoring Rule liquidity — higher values flatten price impact but cap max operator loss. Set ≈ initial liquidity / 4.",
      type: "number",
      default: 250,
      min: 10,
      max: 1_000_000,
      group: "core",
    },
    {
      key: "enableCrossVenueRouting",
      label: "Cross-Venue Routing",
      description:
        "Route orders through Predexon API to source best price across Polymarket + Kalshi before falling back to native CTF pool",
      type: "boolean",
      default: true,
      group: "core",
    },

    // Token
    {
      key: "tokenName",
      label: "Governance Token Name",
      description: "Name of the protocol's governance / fee-share token",
      type: "string",
      default: "PredictDAO",
      group: "token",
    },
    {
      key: "tokenSymbol",
      label: "Token Symbol",
      description: "Ticker symbol",
      type: "string",
      default: "PRED",
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
      key: "marketMakerRewardsAlloc",
      label: "Market Maker Rewards",
      description:
        "% of total supply distributed to liquidity providers and active market makers",
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
      description:
        "% of supply held by the DAO treasury (funds UMA bonds, dispute gas, audits)",
      type: "percentage",
      default: 20,
      min: 0,
      max: 50,
      group: "token",
    },
    {
      key: "communityAlloc",
      label: "Community / Airdrop",
      description:
        "% of supply for market creators, resolvers, and active traders",
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
      description:
        "Create a Nest pool for the governance token on HyperEVM for post-deploy liquidity",
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
      label: "Owner / Market Operator",
      description:
        "Address that can create markets, claim fees, and act as fallback resolver. Recommend multi-sig.",
      type: "address",
      default: "",
      group: "admin",
    },
    {
      key: "emergencyPause",
      label: "Emergency Pause",
      description:
        "Allow operator to pause new market creation and trading — does not affect resolved markets or withdrawals",
      type: "boolean",
      default: true,
      group: "admin",
    },
    {
      key: "upgradeability",
      label: "Upgrade Authority",
      description:
        "CTF and UMA OOv3 are immutable; the market factory and fee router can be upgraded via proxy with timelock",
      type: "select",
      default: "proxy-with-timelock",
      options: ["immutable", "proxy", "proxy-with-timelock"],
      group: "admin",
    },
  ],

  contracts: [
    {
      name: "ConditionalTokens",
      description:
        "Gnosis CTF — mints ERC-1155 outcome token positions from collateral. Handles payouts and redemption.",
      auditStatus: "audited",
      abi: [
        {
          type: "function",
          name: "prepareCondition",
          inputs: [
            { name: "oracle", type: "address" },
            { name: "questionId", type: "bytes32" },
            { name: "outcomeSlotCount", type: "uint256" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "splitPosition",
          inputs: [
            { name: "collateralToken", type: "address" },
            { name: "parentCollectionId", type: "bytes32" },
            { name: "conditionId", type: "bytes32" },
            { name: "partition", type: "uint256[]" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "reportPayouts",
          inputs: [
            { name: "questionId", type: "bytes32" },
            { name: "payouts", type: "uint256[]" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "redeemPositions",
          inputs: [
            { name: "collateralToken", type: "address" },
            { name: "parentCollectionId", type: "bytes32" },
            { name: "conditionId", type: "bytes32" },
            { name: "indexSets", type: "uint256[]" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      bytecode: "0x",
    },
    {
      name: "MarketFactory",
      description:
        "Deploys new prediction markets with LMSR pricing, seeds initial liquidity, and registers them with the resolution oracle.",
      auditStatus: "audited",
      abi: [
        {
          type: "function",
          name: "createMarket",
          inputs: [
            { name: "question", type: "string" },
            { name: "outcomes", type: "string[]" },
            { name: "resolutionTime", type: "uint256" },
            { name: "initialLiquidity", type: "uint256" },
            { name: "fee", type: "uint256" },
          ],
          outputs: [{ name: "market", type: "address" }],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "markets",
          inputs: [{ name: "index", type: "uint256" }],
          outputs: [{ type: "address" }],
          stateMutability: "view",
        },
      ],
      bytecode: "0x",
    },
    {
      name: "UmaResolutionAdapter",
      description:
        "Bridges markets to UMA Optimistic Oracle V3 — posts questions, collects bond, handles proposer/disputer flow, reports final payouts to CTF.",
      auditStatus: "audited",
      abi: [
        {
          type: "function",
          name: "requestResolution",
          inputs: [
            { name: "questionId", type: "bytes32" },
            { name: "ancillaryData", type: "bytes" },
            { name: "bondAmount", type: "uint256" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "settleResolution",
          inputs: [{ name: "questionId", type: "bytes32" }],
          outputs: [{ name: "payouts", type: "uint256[]" }],
          stateMutability: "nonpayable",
        },
      ],
      bytecode: "0x",
    },
    {
      name: "PredexonRouter",
      description:
        "Off-chain-assisted router: quotes Polymarket + Kalshi via Predexon API, falls back to native CTF LMSR pool when better. Non-custodial — signed orders only.",
      auditStatus: "config-change",
      abi: [
        {
          type: "function",
          name: "routeBuy",
          inputs: [
            { name: "market", type: "address" },
            { name: "outcomeIndex", type: "uint256" },
            { name: "collateralIn", type: "uint256" },
            { name: "minTokensOut", type: "uint256" },
            { name: "venueHint", type: "uint8" },
          ],
          outputs: [{ name: "tokensOut", type: "uint256" }],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "routeSell",
          inputs: [
            { name: "market", type: "address" },
            { name: "outcomeIndex", type: "uint256" },
            { name: "tokensIn", type: "uint256" },
            { name: "minCollateralOut", type: "uint256" },
          ],
          outputs: [{ name: "collateralOut", type: "uint256" }],
          stateMutability: "nonpayable",
        },
      ],
      bytecode: "0x",
    },
  ],

  security: {
    baseScore: 8.5,
    privilegedRoles: [
      {
        role: "operator",
        description:
          "Market operator — creates markets, claims trading fees, can act as admin resolver when that mechanism is selected",
        defaultHolder: "multisig",
        riskLevel: "medium",
        capabilities: [
          "Create new markets",
          "Claim accumulated fees",
          "Admin-resolve markets (if enabled)",
          "Pause new market creation",
        ],
      },
      {
        role: "umaProposer",
        description:
          "Any address can propose a resolution by posting a bond to UMA OOv3 — fully permissionless",
        defaultHolder: "none",
        riskLevel: "low",
        capabilities: [
          "Propose market outcome",
          "Collect bond + reward if undisputed",
        ],
      },
      {
        role: "timelock",
        description:
          "Timelock controls upgrades to MarketFactory and PredexonRouter — minimum 48h delay",
        defaultHolder: "timelock",
        riskLevel: "low",
        capabilities: ["Queue upgrades", "Execute upgrades after delay"],
      },
    ],
    emergencyControls: [
      {
        name: "Market Creation Pause",
        description:
          "Operator can halt new market creation during incidents — existing markets continue trading and resolving",
        enabled: true,
        controlledBy: "operator",
      },
      {
        name: "Dispute Escalation",
        description:
          "Any trader can dispute a proposed resolution within the dispute window by posting a bond — escalates to UMA DVM voting",
        enabled: true,
        controlledBy: "any UMA token holder",
      },
    ],
    upgradeability: "proxy-with-timelock",
    upgradeDescription:
      "Gnosis CTF and UMA OOv3 are immutable third-party contracts. MarketFactory and PredexonRouter are upgradeable via UUPS proxy behind a 48-hour timelock, governed by the PRED token.",
  },
};
