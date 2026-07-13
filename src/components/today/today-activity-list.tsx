"use client";

import { EmptyState } from "@/components/common/empty-state";
import { TodayActivityItem } from "@/components/today/today-activity-item";
import { useAtividadesDoDiaAtual } from "@/hooks/useAtividadesDoDiaAtual";
import { useAppStore } from "@/store/useAppStore";

export function TodayActivityList() {
  const dominios = useAppStore((s) => s.dominios);
  const atividadesHoje = useAtividadesDoDiaAtual();

  if (atividadesHoje.length === 0) {
    return (
      <EmptyState
        title="Nada encaixado para hoje"
        description="Vá até a Semana para alocar atividades nos dias."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {atividadesHoje.map((atividade) => (
        <TodayActivityItem
          key={atividade.id}
          atividade={atividade}
          dominio={dominios.find((d) => d.id === atividade.dominioId)}
        />
      ))}
    </div>
  );
}
