"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { useAppStore } from "@/store/useAppStore";

export function StoreHydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const seeded = useAppStore((s) => s.seeded);
  const semearDadosIniciais = useAppStore((s) => s.semearDadosIniciais);

  useEffect(() => {
    if (hydrated && !seeded) semearDadosIniciais();
  }, [hydrated, seeded, semearDadosIniciais]);

  if (!hydrated) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-4" aria-busy="true">
        <Skeleton className="h-8 w-40 rounded-md bg-ink/10" />
        <Skeleton className="h-24 w-full rounded-xl bg-ink/10" />
        <Skeleton className="h-24 w-full rounded-xl bg-ink/10" />
        <Skeleton className="h-24 w-full rounded-xl bg-ink/10" />
      </div>
    );
  }

  return <>{children}</>;
}
