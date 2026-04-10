@AGENTS.md

# ShipDev — Lovable for Crypto

Fork-first AI protocol builder. Power users describe protocols, AI selects audited bases, configures parameters, generates frontend, deploys to testnet.

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Architecture
- Fork-first: maintain library of audited protocol bases (Uniswap, Aave, GMX, etc.)
- AI selects base + configures parameters. Only GENERATES frontend code (React/Next.js)
- Smart contracts are pre-compiled, pre-audited. No AI-generated Solidity.
- Vercel AI SDK for streaming chat interface
- solc-js for any parameter-level compilation
- ethers.js for testnet deployment
- PostgreSQL on Supabase for persistence
- NextAuth.js with SIWE (wallet auth)

## Key Design Decisions
- Domain: shipdev.xyz
- Working name: ShipDev (or just "Ship")
- HyperEVM testnet only for V1a
- Electric cyan accent (#00d4ff)
- Instrument Serif for display headlines
- Geist + Geist Mono for body/code
