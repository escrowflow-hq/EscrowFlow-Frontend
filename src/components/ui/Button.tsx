import { cn } from "@/lib/utils";
import { reducedMotionTransition, springs } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion, type HTMLMotionProps } from "framer-motion";
import Link from "next/link";

const MotionLink = motion.create(Link);

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-white text-ink border border-line hover:bg-surface",
  ghost: "bg-transparent text-ink hover:bg-surface",
  danger: "bg-danger text-white hover:opacity-90",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, disabled, ...props }: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      className={cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      disabled={disabled}
      whileHover={!disabled && !prefersReducedMotion ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !prefersReducedMotion ? { scale: 0.98 } : undefined}
      transition={prefersReducedMotion ? reducedMotionTransition : springs.snappy}
      {...props}
    />
  );
}

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function LinkButton({ href, variant = "primary", size = "md", className, children }: LinkButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <MotionLink
      href={href}
      className={cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={prefersReducedMotion ? reducedMotionTransition : springs.snappy}
    >
      {children}
    </MotionLink>
  );
}
