"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useHydrated(): boolean {
  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);

  return useSyncExternalStore(
    (callback) => useAppStore.persist.onFinishHydration(callback),
    () => useAppStore.persist.hasHydrated(),
    () => false,
  );
}
