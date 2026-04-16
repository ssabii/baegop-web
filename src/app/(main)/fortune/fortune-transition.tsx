"use client";

import { motion } from "framer-motion";

interface FortuneTransitionProps {
  capsuleColor: string;
  onComplete: () => void;
}

export function FortuneTransition({
  capsuleColor,
  onComplete,
}: FortuneTransitionProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Solid colored circle that expands to fill the screen */}
      <motion.div
        className="rounded-full"
        style={{ backgroundColor: capsuleColor }}
        initial={{ width: 40, height: 40 }}
        animate={{ width: "220vmax", height: "220vmax" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* White fade overlay */}
      <motion.div
        className="fixed inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
        onAnimationComplete={onComplete}
      />
    </div>
  );
}
