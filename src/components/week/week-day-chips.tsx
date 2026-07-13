"use client";

import { DIA_LABELS, WEEK_ORDER } from "@/lib/constants";
import type { DiaSemana } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

interface WeekDayChipsProps {
  selecionado: DiaSemana;
  diaHoje: DiaSemana;
  onSelect: (dia: DiaSemana) => void;
}

export function WeekDayChips({ selecionado, diaHoje, onSelect }: WeekDayChipsProps) {
  const encaixeSemanal = useAppStore((s) => s.encaixeSemanal);

  return (
    <div className="-mx-4 overflow-x-auto px-4 py-3">
      <div className="flex min-w-full gap-1.5">
        {WEEK_ORDER.map((dia) => {
          const count = encaixeSemanal.filter((a) => a.diaDaSemana === dia).length;
          const ativo = dia === selecionado;
          const ehHoje = dia === diaHoje;

          return (
            <button
              key={dia}
              type="button"
              onClick={() => onSelect(dia)}
              aria-pressed={ativo}
              aria-label={`${DIA_LABELS[dia]}, ${count} atividade(s)`}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2.5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink",
                ativo
                  ? "bg-ink text-paper"
                  : "bg-surface text-ink shadow-soft hover:bg-muted",
              )}
            >
              <span className="flex items-center gap-1 text-xs font-semibold">
                {DIA_LABELS[dia]}
                {ehHoje && (
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      ativo ? "bg-paper" : "bg-movimento",
                    )}
                    aria-hidden="true"
                  />
                )}
              </span>
              <span
                className={cn(
                  "font-mono text-[11px] tabular-nums",
                  ativo ? "text-paper/70" : "text-ink-muted",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
