# ShipDev — Pitch Deck Context

> Source document for NotebookLM. Contains everything needed to generate a team-facing pitch deck: what it is, why it exists, what's built, the market, the tech, the business model, and the roadmap.

---

## 1. One-liner

**ShipDev is Lovable / Bolt for DeFi protocols.** Describe what you want in plain English. AI selects from a library of pre-audited protocol bases (Uniswap, Aave, GMX…), configures parameters, forks the frontend, and deploys to testnet in minutes.

Domain: `shipdev.xyz` · Testnet target: HyperEVM · Working name: "Ship"

---

## 2. The problem

Every "AI builder" in crypto today does the same broken thing: they ask an LLM to write Solidity from scratch. The output is:

- **Unaudited** — no security review
- **Exploitable** — LLMs hallucinate vulnerabilities into contract code
- **Ugly** — AI-generated frontends look nothing like a real DeFi UI
- **Unusable in production** — no one deploys AI-generated contracts with real funds

Meanwhile, the DeFi power users who *know exactly what they want to ship* (5K+ Twitter followers, DeFi-native, idea-rich) can't code Solidity. They're blocked.

---

## 3. The insight: Fork-first, not generate-first

**AI should never write contracts or frontends from scratch.** Instead:

1. Maintain a **library of pre-audited protocol bases** (Uniswap V2, Aave V3, Compound V3, GMX V2, Lido V2, Curve V2, Morpho Blue…)
2. AI **picks the right base** for the user's intent and **configures parameters** (fees, collateral types, oracle sources, token names)
3. AI **forks the open-source frontend** of that base and rebrands it (colors, tokens, copy) — battle-tested UI, not hallucinated HTML
4. `solc-js` compiles the parameterized contracts; `ethers.js` deploys to testnet

> **Real code. Real audits. Real UIs. AI just picks and configures.**

This inverts the current market. Every competitor is selling "AI writes your contract." We're selling "AI ships a production-quality fork."

---

## 4. Who it's for

Primary: **Crypto power users with 5K+ Twitter followers** — DeFi-native, idea-rich, can't code.

Secondary:
- Hackathon builders who want a working DEX/lending protocol in an afternoon
- Small teams launching long-tail DeFi (niche AMMs, specialty lending markets)
- Researchers stress-testing parameter spaces for existing protocols

This is a **professional tool**, not a consumer app. Compact density, dark-only, Bloomberg-terminal vibes.

---

## 5. What's actually built (V1a — as of April 16, 2026)

### Pages shipped

| Route | What it does |
|---|---|
| `/` | Landing: hero prompt, rotating headlines, 5-step slideshow, protocol examples with previews, fork-first comparison, audited bases library, testimonial, CTA |
| `/register`, `/sign-in` | Split-layout auth (Google / GitHub / Wallet / email — UI only, backend V1b) |
| `/builder` | 3-panel workspace: chat │ config+frontend │ security panel |
| `/scanner` | Standalone protocol **threat modeling tool** |

### Protocol library (7 audited bases)

Uniswap V2 (DEX) · Aave V3 (Lending) · Compound V3 (Lending) · GMX V2 (Perpetuals) · Lido V2 (Staking) · Curve V2 (StableSwap) · Morpho Blue (Lending)

Each base ships with: parameter schema, impact tags, Nest/HyperEVM integration hooks.

### AI layer — three specialist agents (keyword-routed)

- **Protocol Architect (PA)** — base selection, parameter configuration
- **Frontend Engineer (FE)** — UI customization, theming, rebranding
- **Security Analyst (SA)** — risk review, admin model explanation

These are **prompt specializations, not execution agents**. Keyword-based router picks the right system prompt per message. Real execution (deploy, config updates, previews) is in the existing chat flow.

### Tier-based model routing (OpenRouter → Claude)

| Tier | Price | Model | Quota |
|---|---|---|---|
| Explorer | Free | Claude Haiku | 10 builds/mo |
| Builder | $29/mo | Claude Sonnet | 100 builds/mo |
| Protocol | $99/mo | Claude Opus | Unlimited |
| Enterprise | Custom | Opus | Unlimited |

