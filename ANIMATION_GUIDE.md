# EscrowFlow Animation Guide

Framer Motion, applied on top of the existing Tailwind design system — no
parallel styling system, no duplicate components.

## Spring presets (`src/lib/animations.ts`)

| Preset    | Use case                              |
| --------- | -------------------------------------- |
| `default` | General-purpose UI transitions         |
| `snappy`  | Buttons, taps, small interactions      |
| `bouncy`  | Momentum / flick interactions          |
| `smooth`  | Large elements — modals, drawers       |

`reducedMotionTransition` (a near-instant `{ duration: 0.01 }`) is swapped in
whenever `useReducedMotion()` reports the user prefers reduced motion.

## Components

### `Button` / `LinkButton` (`src/components/ui/Button.tsx`)
Existing button API unchanged (`variant`, `size`, `disabled`, ...props).
Now scales to 1.02 on hover / 0.98 on tap with the `snappy` spring.
`LinkButton` wraps `next/link` via `motion.create(Link)` so the same feedback
applies to link-styled buttons.

### `Modal` (`src/components/ui/Modal.tsx`)
`isOpen`, `onClose`, `title`, `children`. Backdrop fades in/out; panel enters
with a `smooth` spring (slide + fade), fully interruptible via
`AnimatePresence`.

### `Toast` (`src/components/ui/Toast.tsx`)
`message`, `type` (`success` | `error` | `warning` | `info`), `isVisible`,
`onClose`, optional `duration` (defaults to 3000ms). Auto-dismisses via a
`useEffect` timer keyed on `isVisible` — not on animation completion, so it
won't re-fire on exit.

### `Skeleton` (`src/components/ui/Skeleton.tsx`)
`className` for sizing. Shimmering opacity pulse; static when reduced motion
is preferred. Used for the dashboard's loading state.

## Typography (`tailwind.config.ts`)
Added `text-display-lg`, `text-display-md`, `text-heading-lg/md/sm`,
`text-body-lg`, `text-label-caps`, `text-caption` to the existing Tailwind
`fontSize` scale. `text-base` / `text-sm` were left as-is since they already
matched the intended body sizes — no need to duplicate them.

## Reduced motion (`src/hooks/useReducedMotion.ts`)
Tracks `(prefers-reduced-motion: reduce)` live via `matchMedia`. Every
animated component checks it and either skips the animation or uses
`reducedMotionTransition`.

## Dashboard (`src/app/app/page.tsx`)
Loading state now uses the shared `Skeleton`. The projects grid and recent
payments list stagger in with the `default` spring (0.06s stagger), skipped
entirely under reduced motion.

## Testing
1. Hover/tap a button — should feel snappy, no lag.
2. Open/close a `Modal` — slide + fade, interruptible mid-animation.
3. Trigger a `Toast` — enters top-left-ish offset, auto-dismisses once
   after ~3s, no repeat-fire on close.
4. Enable OS-level reduced motion — all of the above should become
   near-instant with no scale/slide/stagger.
5. Keyboard: buttons and the modal close button remain focusable and
   operable via keyboard.

## Notes
- `window.matchMedia` is polyfilled in `src/test/setup.ts` since jsdom
  doesn't implement it — needed once any component uses
  `useReducedMotion`.
- `Button.tsx` and `useReducedMotion.ts` are marked `"use client"` since
  they're pulled in by Server Components (e.g. the landing page hero).
