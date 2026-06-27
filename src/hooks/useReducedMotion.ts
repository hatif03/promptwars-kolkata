"use client";

import { useEffect, useState } from "react";

function getInitialReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(getInitialReducedMotion);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    function onChange(event: MediaQueryListEvent) {
      setReducedMotion(event.matches);
    }

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reducedMotion;
}
