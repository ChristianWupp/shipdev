# ShipDev × LaunchDev × Scanner — Launchpad Vision Context

> Source document for NotebookLM. Adds to the pitch deck with a sharper central thesis: *crypto's $100k-to-zero moment*. Frames the trio as the product that collapses the cost of shipping a real onchain business.

---

## 1. The central thesis

**Crypto moves slow because capital is required to even try.**

Software innovation exploded when the cost of trying an idea dropped from $5M (1999 enterprise stack) to $50k (2006: YC + AWS + open source) to near-zero (Cursor + Vercel + AI tools, 2024). Anyone with a laptop and $20/mo in subscriptions can ship a SaaS business today.

Crypto is stuck at 2006-pre-YC. To deploy a real onchain protocol, you need:
- **$50k–$200k for audits** (Trail of Bits, OpenZeppelin, Spearbit)
- **$30k–$100k+ for a Solidity team** to write contracts
- **$20k–$50k for a frontend** that looks like a real DeFi UI
- **Legal setup**, a multisig, a monitoring stack, a bug bounty
- And you do all of that *before* you find out if anyone wants the thing

Total: $100k+ to try a single idea.

This is why crypto innovation is slow. This is why the people with good ideas are blocked by the people with money. This is the problem the trio exists to solve.

## 2. The three constraints on every crypto builder

Every crypto founder hits the same three walls:

1. **Capital** — for audits, liquidity, audits-again-post-pivot, ops
2. **Talent** — Solidity engineers, security engineers, frontend engineers
3. **Trust** — crypto runs on reputation. If the deployer is unknown, the face-on-Twitter is sketchy, or a North Korean contractor is in the repo, user funds are gone

The trio attacks each constraint:

| Constraint | Solution | Product |
|---|---|---|
| Capital | Reduce capex; raise what's left | ShipDev + LaunchDev |
| Talent | AI picks from audited bases, configures parameters, forks the frontend | ShipDev |
| Trust | On-chain threat modeling, SEAL scoring, signer verification, raise gating | Scanner |

## 3. Why "just launch software" doesn't work in crypto

In SaaS, you try 10 ideas, 9 fail, one wins. Iteration is cheap.

In crypto, you try one idea, burn $150k, and if it doesn't hit, you're out of runway. You can't iterate because every iteration requires another audit, another liquidity bootstrap, another frontend build. Half of crypto's "dead protocols with $10M TVL" stopped shipping not because the product failed, but because **the burn rate in bear markets exceeds fee revenue.** Lending protocols with $10M TVL don't generate enough spread to cover $5–10k/mo of basic ops.

This matters for the deck: **ShipDev doesn't just lower the upfront cost. It lowers the iteration cost.** You ship, test, reconfigure, redeploy, and retry, all without a new audit bill. That's the real compounding unlock.

## 4. ShipDev = the AWS moment for crypto

The analogy to nail in the deck: **"ShipDev is what AWS was for software."**

- Before AWS (2005), starting a software company meant buying servers, renting a datacenter, paying a sysadmin. ~$50k+ of capex before you served a single user.
- After AWS, it was $20/mo.
- That single shift enabled the entire modern startup ecosystem: YC batches, SaaS boom, thousands of software companies per year.

Crypto has been waiting for its AWS moment. **Fork-first audited bases + AI parameter configuration + testnet deploy = that moment.**

The second-order effect: if crypto's capex drops 10–100x, the number of crypto companies that get tried will 10–100x. Most will fail. The winners will be protocols that couldn't exist today because nobody could afford to try them.

## 5. But capital doesn't go to zero

Even with ShipDev, a crypto business still needs capital for:
- A **security audit** before mainnet (even if the base is audited, the configured variant should be reviewed)
- **Initial liquidity** for the token and the product (LP seeding, bridging inventory)
- **Ops**: RPC, monitoring, Dune dashboards, bug bounties, compliance legal work
- **Marketing** in a community where nobody will touch unaudited capital

This is real money. Even a lean protocol needs $5–10k/mo to survive a bear market. Bigger protocols with sub-optimal fee models die *despite* having TVL because the maintenance burn exceeds real revenue.

**So the trio's second move is the capital layer.** After ShipDev drops the upfront capex, LaunchDev provides the capital for everything that still costs money.

