/**
 * Nest contract addresses and minimal ABIs for integration.
 *
 * These are the contracts ShipDev interacts with post-deploy:
 * - PairFactory: create trading pools
 * - Router: seed initial liquidity
 * - BribeVotingReward: deposit Egg Initiative bribes
 */

export interface NestContracts {
  pairFactory: string;
  router: string;
  bribeVotingReward: string;
  voter: string;
  whype: string;
  usdh: string;
}

/** Mainnet contract addresses (HyperEVM) */
export const NEST_CONTRACTS_MAINNET: NestContracts = {
  pairFactory: "0x0000000000000000000000000000000000000000", // TODO: fill with deployed addresses
  router: "0x0000000000000000000000000000000000000000",
  bribeVotingReward: "0x0000000000000000000000000000000000000000",
  voter: "0x0000000000000000000000000000000000000000",
  whype: "0x0000000000000000000000000000000000000000",
  usdh: "0x0000000000000000000000000000000000000000",
};

/** Testnet contract addresses (HyperEVM Testnet) */
export const NEST_CONTRACTS_TESTNET: NestContracts = {
  pairFactory: "0x0000000000000000000000000000000000000000", // TODO: fill with deployed addresses
  router: "0x0000000000000000000000000000000000000000",
  bribeVotingReward: "0x0000000000000000000000000000000000000000",
  voter: "0x0000000000000000000000000000000000000000",
  whype: "0x0000000000000000000000000000000000000000",
  usdh: "0x0000000000000000000000000000000000000000",
};

/** Get contract addresses for a chain */
export function getNestContracts(chain: string): NestContracts {
  if (chain === "hyperevm") return NEST_CONTRACTS_MAINNET;
  return NEST_CONTRACTS_TESTNET;
}

/**
 * Minimal ABIs for Nest contract interactions.
 * Only includes the functions ShipDev calls during post-deploy integration.
 */
export const NEST_ABIS = {
  pairFactory: [
    {
      type: "function",
      name: "createPool",
      inputs: [
        { name: "tokenA", type: "address" },
        { name: "tokenB", type: "address" },
        { name: "stable", type: "bool" },
      ],
      outputs: [{ name: "pool", type: "address" }],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getPool",
      inputs: [
        { name: "tokenA", type: "address" },
        { name: "tokenB", type: "address" },
        { name: "stable", type: "bool" },
      ],
      outputs: [{ name: "pool", type: "address" }],
      stateMutability: "view",
    },
  ],

  router: [
    {
      type: "function",
      name: "addLiquidity",
      inputs: [
        { name: "tokenA", type: "address" },
        { name: "tokenB", type: "address" },
        { name: "stable", type: "bool" },
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
    {
      type: "function",
      name: "addLiquidityETH",
      inputs: [
        { name: "token", type: "address" },
        { name: "stable", type: "bool" },
        { name: "amountTokenDesired", type: "uint256" },
        { name: "amountTokenMin", type: "uint256" },
        { name: "amountETHMin", type: "uint256" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      outputs: [
        { name: "amountToken", type: "uint256" },
        { name: "amountETH", type: "uint256" },
        { name: "liquidity", type: "uint256" },
      ],
      stateMutability: "payable",
    },
  ],

  bribeVotingReward: [
    {
      type: "function",
      name: "notifyRewardAmount",
      inputs: [
        { name: "token", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ],

  voter: [
    {
      type: "function",
      name: "gauges",
      inputs: [{ name: "pool", type: "address" }],
      outputs: [{ name: "gauge", type: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "gaugeToBribe",
      inputs: [{ name: "gauge", type: "address" }],
      outputs: [{ name: "bribe", type: "address" }],
      stateMutability: "view",
    },
  ],

  erc20: [
    {
      type: "function",
      name: "approve",
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
    },
  ],
} as const;
