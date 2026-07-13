"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ConflictSuggestionPopover } from "@/components/week/conflict-suggestion-popover";
import { WeekDayChips } from "@/components/week/week-day-chips";
import { WeekDayPanel } from "@/components/week/week-day-panel";
import { WeekLegend } from "@/components/week/week-legend";
import { DomainBadge } from "@/components/domain/domain-badge";
import { useConflitos } from "@/hooks/useConflitos";
import { DIA_LABELS_LONGO } from "@/lib/constants";
import { diaSemanaAtual } from "@/lib/date";
import type { DiaSemana } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

export function WeekGrid() {
  const atividades = useAppStore((s) => s.atividades);
  const dominios = useAppStore((s) => s.dominios);
  const conflitos = useConflitos();
  const diaHoje = diaSemanaAtual();
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana>(diaHoje);

  const conflitosFrequencia = [...conflitos.values()].filter((c) =>
    c.tipos.includes("FREQUENCIA_DIVERGENTE"),
  );

  return (
    <div className="flex flex-col gap-4">
      <WeekLegend />

      {conflitosFrequencia.length > 0 && (
        <div className="flex flex-col gap-2">
          {conflitosFrequencia.map((conflito) => {
            const atividade = atividades.find((a) => a.id === conflito.atividadeId);
            if (!atividade) return null;
            const dominio = dominios.find((d) => d.id === atividade.dominioId);
            return (
              <ConflictSuggestionPopover key={atividade.id} atividade={atividade}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 rounded-lg border-2 border-dashed border-conflict bg-conflict/10 px-4 py-3 text-left"
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0 text-conflict" strokeWidth={2.5} />
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-ink">{atividade.nome}</span>
                      {dominio && <DomainBadge nome={dominio.nome} cor={dominio.cor} />}
                    </span>
                  </span>
                  <span className="font-mono text-xs tabular-nums text-conflict">
                    {conflito.diasAlocadosCount}/{conflito.metaFrequencia}
                  </span>
                </button>
              </ConflictSuggestionPopover>
            );
          })}
        </div>
      )}

      <WeekDayChips
        selecionado={diaSelecionado}
        diaHoje={diaHoje}
        onSelect={setDiaSelecionado}
      />

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          {DIA_LABELS_LONGO[diaSelecionado]}
          {diaSelecionado === diaHoje && (
            <span className="ml-2 text-sm font-medium text-ink-muted">· hoje</span>
          )}
        </h2>
        <WeekDayPanel dia={diaSelecionado} />
      </div>
    </div>
  );
}