Model quality *is* the pricing differentiator. No fine-tuning until we have 500+ real examples (would not beat good prompting before then).

### Deploy pipeline

1. `solc-js` compilation of parameterized contracts
2. `ethers.js` deployment to HyperEVM testnet
3. Step-by-step modal (compile → estimate → sign → deploy → verify)
4. Optional **Nest integration** — pool creation, LP seeding, Egg Initiative bribes

### Protocol Scanner (`/scanner`) — a product inside the product

Paste any protocol's contract addresses. Get back:

- **EIP-1967 proxy storage slot reads** (implementation, admin, beacon)
- **Bytecode selector detection** (pause, ownership, access control, timelock)
- **Gnosis Safe resolution** — pulls `getOwners()` / `getThreshold()`, ENS reverse-lookup for signers
- **Timelock detection** via `getMinDelay()` / `delay()`
- **Live TVL** from DeFiLlama
- **SEAL compliance scoring** — 5 checks: multisig ops, treasury, incident response, DPRK mitigation, access control
- **Attack scenario generation** — differentiated by admin type (EOA vs multisig vs governance)
- **"Verify it yourself" methodology** — Etherscan links, transparent reasoning

Registry covers Aave V3, Uniswap V3, Lido, MakerDAO, Predexon. Open-source, verifiable, educational — these are core to the product vision.

---

## 6. Tech stack

- **Framework:** Next.js 16 (App Router, React 19)
- **AI:** Vercel AI SDK v6 → OpenRouter → Claude
- **Contracts:** `solc-js` (parameter-level compile), `ethers.js` v6 (deploy)
- **Auth:** NextAuth.js v5 + SIWE (wallet sign-in)
- **Styling:** Tailwind v4 — true black + electric cyan `#00d4ff` + Instrument Serif
- **Data (planned):** Surf AI API (90+ endpoints across 12 domains) as breadth provider; direct HyperEVM RPC + Hyperliquid API for deploy-target endpoints
- **DB (planned):** Supabase / PostgreSQL (V1b)

---

## 7. Design system — "Terminal Luxe"

**Mood:** The density and function of a Bloomberg terminal, the polish of a luxury brand. Serious, precise, not playful. Where protocols get built. Real money. Real infrastructure.

