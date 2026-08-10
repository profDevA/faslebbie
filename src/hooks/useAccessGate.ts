"use client";

import { useCallback, useEffect, useState } from "react";
import { readAccessUnlocked } from "@/lib/access";

/**
 * Soft access unlock for the current browser tab. After one successful
 * password entry, protected case studies + CV/Resume open without re-prompt.
 */
export function useAccessGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);

  useEffect(() => {
    setUnlocked(readAccessUnlocked());
  }, []);

  const requestAccess = useCallback(
    (action: () => void) => {
      if (unlocked || readAccessUnlocked()) {
        setUnlocked(true);
        action();
        return;
      }
      setPending(() => action);
      setGateOpen(true);
    },
    [unlocked],
  );

  const closeGate = useCallback(() => {
    setGateOpen(false);
    setPending(null);
  }, []);

  const onGateSuccess = useCallback(() => {
    setUnlocked(true);
    setGateOpen(false);
    const run = pending;
    setPending(null);
    run?.();
  }, [pending]);

  return { unlocked, gateOpen, requestAccess, closeGate, onGateSuccess };
}
