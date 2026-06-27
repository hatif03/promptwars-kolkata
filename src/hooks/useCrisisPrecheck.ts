"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { checkCrisisContent } from "@/lib/safety/crisis";

type UseCrisisPrecheckOptions = {
  debounceMs?: number;
  onCrisisDetected?: () => void;
};

export function useCrisisPrecheck({
  debounceMs = 400,
  onCrisisDetected,
}: UseCrisisPrecheckOptions = {}) {
  const [isCrisis, setIsCrisis] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCrisisRef = useRef(onCrisisDetected);

  useEffect(() => {
    onCrisisRef.current = onCrisisDetected;
  }, [onCrisisDetected]);

  const checkText = useCallback(
    (text: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (!text.trim()) {
        setIsCrisis(false);
        return;
      }

      timerRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/crisis/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (!res.ok) {
            const local = checkCrisisContent(text);
            setIsCrisis(local.isCrisis);
            if (local.isCrisis) onCrisisRef.current?.();
            return;
          }
          const result = await res.json();
          setIsCrisis(Boolean(result.isCrisis));
          if (result.isCrisis) onCrisisRef.current?.();
        } catch {
          const local = checkCrisisContent(text);
          setIsCrisis(local.isCrisis);
          if (local.isCrisis) onCrisisRef.current?.();
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { isCrisis, checkText };
}
