import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-saathi-sage/20 bg-white px-4 py-2 text-sm text-saathi-ink placeholder:text-saathi-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saathi-sage/30",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
