/**
 * Nest Integration Layer
 *
 * Post-deploy integration with Nest on HyperEVM:
 * 1. Create a trading pool (TOKEN/WHYPE or TOKEN/USDH)
 * 2. Seed initial liquidity
 * 3. Deposit bribes for the Egg Initiative
 *
 * This gives ShipDev-deployed tokens real liquidity from day one.
 */

import { BrowserProvider, Contract, parseEther, MaxUint256 } from "ethers";
import type { NestIntegrationConfig, NestIntegrationResult } from "./types";
import { getNestContracts, NEST_ABIS } from "./contracts";
import type { StepCallback } from "../deploy/deployer";

export { DEFAULT_NEST_CONFIG, getRecommendedVenue, getVenuesForChain } from "./types";
export type { NestIntegrationConfig, NestIntegrationResult, LiquidityVenue } from "./types";

interface NestIntegrationParams {
  /** Chain being deployed to */
  chain: string;
  /** Deployed governance token address */
  tokenAddress: string;
  /** Total token supply (raw, in token decimals) */
  tokenSupply: bigint;
  /** Token decimals (usually 18) */
  tokenDecimals: number;
  /** Nest integration config from deploy params */
  config: NestIntegrationConfig;
}

/**
 * Execute post-deploy Nest integration.
 * Called after the core protocol contracts are deployed.
 */
