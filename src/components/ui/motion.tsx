"use client";

// Shared animation primitives. Every page uses these so motion feels like one system:
// soft fade-up entrances, staggered lists, and springy press/hover feedback.
import { motion, type HTMLMotionProps, type Variants } from "motion/react";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const SPRING = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE } },
};

/** Fades + slides its children in on mount. */
export function FadeIn({ delay = 0, y = 14, ...props }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      {...props}
    />
  );
}

/** Container that staggers <StaggerItem> children as they enter. */
export function Stagger({ gap = 0.05, delay = 0, ...props }: HTMLMotionProps<"div"> & { gap?: number; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...props}
    />
  );
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={fadeUp} {...props} />;
}

/** Card that lifts on hover and compresses on press. */
export function HoverCard(props: HTMLMotionProps<"div">) {
  return <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.985 }} transition={SPRING} {...props} />;
}

export { motion, AnimatePresence } from "motion/react";