- **Background:** `#000000` true black
- **Accent:** `#00d4ff` electric cyan — unclaimed in DeFi (Surf = pink, Bolt = blue, most DeFi = blue/green)
- **Display type:** Instrument Serif — nobody in DeFi uses serifs, instant differentiation
- **Body/UI:** Geist + Geist Mono (Vercel's font)
- **Density:** Compact, 4px base unit — power users want information density
- **Dark only** — crypto standard, all competitors are dark

Anti-slop rules: no purple gradients, no colored-circle feature grids, no decorative blobs, no emoji as design elements.

---

## 8. Nest / HyperEVM positioning

ShipDev is multi-chain capable, but **Nest on HyperEVM is the recommended default liquidity venue**.

**Why Nest:** ve(3,3) MetaDEX on HyperEVM. Deploying there gives tokens instant AMM liquidity, emissions-driven LP incentives via the Egg Initiative, and arb against HyperCore Spot (free market making). Hyperliquid = "the Everything Exchange."

ShipDev ships as part of the Nest ecosystem (alongside nest-app, nest-earn, nest-landing).

---

## 9. Market positioning

| | **ShipDev** | ChainGPT / GoCreate | Surf AI | Uniswap fork tooling |
|---|---|---|---|---|
| Approach | Fork audited bases | Generate Solidity from scratch | Data/research assistant | Manual fork + deploy |
| Security | Inherited from base | Unaudited LLM output | N/A | Manual review |
| Frontend | Forks real UI | Generates HTML | N/A | Manual |
| Target user | Power user, can't code | Hobbyist | Trader/analyst | Engineer |
| Deploy-ready | Yes (testnet today) | No | No | Yes but manual |

**Moat:** The protocol base library + fork-first methodology. Competitors chose the wrong architecture — to catch up they have to rebuild.

---

## 10. Why now

- DeFi UX / deployment stack is commoditized — the last mile is "describe what you want"
- Claude-class models are finally smart enough to do parameter selection reliably (not Solidity generation)
- HyperEVM + Hyperliquid ecosystem gives us a concentrated, high-velocity launch venue with real liquidity primitives (Nest)
- "Vibe coding" / Lovable / Bolt has trained users to expect "describe → ship" — nobody has brought that to crypto yet, and the naive attempts (generate-first) have poisoned the water for us to enter with the right architecture

---

## 11. Business model

- **Subscription SaaS** — $0 / $29 / $99 / custom tiers (see Section 5)
- **Model quality** as the price ladder (Haiku → Sonnet → Opus)
- Potential future revenue: deploy-time fees on mainnet, Nest liquidity referral, enterprise contracts for teams shipping many protocols

---

## 12. Roadmap

### V1a (shipped, on `feat/protocol-scanner` branch)
Landing, auth UI, 3-panel builder, 7-protocol library, 3-agent AI layer, deploy pipeline, protocol scanner, Nest integration, design system.

### V1b (next)
- Real **auth backend** → Supabase / NextAuth email provider
- **Actual frontend forking** — clone Uniswap/Aave UI repos + AI rebrand (currently AI-generated previews)
- **Database** — Supabase schema for projects, deploys, users
- **HyperEVM testnet chain enforcement** in wallet
- **Project persistence** (save/load configs)
- **Deploy history** view
- **Mobile responsive** pass
- **Tier → auth → quota** enforcement (currently hardcoded `"builder"` tier)
- **Scanner expansion** — more protocols, deeper admin chain tracing, governance proposal resolution

### V2 (vision)
- Mainnet deploys (multi-chain: HyperEVM, Base, Arbitrum, Mainnet)
- Protocol base marketplace — community submits audited bases
- Parameter backtesting against historical on-chain data
- Fork-of-a-fork lineage tracking

---

## 13. Key strategic decisions (for the deck's "philosophy" section)

1. **Fork, don't generate** — the entire wedge against incumbents
2. **Power users, not beginners** — Bloomberg terminal UX, not Duolingo
3. **Transparency as a feature** — the scanner's "verify it yourself" methodology is a product principle, not a feature
4. **Dark-only, serif display type, electric cyan** — distinct brand in a space that all looks the same
5. **Claude everywhere** — Haiku/Sonnet/Opus as the tier ladder, no multi-vendor complexity
6. **HyperEVM + Nest as the launch wedge** — concentrated ecosystem, real liquidity, aligned incentives

---

## 14. Suggested deck outline (for NotebookLM to generate)

1. **Title** — ShipDev. Lovable for Crypto.
2. **The problem** — AI crypto builders write Solidity from scratch. It's broken.
3. **The insight** — Fork-first, not generate-first.
4. **How it works** — describe → AI picks base → configures → forks frontend → deploys
5. **Demo: the builder** — 3-panel workspace screenshot
6. **Demo: the scanner** — show a live threat model of a real protocol
7. **Protocol library** — 7 bases today, expanding
8. **AI layer** — 3 specialist agents, tier-based model quality
9. **Deploy pipeline** — solc → ethers → HyperEVM + Nest
10. **Design — Terminal Luxe** — why we look like we do
11. **Market positioning** — why competitors can't catch up
12. **Business model** — $0 / $29 / $99 / enterprise
13. **Roadmap** — V1a shipped, V1b next, V2 vision
14. **The ask** — what we need from the team (hiring, eng focus, distribution help, etc.)

---

## 15. Taglines / copy to seed

- "Lovable for crypto."
- "Real code. Real audits. Real UIs. AI just picks and configures."
- "Fork-first, not generate-first."
- "Describe your protocol. Ship it by lunch."
- "The Bloomberg terminal of protocol building."
- "Stop asking AI to write Solidity. Start asking it to pick the right fork."
