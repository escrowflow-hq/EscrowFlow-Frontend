"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("rounded-xl bg-line/60", className)}
      animate={prefersReducedMotion ? undefined : { opacity: [0.6, 1, 0.6] }}
      transition={prefersReducedMotion ? undefined : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
