# ShipDev

**Fork-first AI protocol builder for crypto.** Describe what you want. AI selects audited bases, configures parameters, forks the frontend, and deploys to testnet. Think Lovable / Bolt, but for DeFi protocols instead of webapps.

Live domain: `shipdev.xyz` (WIP) · HyperEVM testnet for V1a.

---

## Why this exists

Every "AI builder" in crypto does the same broken thing: they ask an LLM to write Solidity from scratch. The output is unaudited, exploitable, and looks nothing like a real DeFi UI.

ShipDev inverts that. The AI never writes contracts or frontends from scratch. It **forks from a library of pre-audited protocol bases** (Uniswap, Aave, GMX, etc.) and configures parameters. Same for the UI — we fork the open-source frontends of those protocols and rebrand them.

> **Fork-first, not generate-first.** Real code. Real audits. Real UIs. AI just picks and configures.

---

## What's actually built (V1a)

### Pages
| Route | What it does |
|---|---|
| `/` | Landing — hero prompt, rotating headlines, 5-step slideshow, protocol examples, fork-first comparison, audited bases library |
| `/register`, `/sign-in` | Split-layout auth screens (Google / GitHub / Wallet / email — UI only, backend is V1b) |
| `/builder` | 3-panel workspace — chat │ config+frontend │ security panel |
| `/scanner` | Standalone protocol **threat modeling tool** — on-chain analysis, SEAL scoring, attack scenarios |

### Protocol library (`lib/protocols/`)
Seven audited bases registered, each with parameters, impacts, and Nest integration hooks:

- **Uniswap V2** (DEX)
- **Aave V3** (Lending)
- **Compound V3** (Lending)
- **GMX V2** (Perpetuals)
- **Lido V2** (Staking)
- **Curve V2** (StableSwap)
- **Morpho Blue** (Lending)

### AI layer (`lib/agents/`)
Three specialist prompts, keyword-routed:

- **Protocol Architect (PA)** — base selection, parameter config
- **Frontend Engineer (FE)** — UI customization, theming
- **Security Analyst (SA)** — risk review, admin model explanation

Tier-based model routing via OpenRouter:

| Tier | Model | Quota |
|---|---|---|
| Explorer (free) | Claude Haiku | 10 builds/mo |
| Builder ($29) | Claude Sonnet | 100 builds/mo |
| Protocol ($99) | Claude Opus | Unlimited |

### Deploy pipeline (`lib/deploy/`)
1. `solc-js` compilation of parameterized contracts
2. `ethers.js` deployment to HyperEVM testnet
3. Step-by-step deploy modal (compile → estimate → sign → deploy → verify)
4. Optional **Nest integration** on HyperEVM — pool creation, LP seeding, Egg Initiative bribes

### Protocol Scanner (`/scanner`)
This is a whole product-in-a-product. Pastes any protocol contract addresses and returns:

- EIP-1967 proxy storage slot reads (implementation, admin, beacon)
- Bytecode selector detection (pause, ownership, access control, timelock)
- **Gnosis Safe resolution** — pulls `getOwners()` / `getThreshold()`, ENS reverse-lookup for signers
- Timelock detection via `getMinDelay()` / `delay()`
- Live TVL from DeFiLlama
- **SEAL compliance scoring** (5 checks: multisig ops, treasury, incident response, DPRK mitigation, access control)
- Attack scenario generation (differentiated by admin type — EOA vs multisig vs governance)
- "Verify it yourself" methodology section with Etherscan links

Registry currently covers Aave V3, Uniswap V3, Lido, MakerDAO, Predexon.

---

## Stack

- **Framework:** Next.js 16 (App Router, React 19) — **note: APIs and conventions differ from your training data, read `node_modules/next/dist/docs/` before editing**
- **AI:** Vercel AI SDK v6 + OpenRouter → Claude
- **Contracts:** `solc-js` for parameter-level compile, `ethers.js` v6 for deploy
- **Auth:** NextAuth.js v5 with SIWE (wallet) — backend pending
- **Styling:** Tailwind v4, true black + electric cyan (`#00d4ff`) + Instrument Serif — see `DESIGN.md`
- **Data (planned):** Surf AI API as breadth provider, direct HyperEVM RPC / Hyperliquid API for deploy targets — see memory `project_data_api_strategy.md`
- **DB (planned):** Supabase / PostgreSQL — V1b

---

## Running it locally

```bash
git clone https://github.com/Satsyxbt/shipdev.git
cd shipdev
git checkout feat/protocol-scanner   # all real work is here, main is empty
npm install
cp .env.local.example .env.local     # fill in OPENROUTER_API_KEY, NEXTAUTH_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Env vars you'll need
```
OPENROUTER_API_KEY=...          # for AI chat
NEXTAUTH_SECRET=...             # any random string
NEXTAUTH_URL=http://localhost:3000
# optional:
DEFILLAMA_API=                  # scanner TVL (public, no key needed)
ETHERSCAN_API_KEY=...           # scanner verification links
```

---

## Architecture at a glance

```
app/
  page.tsx                 → landing
  builder/                 → 3-panel builder workspace
  scanner/                 → protocol threat scanner
  api/
    chat/                  → Vercel AI SDK streaming endpoint
    deploy/                → solc + ethers deploy pipeline
    scanner/               → on-chain analysis endpoint
    siwe/, auth/           → wallet + session auth

lib/
  protocols/               → 7 fork-first protocol bases (params, impacts, nest config)
  agents/                  → PA / FE / SA system prompts + keyword router + tier routing
  deploy/                  → compile + deploy orchestration
  security/                → open-source SEAL-style scoring
  scanner/                 → analyze.ts (~400 LOC), protocols.ts registry
  nest/                    → HyperEVM/Nest liquidity integration
```

See `CLAUDE.md` and `DESIGN.md` for coding conventions and the visual system.

---

## What's NOT done (V1b roadmap)

- [ ] Real auth backend wired to Supabase / NextAuth email provider
- [ ] **Actual frontend forking** — clone Uniswap/Aave UI repos + AI rebrand, not AI-generated HTML previews
- [ ] Database schema for saved projects, deploy history, configs
- [ ] HyperEVM testnet chain enforcement in wallet
- [ ] Project persistence (save/load configs)
- [ ] Deploy history view
- [ ] Mobile responsive pass
- [ ] Tier → auth → quota enforcement (currently hardcoded `"builder"` in `app/api/chat/route.ts`)
- [ ] Expand scanner protocol registry, deeper admin chain tracing, governance proposal resolution

---

## POC suggestions for contributors

Good self-contained starting points for a POC / demo:

1. **Add a new protocol base** — pick something with a clean open-source repo (Balancer, Sushi, Pendle). Follow the shape of `lib/protocols/aave-v3.ts`. Register it in the builder.
2. **Wire the scanner to a new protocol** — add to `lib/scanner/protocols.ts` with its contract addresses and impact tags.
3. **Real frontend forking** — build the v1 of the `FE` agent that git-clones a protocol UI repo, swaps token names/colors/branding, and previews it in the builder's Frontend tab.
4. **Database layer** — Supabase schema for `projects`, `deployments`, `users`. Wire save/load to the builder.
5. **HyperEVM deploy hardening** — chain enforcement, block explorer verification, Nest pool creation as a post-deploy step.

Each of the above is ~1–3 days of focused work and ships as an independent PR.

---

## Repo state

- Default branch: `main` (only initial commit, do not base off it)
- Active branch: **`feat/protocol-scanner`** — all V1a work lives here
- No CI yet, no tests yet (V1b)

---

## License

TBD. Private/pre-release for now.