export async function integrateWithNest(
  params: NestIntegrationParams,
  onStep: StepCallback,
): Promise<NestIntegrationResult> {
  if (!params.config.enabled) return {};
  if (!window.ethereum) throw new Error("No wallet connected");

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const ownerAddress = await signer.getAddress();
  const contracts = getNestContracts(params.chain);
  const result: NestIntegrationResult = {};

  // Step 1: Create Nest pool
  onStep("nest-pool", "in-progress");
  try {
    const quoteAddress =
      params.config.quoteToken === "WHYPE" ? contracts.whype : contracts.usdh;
    const stable = false; // volatile pair for governance tokens

    const factory = new Contract(
      contracts.pairFactory,
      NEST_ABIS.pairFactory,
      signer,
    );

    // Check if pool already exists
    let poolAddress: string = await factory.getPool(
      params.tokenAddress,
      quoteAddress,
      stable,
    );

    if (poolAddress === "0x0000000000000000000000000000000000000000") {
      const tx = await factory.createPool(
        params.tokenAddress,
        quoteAddress,
        stable,
      );
      await tx.wait();
      poolAddress = await factory.getPool(
        params.tokenAddress,
        quoteAddress,
        stable,
      );
    }

    result.pool = {
      poolAddress,
      poolType: params.config.poolType,
      tokenAddress: params.tokenAddress,
      quoteTokenAddress: quoteAddress,
      txHash: poolAddress,
    };

    onStep("nest-pool", "done", { address: poolAddress });
  } catch (err) {
    onStep("nest-pool", "error", { error: (err as Error).message });
    throw err;
  }

  // Step 2: Seed initial liquidity (if configured)
  if (params.config.initialLiquidityPct > 0 && params.config.initialQuoteAmount > 0) {
    onStep("nest-liquidity", "in-progress");
    try {
      const tokenAmount =
        (params.tokenSupply * BigInt(params.config.initialLiquidityPct)) /
        BigInt(100);
      const quoteAmount = parseEther(
        params.config.initialQuoteAmount.toString(),
      );

      const tokenContract = new Contract(
        params.tokenAddress,
        NEST_ABIS.erc20,
        signer,
      );
      const router = new Contract(
        contracts.router,
        NEST_ABIS.router,
        signer,
      );

      // Approve token spend
      const approveTx = await tokenContract.approve(
        contracts.router,
        MaxUint256,
      );
      await approveTx.wait();

      // Add liquidity — use addLiquidityETH for WHYPE pairs
      if (params.config.quoteToken === "WHYPE") {
        const tx = await router.addLiquidityETH(
          params.tokenAddress,
          false, // not stable
          tokenAmount,
          BigInt(0), // min token
          BigInt(0), // min ETH
          ownerAddress,
          BigInt(Math.floor(Date.now() / 1000) + 3600),
          { value: quoteAmount },
        );
        const receipt = await tx.wait();

        result.lpSeed = {
          lpTokenAddress: result.pool!.poolAddress,
          tokenAmount: tokenAmount.toString(),
          quoteAmount: quoteAmount.toString(),
          txHash: receipt.hash,
        };
      } else {
        // USDH pair — approve USDH first, then addLiquidity
        const usdh = new Contract(
          contracts.usdh,
          NEST_ABIS.erc20,
          signer,
        );
        const approveUsdhTx = await usdh.approve(
          contracts.router,
          MaxUint256,
        );
        await approveUsdhTx.wait();

        const tx = await router.addLiquidity(
          params.tokenAddress,
          contracts.usdh,
          false,
          tokenAmount,
          quoteAmount,
          BigInt(0),
          BigInt(0),
          ownerAddress,
          BigInt(Math.floor(Date.now() / 1000) + 3600),
        );
        const receipt = await tx.wait();

        result.lpSeed = {
          lpTokenAddress: result.pool!.poolAddress,
          tokenAmount: tokenAmount.toString(),
          quoteAmount: quoteAmount.toString(),
          txHash: receipt.hash,
        };
      }

      onStep("nest-liquidity", "done", {
        address: result.pool!.poolAddress,
      });
    } catch (err) {
      onStep("nest-liquidity", "error", { error: (err as Error).message });
      throw err;
    }
  }

  // Step 3: Deposit Egg Initiative bribes (if configured)
  if (params.config.bribeAllocationPct > 0 && params.config.bribeEpochs > 0) {
    onStep("nest-bribe", "in-progress");
    try {
      const totalBribeAmount =
        (params.tokenSupply * BigInt(params.config.bribeAllocationPct)) /
        BigInt(100);
      const amountPerEpoch = totalBribeAmount / BigInt(params.config.bribeEpochs);

      // Look up the bribe contract for this pool's gauge
      const voter = new Contract(contracts.voter, NEST_ABIS.voter, signer);
      const gaugeAddress: string = await voter.gauges(result.pool!.poolAddress);
      const bribeAddress: string = await voter.gaugeToBribe(gaugeAddress);

      // Approve bribe contract to spend tokens
      const tokenContract = new Contract(
        params.tokenAddress,
        NEST_ABIS.erc20,
        signer,
      );
      const approveTx = await tokenContract.approve(bribeAddress, totalBribeAmount);
      await approveTx.wait();

      // Deposit first epoch's bribe (remaining epochs deposited by a cron/bot)
      const bribe = new Contract(
        bribeAddress,
        NEST_ABIS.bribeVotingReward,
        signer,
      );
      const tx = await bribe.notifyRewardAmount(params.tokenAddress, amountPerEpoch);
      await tx.wait();

      result.bribe = {
        bribeContractAddress: bribeAddress,
        tokenAddress: params.tokenAddress,
        amountPerEpoch: amountPerEpoch.toString(),
        totalEpochs: params.config.bribeEpochs,
        txHash: tx.hash,
      };

      onStep("nest-bribe", "done", { address: bribeAddress });
    } catch (err) {
      onStep("nest-bribe", "error", { error: (err as Error).message });
      throw err;
    }
  }

  return result;
}

/**
 * Generate the Nest integration pitch for the AI to present to users.
 * Used in the chat interface when recommending deployment options.
 */
export function getNestPitch(chain: string): string | null {
  if (chain !== "hyperevm" && chain !== "hyperevm-testnet") return null;

  return `**Recommended: Deploy with Nest liquidity**

Your token will launch with real liquidity on Nest, the ve(3,3) MetaDEX on HyperEVM.

What you get:
- **Instant AMM pool** — your token is tradeable from block one
- **Emissions-driven LPs** — veNEST voters direct NEST rewards to your pool via the Egg Initiative
- **Free market making** — if you list on HyperCore Spot, arbitrageurs keep prices in sync between the AMM and orderbook
- **Hyperliquid access** — your token enters the Everything Exchange ecosystem

Nest integration is optional but recommended. You can configure:
- Pool type (Classic AMM or Concentrated)
- Quote pair (WHYPE or USDH)
- Initial liquidity amount
- Bribe budget for the Egg Initiative (drawn from your community/treasury allocation)`;
}
