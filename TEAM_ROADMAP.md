# ShipDev — Team Roadmap & Open Questions

> Dev team brief. What to execute now, what to think about, what we still need to decide.

---

## 1. Execute now — marketing & distribution prep

These don't block engineering but need to ship in parallel with V1b. Assign owners.

- **Pitch deck** — feed `PITCH_CONTEXT.md` into NotebookLM, generate v1, iterate
- **Branding suite** — logo, X banner, color/type lockups, social avatar. Full brand kit
- **GitBook (free tier)** — public docs site: getting started, protocol library reference, scanner methodology, agent tier explainer
- **Launch videos** — tool stack options:
  - **FalAI / Mitte** — AI-generated shots, fast iteration, hero visuals
  - **Remotion** — React-based programmatic video (`remotion.dev`). Write videos like Next.js components. Great for UI walkthroughs, animated code, data-driven scenes, and anything that should look *exactly* like the product. On-brand for us (devs making videos with code)
  - Suggested split: Remotion for product walkthroughs (builder + scanner demos, since they replay real UI), FalAI/Mitte for hero / cinematic / ambient shots
  - Deliverables: 60s product demo (describe → ship), 30s scanner demo, 15s loops for X / TikTok

---

## 2. Execute now — SEO & content engine

The scanner is our SEO Trojan horse. Treat it as a content product. The angle is **loss prevention**, not success stories.

- **Case-study landing modules** for `/scanner` — "Had you scanned it, you wouldn't have deposited":
  - Post-mortem each major hack through the scanner. Show what the scanner *would have flagged* before the exploit.
  - Candidates: **KelpDAO**, **Drift**, and other high-profile exploits where admin model / proxy setup / signer concentration was the root cause
  - Format: protocol name → 1-line story of what happened → scanner output screenshot with the red flags circled → CTA ("scan before you deposit")
- **Build out the case-example carousel** on landing — use the same post-mortem framing
- **SEO posts powered by scanner output** — pre-render scanner reports for top 50 protocols as static pages, indexable by Google ("Aave V3 admin model," "Lido security score," "[Protocol] signer analysis," etc.)
- **"Would the scanner have caught it?" series** — regular blog/X content walking through each new hack and running the scanner against the exploited protocol. Evergreen SEO.

---

## 3. Execute now — Engineering priorities

### Library expansion (highest leverage)
- **Add more audited bases** (smart contracts + matching open-source frontends)
  - Candidates: Balancer, Sushi, Pendle, Maker, Synthetix (see Section 3b for the full target list)
  - Each base = `lib/protocols/<name>.ts` + frontend fork registration
- **Make parameter configuration easy as fuck**
  - Ongoing explanatory step-by-step tutorial that walks the user through each parameter
  - Plain-English explanation per param (what it does, what happens if you change it, sensible default)
  - "Recommended preset" buttons (Conservative / Standard / Aggressive)

### UI / UX polish — "what would a non-dev think?"
- **UI has a lot of room for improvement** — pull inspo from Emergent (current top reference) and keep ShipDev's Terminal Luxe identity
- **The non-dev test** — for every screen, ask: *"what would a non-dev think of this? what does this word/button mean to them?"* If the answer is "I don't know," simplify or explain inline
- **Rule:** complexity stays under the hood. The surface is plain English + sensible defaults + a single primary action

---

## 3b. Library strategy — beyond the top-forked 3 categories

