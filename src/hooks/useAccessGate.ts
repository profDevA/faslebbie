"use client";

import { useCallback, useEffect, useState } from "react";
import { readAccessUnlocked, type AccessScope } from "@/lib/access";

/**
 * Soft access unlock for the current browser tab. After one successful
 * password entry, protected case studies + CV/Resume open without re-prompt —
 * except a study with its own password, which needs its own entry
 * (`scope.own`, Fas Nov 16 evening).
 */
export function useAccessGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [gateScope, setGateScope] = useState<AccessScope>(undefined);

  useEffect(() => {
    setUnlocked(readAccessUnlocked());
  }, []);

  const requestAccess = useCallback(
    (action: () => void, scope?: AccessScope) => {
      const open = scope?.own
        ? readAccessUnlocked(scope)
        : unlocked || readAccessUnlocked();
      if (open) {
        if (!scope?.own) setUnlocked(true);
        action();
        return;
      }
      setPending(() => action);
      setGateScope(scope);
      setGateOpen(true);
    },
    [unlocked],
  );

  const closeGate = useCallback(() => {
    setGateOpen(false);
    setPending(null);
  }, []);

  const onGateSuccess = useCallback(() => {
    if (!gateScope?.own) setUnlocked(true);
    setGateOpen(false);
    const run = pending;
    setPending(null);
    run?.();
  }, [pending, gateScope]);

  return { unlocked, gateOpen, gateScope, requestAccess, closeGate, onGateSuccess };
}
