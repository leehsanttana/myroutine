"use client";

import { Bell, Check } from "lucide-react";
import { DomainBadge } from "@/components/domain/domain-badge";
import { hojeISO } from "@/lib/date";
import type { Atividade, Dominio } from "@/lib/types";
import { cn, corPastel } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

interface TodayActivityItemProps {
  atividade: Atividade;
  dominio: Dominio | undefined;
}

export function TodayActivityItem({ atividade, dominio }: TodayActivityItemProps) {
  const conclusoes = useAppStore((s) => s.conclusoes);
  const alternarConclusaoHoje = useAppStore((s) => s.alternarConclusaoHoje);
  const abrirDetalheAtividade = useAppStore((s) => s.abrirDetalheAtividade);

  const feita = conclusoes.some(
    (c) => c.atividadeId === atividade.id && c.data === hojeISO(),
  );
  const cor = dominio?.cor ?? "#1B1F2A";

  return (
    <div
      className="flex items-center gap-4 rounded-3xl p-4 shadow-card transition-shadow"
      style={{ backgroundColor: corPastel(cor) }}
    >
      <button
        type="button"
        onClick={() => alternarConclusaoHoje(atividade.id)}
        aria-pressed={feita}
        aria-label={
          feita ? `Desmarcar ${atividade.nome}` : `Marcar ${atividade.nome} como feita`
        }
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full border-2 bg-surface text-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
          !feita && "text-transparent",
        )}
        style={{ backgroundColor: feita ? cor : "#fff", borderColor: cor }}
      >
        <Check className="size-6" strokeWidth={3} />
      </button>

      <button
        type="button"
        onClick={() => abrirDetalheAtividade(atividade.id)}
        className="flex flex-1 flex-col items-start gap-1 text-left"
      >
        <span
          className={cn(
            "flex items-center gap-1.5 text-base font-medium",
            feita && "text-ink-muted line-through",
          )}
        >
          {atividade.nome}
          {atividade.horarioLembrete && (
            <span className="inline-flex items-center gap-1 font-mono text-xs font-normal text-ink-muted no-underline">
              <Bell className="size-3" strokeWidth={2.5} />
              {atividade.horarioLembrete}
            </span>
          )}
        </span>
        {dominio && <DomainBadge nome={dominio.nome} cor={dominio.cor} />}
      </button>
    </div>
  );
}
