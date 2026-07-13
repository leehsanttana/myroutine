"use client";

import { useEffect } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FabNovaAtividade } from "@/components/layout/fab-nova-atividade";
import { StoreHydrationGate } from "@/components/common/store-hydration-gate";
import { ActivityFormSheet } from "@/components/activity/activity-form-sheet";
import { ActivityDetailSheet } from "@/components/activity/activity-detail-sheet";
import { Toaster } from "@/components/ui/sonner";
import { useLembretes } from "@/hooks/useLembretes";
import { usePushSync } from "@/hooks/usePushSync";
import { useAppStore } from "@/store/useAppStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const abrirCriarAtividade = useAppStore((s) => s.abrirCriarAtividade);
  useLembretes();
  usePushSync();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <StoreHydrationGate>
        <main className="flex-1 pb-24">{children}</main>
        <BottomNav />
        <FabNovaAtividade onClick={abrirCriarAtividade} />
        <ActivityFormSheet />
        <ActivityDetailSheet />
      </StoreHydrationGate>
      <Toaster />
    </div>
  );
}
