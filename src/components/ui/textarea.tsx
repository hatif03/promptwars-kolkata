import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-2xl border-2 border-saathi-border bg-saathi-surface px-4 py-3 text-sm text-saathi-ink placeholder:text-saathi-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saathi-ring/50 focus-visible:border-saathi-sage resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
