import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-saathi-lavender/30 px-3 py-1 text-xs font-medium text-saathi-ink",
        className
      )}
      {...props}
    />
  );
}
