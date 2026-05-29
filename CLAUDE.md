# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Build to build/ directory
```

There is no lint or test script configured.

## Architecture

This is a single-page React + TypeScript + Vite app — a "Treasure Hunt" clicking game.

**All game logic lives in `src/App.tsx`** — there are no additional pages or routing. The `Box` interface tracks each chest's state (`id`, `isOpen`, `hasTreasure`). Three boxes are created on mount with one randomly assigned the treasure. Clicking a box calls `openBox()`, which scores +$100 for treasure or -$50 for a skeleton, then ends the game when the treasure is found or all boxes are opened.

**UI components** in `src/components/ui/` are shadcn/ui primitives (Radix UI + Tailwind). They are pre-generated boilerplate and rarely need modification.

**Assets:**
- `src/assets/` — chest images (`treasure_closed.png`, `treasure_opened.png`, `treasure_opened_skeleton.png`, `key.png`)
- `src/audios/` — sound files (`chest_open.mp3`, `chest_open_with_evil_laugh.mp3`)

**Key dependencies:**
- Animations: `motion/react` (Framer Motion)
- Styling: Tailwind CSS via `src/styles/globals.css`
- Path alias: `@` → `./src`

The `src/components/figma/ImageWithFallback.tsx` component is a utility for rendering images with a fallback, available if needed for chest display logic.
