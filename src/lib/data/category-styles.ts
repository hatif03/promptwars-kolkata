import type { CalmExercise } from "./calm-kit";

export const CATEGORY_STYLES: Record<
  CalmExercise["category"],
  {
    border: string;
    card: string;
    tag: string;
    icon: string;
    label: string;
  }
> = {
  anxiety: {
    border: "border-l-saathi-cat-anxiety",
    card: "bg-saathi-lavender/30 hover:bg-saathi-lavender/45",
    tag: "bg-saathi-lavender text-saathi-sage-dark",
    icon: "bg-saathi-cat-anxiety text-white",
    label: "Anxiety",
  },
  overwhelm: {
    border: "border-l-saathi-cat-overwhelm",
    card: "bg-saathi-cat-overwhelm/15 hover:bg-saathi-cat-overwhelm/25",
    tag: "bg-saathi-cat-overwhelm/30 text-saathi-ink",
    icon: "bg-saathi-cat-overwhelm text-white",
    label: "Overwhelm",
  },
  sleep: {
    border: "border-l-saathi-cat-sleep",
    card: "bg-saathi-cat-sleep/15 hover:bg-saathi-cat-sleep/25",
    tag: "bg-saathi-cat-sleep/25 text-saathi-ink",
    icon: "bg-saathi-cat-sleep text-white",
    label: "Sleep",
  },
  motivation: {
    border: "border-l-saathi-cat-motivation",
    card: "bg-saathi-sage-light/80 hover:bg-saathi-mint/50",
    tag: "bg-saathi-mint text-saathi-sage-dark",
    icon: "bg-saathi-cat-motivation text-white",
    label: "Motivation",
  },
  anger: {
    border: "border-l-saathi-cat-anger",
    card: "bg-saathi-cat-anger/10 hover:bg-saathi-cat-anger/20",
    tag: "bg-saathi-cat-anger/25 text-saathi-ink",
    icon: "bg-saathi-cat-anger text-white",
    label: "Anger",
  },
  focus: {
    border: "border-l-saathi-cat-focus",
    card: "bg-saathi-cat-focus/15 hover:bg-saathi-cat-focus/25",
    tag: "bg-saathi-cat-focus/25 text-saathi-ink",
    icon: "bg-saathi-cat-focus text-white",
    label: "Focus",
  },
};

export function getCategoryStyle(category: CalmExercise["category"]) {
  return CATEGORY_STYLES[category];
}
