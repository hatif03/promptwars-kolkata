import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-2xl border border-saathi-sage/20 bg-white px-4 py-3 text-sm text-saathi-ink placeholder:text-saathi-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saathi-sage/30 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
