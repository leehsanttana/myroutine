"use client";

import { useMemo } from "react";
import { diaSemanaAtual } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";

export function useAtividadesDoDiaAtual() {
  const atividades = useAppStore((s) => s.atividades);
  const encaixeSemanal = useAppStore((s) => s.encaixeSemanal);
  const dia = diaSemanaAtual();

  return useMemo(() => {
    const idsHoje = new Set(
      encaixeSemanal.filter((a) => a.diaDaSemana === dia).map((a) => a.atividadeId),
    );
    return atividades.filter((a) => idsHoje.has(a.id));
  }, [atividades, encaixeSemanal, dia]);
}