## 6. LaunchDev: the raise primitive

**MetaDAO for EVM.** Nobody has built an EVM-native capital raise primitive that *feels* like a protocol deploy rather than a VC process. LaunchDev fills that gap.

### The non-obvious MetaDAO insight

Everyone praises MetaDAO for *futarchy*. That's the wrong signal. **MetaDAO's real PMF is transparency.** Investors can see exactly what happens to their deposit at every threshold, every vote, every unlock. Nobody else in crypto offers that. Futarchy is a mechanism; transparency is the product.

LaunchDev replicates the transparency. The futarchy voting piece is optional — most builders don't want governance markets, they want a raise that finishes. **We let the builder pick the raise template.**

### Raise mechanism menu (builder's choice)

The default is *not* "one orthodoxy." It's a menu:

1. **Dutch auction** (à la Gnosis EasyAuction, Balancer LBP) — price descends, fair settlement, no first-mover tax. Best for tokens with uncertain price discovery.
2. **Bonding curve with trading fees** (Pump.fun model) — token auto-lists on an AMM, price rises with buys. Platform takes % of trading fees on the curve. Best for community tokens.
3. **Fixed-price whitelist** (standard IDO) — pre-agreed price and cap, curated participants. Best for strategic raises.
4. **Futarchy-gated raise** (MetaDAO-style) — governance decision gates the raise and the use of proceeds. Best for DAOs and treasury deployments.

Each template ships with:
- Transparent cap table from day 1
- Pre-raise Scanner gate (must hit a SEAL score threshold)
- x402-exposed API so AI agents can participate
- Proceeds auto-routed to a user-owned multisig
- Public "verify it yourself" methodology

**The builder picks one at deploy time.** If they don't know which, LaunchDev suggests based on what they're building.

## 7. Revenue model for the trio

Three stacked revenue layers, each aligned with a different stage of the builder's journey:

| Stage | Product | Pricing | Why aligned |
|---|---|---|---|
| Build | ShipDev | SaaS subscription ($29 / $99 / enterprise), gated by AI model tier (Haiku / Sonnet / Opus) | Flat rate, no speculation, pays the AI bill |
| Verify | Scanner | Freemium + Pro ($19/mo) + team tier + x402-gated AI Audit API | Trust product, low friction, agents pay to read |
| Raise | LaunchDev | **% of trading fees** on the bonding curve (default) or **% of raised amount** for non-curve templates | Pays forever, scales with real usage, legally sane |

### What we deliberately avoid

**Taking a % of the token supply as the default.** It's VC-like, triggers securities law in the US, and misaligns us long-term (we benefit from dumps). Reserve token-supply deals for enterprise-only negotiations where the legal structure is bespoke.

### The compound effect

A protocol that ships through the trio generates revenue on every axis:
- Month 1: ShipDev subscription + Scanner pro
- Month 2 (at raise): LaunchDev trading fees or raise %
- Month 3+ (in production): Scanner monitoring + x402 agent traffic

Per customer ARR stacks by an order of magnitude vs. any single-product comp.

## 8. Chain recommendation: the Fork Availability Index

One of the hardest questions a new crypto builder faces: **"Where should I deploy?"**

Today the answer is guesswork — deploy where the VC told you, where the hackathon sponsor is, where your Twitter friends are. That's bad advice.

**The real answer is: deploy where there's no dominant fork of your thing yet, weighted by the chain's capital and user velocity.**

We build the **Fork Availability Index**: for every (protocol type × chain) pair, we track:
- Is there a dominant fork already deployed? (DeFiLlama, on-chain indexers)
- What's the TVL of that dominant fork?
- What's the chain's total liquidity velocity?
- What's the user acquisition cost in that ecosystem?

Then when a builder finishes configuring in ShipDev, we recommend:
> "You're building a Morpho Blue-style isolated lending market. This type has no dominant fork on Mega yet and TVL on Mega is $40M and growing 12% weekly. Recommendation: deploy on Mega. Runner-up: HyperEVM (existing Morpho fork, but small). Not recommended: Base (dominated by Morpho mainnet)."

### Our HyperEVM bias (stated openly)

