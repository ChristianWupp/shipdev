import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "ethers";
import { analyzeProtocol } from "@/lib/scanner/analyze";
import { getProtocolById, PROTOCOLS } from "@/lib/scanner/protocols";
import type { ProtocolDefinition, ContractRole } from "@/lib/scanner/types";

const RPC_URLS: Record<string, string> = {
  ethereum: process.env.ETH_RPC_URL ?? "https://ethereum-rpc.publicnode.com",
  arbitrum: process.env.ARB_RPC_URL ?? "https://arb1.arbitrum.io/rpc",
  base: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
  optimism: process.env.OP_RPC_URL ?? "https://mainnet.optimism.io",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { protocolId, custom } = body;

  let protocol: ProtocolDefinition;

  if (custom) {
    // Custom protocol scan — user provides contracts directly
    const { name, chain, contracts } = custom as {
      name: string;
      chain: string;
      contracts: { address: string; name: string; description?: string }[];
    };

    if (!name || !chain || !contracts?.length) {
      return NextResponse.json(
        { error: "Custom scan requires name, chain, and at least one contract" },
        { status: 400 }
      );
    }

    // Validate all addresses
    for (const c of contracts) {
      if (!isAddress(c.address)) {
        return NextResponse.json(
          { error: `Invalid address: ${c.address}` },
          { status: 400 }
        );
      }
    }

    const contractRoles: ContractRole[] = contracts.map((c) => ({
      name: c.name || `Contract ${c.address.slice(0, 8)}`,
      address: c.address,
      description: c.description || "User-provided contract",
      impacts: ["user-funds"], // Conservative default
      holdsUserFunds: false,
      holdsTreasury: false,
    }));

    protocol = {
      id: "custom",
      name,
      chain,
      website: "",
      description: `Custom protocol scan with ${contracts.length} contract(s) on ${chain}`,
      contracts: contractRoles,
    };
  } else if (protocolId) {
    const found = getProtocolById(protocolId);
    if (!found) {
      return NextResponse.json(
        { error: `Unknown protocol: ${protocolId}. Available: ${PROTOCOLS.map((p) => p.id).join(", ")}` },
        { status: 400 }
      );
    }
    protocol = found;
  } else {
    return NextResponse.json(
      { error: "Provide protocolId or custom scan data" },
      { status: 400 }
    );
  }

  const rpcUrl = RPC_URLS[protocol.chain];
  if (!rpcUrl) {
    return NextResponse.json(
      { error: `Unsupported chain: ${protocol.chain}. Supported: ${Object.keys(RPC_URLS).join(", ")}` },
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
