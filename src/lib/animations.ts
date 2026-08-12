import type { Transition } from "framer-motion";

/** Spring presets matching Apple's HIG motion values. */
export const springs = {
  /** Smooth, no bounce — default UI transitions. */
  default: {
    type: "spring",
    damping: 10,
    stiffness: 100,
    mass: 1,
  },

  /** Quick & snappy — buttons, small interactions. */
  snappy: {
    type: "spring",
    damping: 12,
    stiffness: 200,
    mass: 1,
  },

  /** Bouncy, playful — momentum/flick interactions. */
  bouncy: {
    type: "spring",
    damping: 8,
    stiffness: 100,
    mass: 1,
  },

  /** Slow & smooth — large elements, modals, drawers. */
  smooth: {
    type: "spring",
    damping: 15,
    stiffness: 60,
    mass: 1,
  },
} satisfies Record<string, Transition>;

/** Near-instant transition used when the user prefers reduced motion. */
export const reducedMotionTransition: Transition = { duration: 0.01 };