We have a structural bias toward HyperEVM + Nest for three reasons:
1. Nest gives deployed protocols instant AMM liquidity and emissions, which reduces bootstrap friction
2. Hyperliquid ecosystem is currently the highest-velocity EVM launch venue
3. We're part of this ecosystem via Nest and we produce more value here than anywhere else

We tell users this upfront. Then we let them override. **Transparency over fake neutrality.**

## 9. Why the trio becomes the category-defining product

Every successful crypto launchpad today solves one thing:
- Pump.fun = bonding curve for memes
- Virtuals = bonding curve for AI agent tokens
- MetaDAO = transparency + futarchy for Solana DAOs
- Believe = X-post-to-token distribution

Each one is a single mechanic. Each one has real PMF on a narrow slice.

**The trio is not a single mechanic. It's a stack.** Build + verify + raise. That's a different product class. It's not "launchpad." It's **"the full 0-to-1 kit for a crypto business."**

Pitch line: *"Pump.fun made memecoins launchable. Virtuals made AI agent tokens launchable. We make real protocols launchable."*

## 10. What the deck should argue

Put simply, the pitch is one thesis in three moves:

**Move 1 (pain):** Crypto's capex problem is why crypto is slow. Every founder hits capital + talent + trust walls before they ship.

**Move 2 (insight):** The solution is to collapse each wall. AWS did this for software in 2006. No one has done it for crypto yet.

**Move 3 (product):** ShipDev collapses the build wall. Scanner collapses the trust wall. LaunchDev collapses the capital wall. Together, they're the AWS moment for crypto.

Every other section of the deck should serve this argument. Market size, competitive comparison, team, roadmap, traction, they all flow from "we're the capex collapse for crypto."

## 11. Seed content for NotebookLM

### Taglines

- *"Crypto's $100k-to-zero moment."*
- *"The AWS moment for crypto."*
- *"Three walls. One stack. Ship it."*
- *"Pump.fun made memecoins launchable. We make real protocols launchable."*
- *"Every idea deserves a deploy button."*
- *"Transparency is the feature. Raise types are the menu."*

### One-paragraph elevator pitch

> *ShipDev, Scanner, and LaunchDev are three products that collapse the cost of launching a real crypto business. ShipDev is AI-powered protocol building using audited bases, so you skip the $100k audit + team upfront. Scanner is the trust layer: every deployed protocol gets a public threat model, signer analysis, and SEAL score. LaunchDev is the raise primitive: Dutch auctions, bonding curves, futarchy raises, with transparent cap tables and agent participation via x402. Together, they're crypto's AWS moment, the capex collapse that turns one-shot-must-hit launches into iteration at software speed.*

### Three-number slide

- **$100k+** — average capex to try a single crypto idea today
- **~$0** — target capex after ShipDev + Scanner + LaunchDev
- **10–100×** — projected increase in crypto companies tried per year

### Comparables table (short form)

| Product | What they launch | Mechanic | PMF |
|---|---|---|---|
| Pump.fun | Memecoins | Bonding curve | Retail speculation |
| Virtuals | AI agent tokens | Bonding curve | Narrative timing |
| MetaDAO | Solana DAOs | Futarchy + transparency | DAO governance |
| Believe | Social tokens | X-post → token | Distribution |
| **The trio** | **Real DeFi protocols** | **Build + verify + raise stack** | **Capex collapse** |

### Suggested deck slides to generate

Add these to the existing deck outline:

- **The $100k wall** — why crypto doesn't iterate like software
- **The AWS moment analogy** — 2006 software vs 2026 crypto
- **The three walls** — capital, talent, trust
- **The three products, one loop** — trio architecture
- **Revenue stacks** — subscription + fees + raise %
- **The Fork Availability Index** — chain recommendation as a feature
- **MetaDAO PMF insight** — transparency is the product
- **Raise template menu** — builder's choice matters
- **Bear-market survivability** — why this matters even when markets cool

## 12. Addendum: where I deliberately pushed back

For honesty with the reader of this doc, things we *don't* do:

- We don't take a default % of token supply. Securities minefield. Enterprise-only.
- We don't pretend chain recommendation is neutral. HyperEVM bias is stated.
- We don't claim ShipDev replaces auditors for mainnet. The fork inherits the base audit. The variant still needs review for production.
- We don't promise futarchy will work for every raise. It's one of four templates.
