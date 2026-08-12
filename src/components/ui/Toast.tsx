"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { reducedMotionTransition, springs } from "@/lib/animations";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  /** Milliseconds before auto-dismissing. Defaults to 3000. */
  duration?: number;
}

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TYPE_CLASSES: Record<ToastType, string> = {
  success: "bg-success text-white",
  error: "bg-danger text-white",
  warning: "bg-warning text-white",
  info: "bg-primary text-white",
};

export function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = ICONS[type];

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="status"
          className={cn(
            "fixed bottom-5 right-5 z-[1000] flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium shadow-xl",
            TYPE_CLASSES[type],
          )}
          initial={{ opacity: 0, y: -20, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: -20 }}
          transition={prefersReducedMotion ? reducedMotionTransition : springs.snappy}
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
