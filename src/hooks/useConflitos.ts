"use client";

import { useMemo } from "react";
import { detectarConflitos } from "@/lib/conflict";
import { useAppStore } from "@/store/useAppStore";

export function useConflitos() {
  const atividades = useAppStore((s) => s.atividades);
  const encaixeSemanal = useAppStore((s) => s.encaixeSemanal);

  return useMemo(
    () => detectarConflitos(atividades, encaixeSemanal),
    [atividades, encaixeSemanal],
  );
}
