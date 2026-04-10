# Design System — ShipDev

## Product Context
- **What this is:** Fork-first AI protocol builder. Power users describe what they want, AI selects audited bases, configures parameters, generates frontend, deploys to testnet.
- **Who it's for:** Crypto power users with 5K+ Twitter followers, DeFi-native, can't code but know exactly what to build.
- **Space/industry:** AI-powered crypto builder tools. Competitors: Surf AI, GoCreate, ChainGPT.
- **Project type:** Web app (builder workspace + landing page)

## Aesthetic Direction
- **Direction:** Terminal Luxe
- **Decoration level:** Intentional (subtle radial gradients on hero, dot patterns on backgrounds, no blobs or decorative elements)
- **Mood:** The density and function of a Bloomberg terminal, the polish of a luxury brand. Serious, powerful, precise. Not playful, not "vibes." This is where protocols get built. Real money. Real infrastructure.
- **Reference sites:** asksurf.ai (clean/minimal approach), bolt.new (dark/confident), Uniswap (DeFi standard)

## Typography
- **Display/Hero:** Instrument Serif 400/400i — the creative risk. Nobody in DeFi uses serifs. Signals sophistication and intentional design. Used for landing page hero, major section headings, and marketing copy only.
- **Body/UI:** Geist 300-700 — Vercel's own font. Clean, modern, excellent at small sizes. Designed for interfaces. Natural choice since we're on Vercel.
- **UI/Labels:** Geist 600 — same family, semibold weight for section labels, nav items, button text.
- **Data/Tables:** Geist Mono — matches body font family. Supports tabular-nums. Used for contract code, hex addresses, token amounts, parameter values, and any numerical data.
- **Code:** Geist Mono — same as data font. Consistent monospace throughout.
- **Loading:** Google Fonts for Instrument Serif. Geist is available via Vercel's font package (`@vercel/font` or `next/font`).
- **Scale:**
  - 72px — Hero headline (Instrument Serif)
  - 36px — Section title (Instrument Serif)
  - 18px — Subtitle/lead (Geist)
  - 15px — Body (Geist)
  - 13px — Body small / UI (Geist)
  - 12px — Labels / secondary (Geist)
  - 11px — Chips / tags / meta (Geist)
  - 10px — Section labels uppercase (Geist 600)
  - 13px — Code / data (Geist Mono)
  - 11px — Small data / addresses (Geist Mono)

## Color
- **Approach:** Restrained. One accent + neutrals. Color is rare and meaningful.
- **Background:** #000000 (true black, premium feel, pairs with cyan accent)
- **Surface:** #0a0a0a (barely lighter, for cards and panels)
- **Surface elevated:** #141414 (for inputs, modals, interactive elements)
- **Border:** #1f1f1f (subtle, hairline)
- **Text primary:** #fafafa (near-white, not pure white to reduce eye strain)
- **Text secondary:** #a3a3a3 (neutral-400, for body text and descriptions)
- **Text muted:** #525252 (neutral-600, for hints, meta, timestamps)
- **Accent:** #00d4ff (electric cyan, not blue, not green, not pink. Digital, alive, unique in the DeFi space)
- **Accent hover:** #00b8e6
- **Accent subtle:** #00d4ff15 (for backgrounds, highlights)
- **Success:** #34d399 (emerald-400, for audited status, compile success, enabled features)
- **Warning:** #fbbf24 (amber-400, for EOA warnings, config changes, recommendations)
- **Error:** #f87171 (red-400, for deploy failures, security issues, invalid params)
- **Info:** #00d4ff (same as accent, for informational alerts)
- **Dark mode:** Always dark. No light mode for V1. Crypto standard.

## Spacing
- **Base unit:** 4px
- **Density:** Compact (professional tool for power users, information density matters)
- **Scale:** 4(2xs) 8(xs) 12(sm) 16(md) 20(lg) 24(xl) 32(2xl) 48(3xl) 64(4xl)
- **Usage guidelines:**
  - Config rows: 8px vertical padding
  - Card padding: 12-16px
  - Section gaps: 24-32px
  - Page sections: 48-64px
  - Builder workspace panels: 16px internal padding

## Layout
- **Approach:** Hybrid (grid-disciplined for builder workspace, creative-editorial for landing page)
- **Builder workspace:** 3-column grid (chat 280-340px | config/preview flex | security 240-280px)
- **Landing page:** Single column, centered, max-width 640px for prompt area, full-bleed for hero
- **Max content width:** 1200px
- **Border radius:**
  - sm: 6px (buttons, inputs, chips)
  - md: 8px (cards, alerts)
  - lg: 10px (containers, panels)
  - xl: 12px (modals, hero prompt)
  - full: 9999px (pills, badges, dots)

## Motion
- **Approach:** Minimal-functional. Only transitions that aid comprehension.
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms)
- **Exceptions (intentional motion allowed):**
  - AI "thinking steps" animation: sequential reveal of reasoning steps with staggered fade-in
  - Deploy progress: step-by-step completion with green checkmark animations
  - Confetti/celebration on successful testnet deployment (the "I BUILT THIS" moment)
  - Tab transitions: subtle fade/slide when switching between Configuration/DNA/Frontend/Contracts
- **Everything else:** Instant. No entrance animations, no scroll-driven effects, no bouncy transitions.

## AI Slop Prevention
Never use in ShipDev:
- Purple/violet gradients
- 3-column feature grid with icons in colored circles
- Centered everything with uniform spacing
- Uniform bubbly border-radius on all elements
- Decorative blobs, floating circles, wavy SVG dividers
- Generic hero copy ("Welcome to ShipDev", "Unlock the power of...")
- Stock-photo-style hero sections
- Emoji as design elements

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-10 | Initial design system: Terminal Luxe | Created by /design-consultation. True black + electric cyan + Instrument Serif = unique positioning in crypto builder space. |
| 2026-04-10 | Instrument Serif for display (creative risk) | No DeFi product uses serifs. Instant visual differentiation. Adds warmth and sophistication to dark interface. |
| 2026-04-10 | Electric cyan #00d4ff accent | Surf uses pink. Bolt uses blue. Most DeFi uses blue/green. Cyan is unclaimed, reads as digital/alive/technical. |
| 2026-04-10 | True black #000000 background | Bolder than zinc-900. More premium (Apple-like). Sharp contrast with cyan accent. |
| 2026-04-10 | Compact density (4px base) | Power users want information density. This is a professional tool, not a consumer app. |
| 2026-04-10 | No light mode for V1 | Crypto standard is dark. All competitors are dark. Power users expect dark. |
