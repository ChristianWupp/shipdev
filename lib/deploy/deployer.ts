import { BrowserProvider, ContractFactory, parseUnits } from "ethers";
import type { CompiledContract } from "./compiler";
import { integrateWithNest } from "../nest";
import type { NestIntegrationConfig, NestPoolType } from "../nest/types";

export interface DeployedContract {
  name: string;
  address: string;
  txHash: string;
}

/**
 * Deploy a single compiled contract to the connected wallet's network.
 */
async function deploySingle(
  provider: BrowserProvider,
  contract: CompiledContract,
  constructorArgs: unknown[],
): Promise<DeployedContract> {
  const signer = await provider.getSigner();
  const factory = new ContractFactory(contract.abi, contract.bytecode, signer);
  const deployed = await factory.deploy(...constructorArgs);
  const tx = deployed.deploymentTransaction();

  await deployed.waitForDeployment();
  const address = await deployed.getAddress();

  return {
    name: contract.name,
    address,
    txHash: tx?.hash ?? "",
  };
}

export type StepCallback = (
  stepId: string,
  status: "in-progress" | "done" | "error",
  data?: { address?: string; txHash?: string; error?: string },
) => void;

/**
 * Full deployment pipeline:
 * 1. Compile on server
 * 2. Deploy Factory with user's wallet
 * 3. Deploy Router pointing to Factory
 * 4. Deploy governance token
 * 5. Generate frontend
 * 6. Nest integration (if enabled on HyperEVM)
 */
export async function deployProtocol(
  params: Record<string, string | number | boolean>,
  onStep: StepCallback,
): Promise<DeployedContract[]> {
  if (!window.ethereum) {
    throw new Error("No wallet connected");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const ownerAddress = await signer.getAddress();

  // Step 1: Compile
  onStep("compile", "in-progress");
  const res = await fetch("/api/deploy/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      protocolFee: params.protocolFee,
      tokenName: params.tokenName,
      tokenSymbol: params.tokenSymbol,
      tokenSupply: params.tokenSupply,
    }),
  });

  const { success, contracts, error } = await res.json();
  if (!success) {
    onStep("compile", "error", { error });
    throw new Error(error);
  }
  onStep("compile", "done");

  const compiled = contracts as CompiledContract[];
  const findContract = (keyword: string) =>
    compiled.find((c) => c.name.toLowerCase().includes(keyword.toLowerCase()));

  const factoryContract = findContract("Factory");
  const routerContract = findContract("Router");
  const tokenContract = findContract("Token") ?? findContract("Governance");

  const deployed: DeployedContract[] = [];

  // Step 2: Deploy Factory
  onStep("factory", "in-progress");
  try {
    const factory = await deploySingle(provider, factoryContract!, [
      ownerAddress,
    ]);
    deployed.push(factory);
    onStep("factory", "done", {
      address: factory.address,
      txHash: factory.txHash,
    });
  } catch (err) {
    onStep("factory", "error", { error: (err as Error).message });
    throw err;
  }

  // Step 3: Deploy Router
  onStep("router", "in-progress");
  try {
    const whype =
      typeof params.wrappedNative === "string" && params.wrappedNative.startsWith("0x")
        ? params.wrappedNative
        : "0x0000000000000000000000000000000000000000";
    const router = await deploySingle(provider, routerContract!, [
      deployed[0].address, // factory address
      whype,
    ]);
    deployed.push(router);
    onStep("router", "done", {
      address: router.address,
      txHash: router.txHash,
    });
  } catch (err) {
    onStep("router", "error", { error: (err as Error).message });
    throw err;
  }

  // Step 4: Deploy Token
  onStep("token", "in-progress");
  try {
    const token = await deploySingle(provider, tokenContract!, [ownerAddress]);
    deployed.push(token);
    onStep("token", "done", {
      address: token.address,
      txHash: token.txHash,
    });
  } catch (err) {
    onStep("token", "error", { error: (err as Error).message });
    throw err;
  }

  // Step 5: Frontend generation (placeholder for V1a)
  onStep("frontend", "in-progress");
  await new Promise((r) => setTimeout(r, 1500));
  onStep("frontend", "done");

  // Step 6: Nest integration (if enabled and deploying to HyperEVM)
  const nestEnabled = params.nestEnabled === true || params.nestEnabled === "true";
  if (nestEnabled && deployed.length >= 3) {
    const tokenDeployed = deployed.find(
      (d) => d.name.toLowerCase().includes("token") || d.name.toLowerCase().includes("governance"),
    );

    if (tokenDeployed) {
      const nestConfig: NestIntegrationConfig = {
        enabled: true,
        poolType: (params.nestPoolType as NestPoolType) || "classic",
        quoteToken: (params.nestQuoteToken as "WHYPE" | "USDH") || "WHYPE",
        initialLiquidityPct: Number(params.nestInitialLiquidityPct) || 5,
        initialQuoteAmount: Number(params.nestInitialQuoteAmount) || 0,
        bribeAllocationPct: Number(params.nestBribeAllocationPct) || 2,
        bribeEpochs: Number(params.nestBribeEpochs) || 4,
      };

      const totalSupply = parseUnits(
        String(params.tokenSupply || "100000000"),
        18,
      );

      await integrateWithNest(
        {
          chain: (params.chain as string) || "hyperevm-testnet",
          tokenAddress: tokenDeployed.address,
          tokenSupply: totalSupply,
          tokenDecimals: 18,
          config: nestConfig,
        },
        onStep,
      );
    }
  }

  return deployed;
}
