"use client";

import { useState, type ComponentProps } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeedbackButtonProps extends ComponentProps<typeof Button> {
  successText?: string;
  successDuration?: number;
  onSuccessClick?: () => void | Promise<void>;
}

export function FeedbackButton({
  children,
  successText = "Dodano!",
  successDuration = 800,
  onSuccessClick,
  className,
  disabled,
  ...props
}: FeedbackButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = async () => {
    if (isSuccess || disabled) return;

    if (onSuccessClick) {
      await onSuccessClick();
    }

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), successDuration);
  };

  return (
    <Button
      {...props}
      disabled={disabled || isSuccess}
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
    >
      {/* Invisible content to maintain width */}
      <span className="invisible flex items-center gap-1.5">{children}</span>

      <AnimatePresence mode="popLayout" initial={false}>
        {isSuccess ? (
          <motion.span
            key="success"
            initial={{ y: 24, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ y: -24, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center gap-1.5"
          >
            <Check className="size-4" />
            {successText}
          </motion.span>
        ) : (
          <motion.span
            key="default"
            initial={{ y: 24, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ y: -24, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center gap-1.5"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
