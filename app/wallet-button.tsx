"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { BrowserProvider } from "ethers";
import { SiweMessage } from "siwe";

export function WalletButton() {
  const { data: session, status } = useSession();

  async function handleConnect() {
    if (!window.ethereum) {
      alert("No wallet found. Please install MetaMask.");
      return;
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    // Fetch nonce from server
    const nonceRes = await fetch("/api/siwe/nonce");
    const { nonce } = await nonceRes.json();

    // Create SIWE message
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in to ShipDev",
      uri: window.location.origin,
      version: "1",
      chainId: Number(network.chainId),
      nonce,
    });

    const messageString = message.prepareMessage();
    const signature = await signer.signMessage(messageString);

    // Sign in with NextAuth
    await signIn("siwe", {
      message: messageString,
      signature,
      redirect: false,
    });
  }

  function handleDisconnect() {
    signOut({ redirect: false });
  }

  if (status === "loading") {
    return (
      <button
        disabled
        className="bg-surface-elevated text-text-muted text-[12px] font-semibold border border-border rounded-[6px] px-4 py-[6px]"
      >
        ...
      </button>
    );
  }

  if (session?.user?.name) {
    const address = session.user.name;
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
      <button
        onClick={handleDisconnect}
        className="bg-surface-elevated text-text-primary text-[12px] font-semibold border border-border rounded-[6px] px-4 py-[6px] hover:border-accent/30 transition-colors cursor-pointer"
      >
        {truncated}
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="bg-surface-elevated text-text-primary text-[12px] font-semibold border border-border rounded-[6px] px-4 py-[6px] hover:border-accent/30 transition-colors cursor-pointer"
    >
      Connect Wallet
    </button>
  );
}
