import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "ethers";
import { analyzeContract } from "@/lib/scanner/analyze";

const RPC_URLS: Record<string, string> = {
  ethereum: process.env.ETH_RPC_URL ?? "https://ethereum-rpc.publicnode.com",
  arbitrum: process.env.ARB_RPC_URL ?? "https://arb1.arbitrum.io/rpc",
  base: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
  optimism: process.env.OP_RPC_URL ?? "https://mainnet.optimism.io",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { address, chain = "ethereum" } = body;

  if (!address || !isAddress(address)) {
    return NextResponse.json(
      { error: "Invalid contract address" },
      { status: 400 }
    );
  }

  const rpcUrl = RPC_URLS[chain];
  if (!rpcUrl) {
    return NextResponse.json(
      { error: `Unsupported chain: ${chain}. Supported: ${Object.keys(RPC_URLS).join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const report = await analyzeContract(address, rpcUrl);
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
