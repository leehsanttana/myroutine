"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { calcularDiasValidosSugeridos } from "@/lib/conflict";
import { DIA_LABELS, WEEK_ORDER } from "@/lib/constants";
import type { Atividade, DiaSemana } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

interface ConflictSuggestionPopoverProps {
  atividade: Atividade;
  /** Quando informado, resolve um token específico já alocado nesse dia (mover). */
  diaOrigem?: DiaSemana;
  children: React.ReactNode;
}

export function ConflictSuggestionPopover({
  atividade,
  diaOrigem,
  children,
}: ConflictSuggestionPopoverProps) {
  const [open, setOpen] = useState(false);
  const atividades = useAppStore((s) => s.atividades);
  const encaixeSemanal = useAppStore((s) => s.encaixeSemanal);
  const moverAlocacao = useAppStore((s) => s.moverAlocacao);
  const alternarAlocacao = useAppStore((s) => s.alternarAlocacao);

  const diasAlocados = encaixeSemanal
    .filter((a) => a.atividadeId === atividade.id)
    .map((a) => a.diaDaSemana)
    .sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));

  const modo = diaOrigem !== undefined
    ? "mover"
    : diasAlocados.length < atividade.metaFrequencia
      ? "adicionar"
      : "remover";

  const diasValidos =
    modo === "remover"
      ? diasAlocados
      : calcularDiasValidosSugeridos(atividade, atividades, encaixeSemanal, diaOrigem);

  function escolherDia(dia: DiaSemana) {
    if (modo === "mover" && diaOrigem !== undefined) {
      moverAlocacao(atividade.id, diaOrigem, dia);
    } else {
      alternarAlocacao(atividade.id, dia);
    }
    setOpen(false);
  }

  const titulo =
    modo === "mover"
      ? `Mover ${atividade.nome} para`
      : modo === "adicionar"
        ? `Adicionar ${atividade.nome} em`
        : `Remover ${atividade.nome} de`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 border-2 border-conflict">
        <p className="text-xs font-medium text-ink">{titulo}</p>
        {diasValidos.length === 0 ? (
          <p className="text-xs text-ink-muted">Nenhum dia válido disponível.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {diasValidos.map((dia) => (
              <button
                key={dia}
                type="button"
                onClick={() => escolherDia(dia)}
                className={cn(
                  "rounded-full border-2 border-ink px-3 py-1 font-mono text-xs tabular-nums transition-colors",
                  "hover:bg-ink hover:text-paper",
                )}
              >
                {DIA_LABELS[dia]}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
