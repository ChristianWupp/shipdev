import { NextRequest, NextResponse } from "next/server";
import { analyzeProtocol } from "@/lib/scanner/analyze";
import { getProtocolById, PROTOCOLS } from "@/lib/scanner/protocols";

const RPC_URLS: Record<string, string> = {
  ethereum: process.env.ETH_RPC_URL ?? "https://ethereum-rpc.publicnode.com",
  arbitrum: process.env.ARB_RPC_URL ?? "https://arb1.arbitrum.io/rpc",
  base: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
  optimism: process.env.OP_RPC_URL ?? "https://mainnet.optimism.io",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { protocolId } = body;

  if (!protocolId) {
    return NextResponse.json(
      { error: "Missing protocolId" },
      { status: 400 }
    );
  }

  const protocol = getProtocolById(protocolId);
  if (!protocol) {
    return NextResponse.json(
      { error: `Unknown protocol: ${protocolId}. Available: ${PROTOCOLS.map((p) => p.id).join(", ")}` },
      { status: 400 }
    );
  }

  const rpcUrl = RPC_URLS[protocol.chain];
  if (!rpcUrl) {
    return NextResponse.json(
      { error: `No RPC configured for chain: ${protocol.chain}` },
      { status: 400 }
    );
  }

  try {
    const report = await analyzeProtocol(protocol, rpcUrl);
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    PROTOCOLS.map((p) => ({ id: p.id, name: p.name, chain: p.chain, tvl: p.tvl, description: p.description }))
  );
}
