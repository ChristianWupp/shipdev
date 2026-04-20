# Surf AI Research Brief — ShipDev integration shortlist

Paste this into Surf AI. Research brief is in one block so it can be copied as-is.

---

## Context

I'm building **ShipDev**, a fork-first AI protocol builder for crypto ("Lovable for DeFi"). Users describe what they want, we fork audited protocol bases, configure, and deploy. Target chains: HyperEVM first (+ Nest), then Base/Arbitrum/mainnet/Solana.

We're evaluating providers in five categories. For each provider, I need:
- **API-first?** (is there a public API, or is it UI/SDK only?)
- **Whitelabel-friendly?** (can a third party like us spin up a branded UI on top?)
- **Audit/security track record**
- **Chain coverage** (especially HyperEVM, Base, mainnet, Solana)
- **Liquidity / TVL depth** where applicable
- **Licensing/integration terms** — is it permissionless or gated?
- **Pricing model** — free, revshare, monthly, token-gated?

Where you know of strong providers I haven't named, add them. Be opinionated: for each category, recommend the single best pick for a 0-to-1 builder tool and explain why in one line.

---

## Categories to evaluate

### 1. Neobanks / on-chain card + banking infra
Candidates I'm tracking: **Kulipa, Rain, Gnosis Pay**. Plus anyone else with a whitelabel card-issuance / IBAN / neobank API where a ShipDev user could ship a branded consumer finance app.
- Best for "I want to launch a crypto debit card / neobank experience for my community"
- Want: API for card issuance, KYC routing, stablecoin rails, ideally EU + US

### 2. Stablecoin providers / whitelabel issuance
Candidates: **M0, Ethena (whitelabel / USDtb / variants), Agora**. Plus Paxos, Circle's partner programs, Bridge, Brale, etc.
- Best for "I want to issue my own branded stablecoin or build on top of an existing one"
- Want: whitelabel program details, minting/redemption APIs, reserve transparency, chain coverage

### 3. Prediction markets APIs
Candidates: **Polymarket, Kalshi**. Plus Azuro, Overtime, PredictionMarket.io, etc.
- Best for "I want to build a prediction-market frontend on top of existing onchain liquidity" (ShipDev's Track B thesis — no new contracts, wrap existing liquidity)
- Want: order book API depth, liquidity, terms for building third-party frontends, which markets are onchain vs CEX-style

### 4. Vault / yield infrastructure (whitelabel)
Candidates: **Veda, Concrete, Ethena vaults, Morpho Vaults, Kiln**. Plus Sommelier, Yearn V3 factory vaults, Gauntlet curated markets, etc.
- Best for "I want to launch a branded yield vault without writing vault contracts"
- Want: factory / whitelabel availability, fee terms, strategy ownership, audit status, chain coverage (HyperEVM eventually)

### 5. Data / breadth APIs for the ShipDev builder itself
We need real-time data to power the builder (APY/TVL defaults, yield rankings, wallet context, protocol metrics, news for rotating threat headlines, prediction market pricing, etc.).
- Surf AI is our default starting point (90+ endpoints across 12 domains).
- Also evaluating: Defined/Codex, DeFiLlama, DexScreener, 0x Matcha APIs, Blockworks, Coingecko, Nansen, Dune, The Graph
- Questions: where does Surf AI have gaps? Where should we go direct (e.g., HyperEVM RPC, Hyperliquid order book API, Polymarket API) vs. rely on an aggregator? What's the lowest-latency option for live order book + TVL + APY data?

---

## Deliverable I want back

1. **Shortlist table** — one row per provider, columns = API-first / Whitelabel / Audit / Chains / Liquidity / Licensing / Pricing
2. **Single top pick per category** — opinionated, 1-line rationale
3. **Gaps / what nobody covers well yet** — where is there whitespace a category leader hasn't filled?
4. **Integration-order recommendation** — for a small team (3-5 eng), which of these do we wire up first, second, third, and why? Assume goal is to ship 1 Track B product (frontend + aggregation, no new contracts) to first paid users within 30 days.
5. **Anything hot I'm missing** — if there's a new narrative provider (AI-agent wallets, restaking whitelabels, points-as-a-service, etc.) worth putting on the radar, flag it.

Be direct. Skip preamble. Name specific handles / URLs / contacts where useful.