**Insight from [DeFiLlama Forks](https://defillama.com/forks):** the top-forked protocol TAM is **$6B+ TVL** right now. But the categories are narrow — essentially:
- DEX (Uniswap, Algebra, Curve, Balancer)
- Borrow/Lending (Aave, Compound, Liquity)
- Perps (GMX)

If we stay strictly "no-slop, audited bases only," we limit what crypto power users can dream up. So we split the library into **two tracks**:

### Track A — Audited forks (smart contracts)
Keep the no-slop thesis. Fork the battle-tested stuff.
- Expand current 7 bases → aggressively add top forks in the three categories above

### Track B — Frontend + liquidity aggregation (no new contracts)
For **hot narratives that already have onchain liquidity**, we don't fork a contract — we build the beautiful UI on top and aggregate liquidity from the existing market.

Example: **Prediction markets.** User wants to build one. Polymarket's order book is onchain. We give them a gorgeous frontend + API aggregation against Polymarket/Kalshi liquidity. Their "app" is the interface + distribution to their community. **No new contracts. Still fits the no-slop thesis. Faster to ship.**

**General principle:** whenever a new hot narrative hits (prediction markets, points, seasons, whatever), we don't reinvent the wheel. We give users the updated tool to ride that wave. ShipDev stays current-with-crypto by default.

### Target category expansion (by narrative)
Pull from each of these — some as Track A forks, some as Track B UI+aggregation:

| Category | Notable protocols to fork/wrap |
|---|---|
| **Prediction Markets** | Polymarket, Kalshi (Track B — aggregate) |
| **Launchpads** | Virtuals, Pumpfun, MetaDAO |
| **Stablecoins** | M0, Ethena whitelabel |
| **Liquid Staking** | Lido, Rocket, Frax |
| **Vaults** | Ethena, Veda, Concrete |
| **Tokenization / RWA** | Equities onchain, gold, insurance, re-insurance |
| **Neobanks** | Kulipa, Rain, Gnosis Pay |
| **Yield** | Pendle, Spectra |
| **Basis trading** | Ethena-style |
| **Options** | Rysk (UI on top of RFQ), Hypersurface (DEX Hedge) |
| **DEX variants** | Aerodrome, Fluid, Strata, PancakeSwap fork |
| **Wallets** | Custom wallet frontends |
| **Trading apps** | FOMO, Based, DreamCash, Aave Savings App |
| **Telegram bots** | GMGN-style |
| **DePIN** | Ore (gamified mining), subnet-style rewards |
| **Tokenization games** | "Pokemon-style" collecting via tokenization |
| **veNFT marketplace** | Curve-style vote-escrow NFT trading |
| **Dashboards** | Dexscreener / CoinTracker / TreeNews clones |
| **Governance aggregators** | Protocols on top of protocols — accumulators for governance tokens |
| **AI subnets** | Bittensor/TAO subnet templates |

### Tokenomics + GTM as a first-class feature
Beyond "what to fork," ShipDev should **advise on the go-to-market**:
- **New tokenomics models** on top of existing PMF ideas (see Aerodrome, Project X — new tokenomics *is* the edge)
- **GTM based on trending narratives** — Points, Seasons, Airdrops, the "Satoshi vision" playbook that Hyperliquid made famous
- **Capital raise mechanisms** — MetaDAO-style raises for EVM, Flying Tulip's raise model
- **Advice when a chain has a missing category** — if a chain has no DEX / no lending / no perps, suggest deploying the right base there (TAM arbitrage)

### Agency infrastructure for the team
- **Wire in Agency QA** — automated QA agents on every PR to ensure "Terminal Luxe" consistency
- **OpenClaw overnight mode** — agents working the backlog and improving the system while the team sleeps
- **Self-improvement agents** — meta-agents that propose fixes/refactors to our own system

### Scanner expansion — AI Audit + Wallet Scanner
The `/scanner` today is protocol-centric. Expand it into a full **defensive suite**:

- **AI Audit mode** — user pastes any contract or proxy address; scanner returns a full AI-written audit report (admin model, upgrade paths, signer risk, bytecode findings, SEAL score, attack scenarios). This is a natural evolution of the current scanner, but packaged as a standalone report.
- **Wallet Scanner** — user connects a wallet, we:
  - Enumerate **active token approvals** across every supported chain (ETH, Base, Arbitrum, HyperEVM, Solana later)
  - Flag approvals granted to **risky/unverified/recently-exploited contracts** (cross-referenced with scanner data)
  - **One-click revoke** for any approval (like `revoke.cash`, but AI-explained and integrated with our scanner intel)
  - Historical view: when did you approve it, what was its risk rating at the time vs. now
- **Why it matters:** gives us a defensive product that pulls users who aren't ready to build yet, feeds them into the top of the funnel, and proves trust. Same open-source / "verify it yourself" ethos as the protocol scanner.

### Production & Scaling (Goal: 1K+ paid users/day)
- **High-availability RPC strategy** — redundant providers (Alchemy/QuickNode) for HyperEVM and other target chains
- **Async Compile/Deploy Queue** — move `solc-js` and `ethers.js` calls to a robust worker queue (BullMQ) to handle concurrent load
- **Cost & Margin Modeling** — analyze OpenRouter/Claude spend per build vs. tier pricing
- **Observability** — implement Sentry and PostHog to track conversion and failures in real-time


---

## 4. Open architectural questions (decide this week)

### Q1: Why `solc-js` + `ethers.js`?
> *Question from notes: "solc-js compiles the parameterized contracts; ethers.js deploys to testnet? Why?"*

Decision needed. Options:
- **Stay on solc-js + ethers.js** — pure JS, no extra deps, runs in Node. Fine for parameter-level compile.
- **Move to Foundry / Hardhat** — better tooling, real test suite, mainstream DX. More infra to maintain.
- **Hybrid** — solc-js for the live builder preview (fast feedback), Foundry for the final mainnet deploy (when V2 lands).

Recommend: hybrid. Keep solc-js for hot path, add Foundry pipeline for V2.

### Q2: Nest / HyperEVM positioning
> *Question from notes: "nest positioning not 100% needed... can deploy anywhere. Solana is where new crypto startups happen. Look at Alliance (YC of crypto) — we could be a tool given to Alliance users."*

Decision needed. Options:
- **Stay Nest-default** — concentrated launch, real liquidity, aligned ecosystem. Risk: smaller TAM, ties brand to Hyperliquid narrative.
- **Chain-agnostic with Nest as one option** — deploy anywhere (HyperEVM, Base, Arbitrum, mainnet, **Solana**). Pitch to Alliance / a16z crypto / general builders. Bigger TAM, less moat.
- **Both: ship chain-agnostic, market Nest** — engineering supports any chain, marketing leans Nest until we have a reason not to.

Recommend: third option. Build chain-agnostic from the start; lead marketing with HyperEVM+Nest; quietly support Base/Arbitrum/Solana for Alliance-style distribution.

### Q3: Solana & non-EVM — what's the forking story?
> *Question from notes: "what happens if they wanna build in Solana? Rust code? how do we fork this?"*

Things to decide:
- **Rust forking is harder than Solidity forking** — no `solc-js` equivalent, Anchor builds are heavier, IDL-driven
- **Option A — Solana as Track B only** — ship frontend + program aggregation (wrap existing Solana programs like Jupiter, Kamino). No compilation pipeline on our side.
- **Option B — Full Solana support with Anchor** — add a Rust/Anchor compile+deploy pipeline. Real eng cost. Real differentiation.
- **Option C — Defer Solana to V2** — lean EVM-first; revisit once the EVM library + user base is proven

Recommend: start with Option A (wrap don't fork). Revisit B when a paying customer demands it.

### Q4: Scaling for 1K+ paid DAUs
> *Question from notes: "how do we take this to prod if it has 1K+ paid active users/day, what do we need?"*

Things to spec:
- **AI cost model** — at 1K DAU × 10 builds/day × Sonnet pricing, what's monthly OpenRouter spend? Margin math against $29 tier.
- **Rate limiting & quota enforcement** per tier (Redis or DB-backed counters)
- **Queue for compile + deploy** (BullMQ / Upstash) — solc + RPC are not request-time work
- **RPC strategy** — dedicated HyperEVM/Base/Solana RPC endpoints (Alchemy / QuickNode), not public ones
- **Database scaling plan** — Supabase Pro tier sizing, read replicas if needed
- **Observability** — Sentry, PostHog, OpenRouter usage dashboard
- **Status page + on-call rotation** before we have paying users depending on us

---

## 5. Pricing — decision needed

Two candidate models. Pick one (or ship both as user choice).

### Option A — Managed wallet (ShipDev custodies)
- Monthly subscription, multiple tiers
- Deploy to **testnet only**
- User does NOT own the deployed contracts (we do)
- Lower friction, faster onboarding

### Option B — Full user ownership
- Monthly subscription, multiple tiers (likely more expensive — costlier model + real-chain gas)
- Deploy to **mainnet (ETH for POC)**
- All contract ownership transferred to user's wallet
- Higher friction, real product

### Across both: tier ladder by model quality
| Tier | Model |
|---|---|
| Explorer (free) | Haiku |
| Builder | Sonnet |
| Protocol | Opus |

### Plus: % of token supply
- For protocols that launch a token through ShipDev, take a small % of supply (alignment + upside)
- Optional / negotiable per project — primarily an enterprise lever

### Cost dimensions to model
Before we lock pricing, the finance model needs all of these in one sheet:
- **API cost** — OpenRouter/Claude per-build, per-tier
- **Subscription cost** — what we charge monthly
- **Token cost** — % of supply if they launch to mainnet / raise
- **Content & brand package** — add-on (logo, site, deck) as a one-time upsell
- **Compute & infra** — RPC, DB, queue workers at 1K DAU
- **Audit pass-through** — if users want a deeper audit on their fork, we can route to partners

### Comparison table — ShipDev vs dev shop
We need a public-facing comparison table on the landing page. Rough cut:

| | **ShipDev** | Traditional dev shop |
|---|---|---|
| Time to testnet | Minutes | 4–8 weeks |
| Cost | $29–$99/mo | $50k–$200k |
| Security | Inherited from audited bases | Depends on shop |
| Iteration speed | Instant (re-prompt) | Days per change |
| Ownership | User's wallet (Option B) | User (after handoff) |
| Frontend | Forked from real protocol UI | Custom (quality varies) |
| GTM support | Built-in advisor + RiseLabs concierge | Usually none |

---

## 6. Big strategic ideas to bake in

### Idea 1 — Agent-accessible by default
> Everyone went nuts on building AI agents. The protocols ShipDev spits out should be **accessible to agents by default** — standard interfaces, machine-readable docs, agent-friendly UIs.

**Action items:**
- FE agent generates components with semantic landmarks + ARIA + machine-readable metadata
- Auto-generate `agent.json` / OpenAPI-style spec for each deployed protocol
- Ship an "Agent SDK" snippet on every deployed protocol page

This is a real narrative win — we become the way agents get *new* protocols to interact with.

### Idea 2 — Protocol factory for the agent economy
> "Basically it's a mini factory of new protocols that can interact with agents."

Pitch framing for V2: **ShipDev is the supply side of the agent economy.** Every protocol shipped through us is a new tool agents can call. Position the platform as infrastructure, not just a builder.

### Idea 3 — YC-style idea evaluation layer
Before a user starts configuring, offer an optional "**is this a good idea?**" pass — Garry Tan / YC office-hours style. Could be a `/ceo-evaluate-idea` or `/office-hours` skill baked into the chat.

What it does:
- Challenges the premise (demand, desperate specificity, narrowest wedge)
- Suggests tokenomics angles (points, seasons, veToken, airdrops)
- Flags category saturation or opportunity gaps per chain

**Why:** most "power users with ideas" have good instincts but no framework. This adds real value without changing our core product.

### Idea 4 — ShipDev as a launchpad (the big vision)
> *From notes: "what if we make it be more than a tool but a launchpad — follows MetaDAO standards, deploys on Hyperliquid. Best product ever: full suite 0→1. ShipDev gets you to testnet, branding, landing, website… then you raise via MetaDAO-alike, deploy via Hyperliquid + Nest."*

The expanded framing: **ShipDev is the 0-to-1 launchpad for crypto.**
- **Ideate** — idea evaluation layer (Idea 3)
- **Build** — fork audited base, configure, generate frontend
- **Brand** — branding suite / content package as an upsell
- **Test** — testnet deploy + scanner threat model
- **Raise** — MetaDAO-standard raise mechanism (or Flying Tulip model) for EVM users
- **Launch** — deploy on the best venue (Hyperliquid + Nest for EVM; revisit for others)
- **Distribute** — agent-accessible by default (Idea 1)

This reframes ShipDev from "AI tool" to **"the full-stack launchpad"** — and positions it as the launchpad that gets chosen when Hyperliquid hits its next wave.

### Idea 5 — RiseLabs concierge layer
Before a user raises or deploys to mainnet, they can opt into **RiseLabs concierge** — manual help on GTM, audit routing, investor intros, VC/incubator warm intros. This is the trust bridge: crypto is trust, MVP tooling alone isn't enough to close a serious founder. The concierge is how we earn that trust at the top of the funnel.

### Idea 6 — ShipDev suggests ideas (demand-driven deploys)
Flip the flow: instead of waiting for users to bring an idea, **ShipDev suggests what to deploy** based on:
- Chains with a missing top-forked category (TAM arbitrage)
- Trending narratives with no dominant product yet
- User's wallet context (what they hold, what ecosystems they're in)

---

## 7. Who we sell to (ICP — locked)

1. **Crypto power users with ideas** — DeFi-native, idea-rich, can't code
2. **Hackathon builders** — need a working DEX/lending in an afternoon
3. **Chains-as-a-service** — chains that want to bootstrap their ecosystem with one-click protocol launches (HyperEVM today, others tomorrow)

Bonus channel: **Alliance / a16z crypto / Orange DAO** — distribute as a tool to their portfolio companies.

---

## 8. MVP vs Final

### MVP (V1a → V1b — what we ship to first paying users)
- 7-protocol library + parameter config
- Forked frontend previews (real fork, not AI HTML)
- Testnet deploy (managed wallet model)
- Scanner as standalone product + SEO surface
- Auth + DB + project persistence
- Tier-gated AI quality
- One chain: HyperEVM (+Nest)

### Final (V2 — vision: the full-stack launchpad)
- **Track A** — 20+ audited smart contract bases across DEX / Lending / Perps / Staking
- **Track B** — Frontend + liquidity aggregation for hot narratives (prediction markets, vaults, yield, tokenization, trading apps, DePIN, subnets, etc.)
- **Idea evaluation layer** — YC-style office-hours skill before build
- **Branding + content package** — add-on for the 0-to-1 founder
- **Mainnet deploy** with full user ownership
- **Multi-chain** — HyperEVM, Base, Arbitrum, Mainnet, Solana (via Track B wrapping initially)
- **Agent-native protocols** — every output is agent-callable by default
- **Protocol marketplace** — community-submitted bases, audited and listed
- **Parameter backtesting** against historical on-chain data
- **Tokenomics + GTM advisor** — points / seasons / airdrops playbook suggestions
- **Raise mechanism** — MetaDAO-standard capital raise for EVM users
- **Deploy venue routing** — Hyperliquid + Nest default for EVM; optimal venue per chain
- **RiseLabs concierge** — manual trust layer for serious founders
- **Token-supply revenue share** for protocols that launch through us

---

## 9. This week's action grid

| Owner | Task | Due |
|---|---|---|
| Founder | Pitch deck v1 via NotebookLM | This week |
| Design | Branding suite (logo, X banner, kit) | This week |
| Marketing | GitBook free tier + first 5 docs | This week |
| Marketing | Demo videos (Remotion for product walkthroughs, FalAI/Mitte for hero shots) — 60s + 30s + 15s loops | Next week |
| Eng lead | Decide solc-js vs Foundry (Q1) | This week |
| Eng lead | Decide chain strategy (Q2) | This week |
| Eng lead | 1K-DAU scaling spec (Q3) | Next week |
| Eng | Add 3 new protocol bases (Balancer, Pendle, Sushi) | Next 2 weeks |
| Eng | Step-by-step parameter tutorial in builder | Next 2 weeks |
| Eng | UX pass — "what would a non-dev think?" on every screen, Emergent inspo | Next 2 weeks |
| Eng | Real auth backend + DB schema | Next 2 weeks |
| Eng | Wire Agency QA + OpenClaw overnight loop | Next 2 weeks |
| Eng | Prototype Track B — frontend-only build (pick: prediction markets or vaults) | Next 2 weeks |
| Eng | AI Audit mode for `/scanner` (standalone report output) | Next 2 weeks |
| Eng | Wallet Scanner — approval enumeration + one-click revoke (multi-chain) | Next 3 weeks |
| Marketing | "Would the scanner have caught it?" post-mortem on KelpDAO + Drift | This week |
| Eng | Idea evaluation skill (`/office-hours` style) in chat | Next 2 weeks |
| Eng lead | Decide Solana/Rust strategy (Q3) | Next week |
| Founder | Lock pricing model (Option A / B / both) + cost-dimension sheet | This week |
| Founder | Draft ShipDev-vs-dev-shop comparison table for landing | This week |
| Founder | Outreach: Alliance, Hyperliquid, Nest, MetaDAO, scanner case-study teams | Ongoing |
| Founder | Spec RiseLabs concierge layer (intake, pricing, partner list) | Next 2 weeks |
