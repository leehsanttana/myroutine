"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { forwardRef } from "react";
import { ConflictSuggestionPopover } from "@/components/week/conflict-suggestion-popover";
import { DomainBadge } from "@/components/domain/domain-badge";
import { EmptyState } from "@/components/common/empty-state";
import { useConflitos } from "@/hooks/useConflitos";
import type { Atividade, DiaSemana, Dominio } from "@/lib/types";
import { cn, corPastel } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

interface WeekDayPanelProps {
  dia: DiaSemana;
}

export function WeekDayPanel({ dia }: WeekDayPanelProps) {
  const atividades = useAppStore((s) => s.atividades);
  const dominios = useAppStore((s) => s.dominios);
  const encaixeSemanal = useAppStore((s) => s.encaixeSemanal);
  const abrirDetalheAtividade = useAppStore((s) => s.abrirDetalheAtividade);
  const conflitos = useConflitos();

  const atividadesDoDia = encaixeSemanal
    .filter((a) => a.diaDaSemana === dia)
    .map((a) => atividades.find((atividade) => atividade.id === a.atividadeId))
    .filter((a): a is Atividade => Boolean(a));

  return (
    <motion.div
      key={dia}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col gap-3"
    >
      {atividadesDoDia.length === 0 ? (
        <EmptyState
          title="Nenhuma atividade neste dia"
          description="Toque no + para criar, ou aloque atividades pelos outros dias."
        />
      ) : (
        atividadesDoDia.map((atividade) => {
          const dominio = dominios.find((d) => d.id === atividade.dominioId);
          const conflito = conflitos.get(atividade.id);
          const diaInvalido = conflito?.diasNaoPermitidosAlocados.includes(dia) ?? false;
          const temExclusaoNesteDia =
            conflito?.diasComExclusao.some((e) => e.dia === dia) ?? false;
          const problematico = diaInvalido || temExclusaoNesteDia;

          if (problematico) {
            return (
              <ConflictSuggestionPopover
                key={`${atividade.id}-${dia}`}
                atividade={atividade}
                diaOrigem={dia}
              >
                <WeekActivityCard atividade={atividade} dominio={dominio} problematico />
              </ConflictSuggestionPopover>
            );
          }

          return (
            <WeekActivityCard
              key={`${atividade.id}-${dia}`}
              atividade={atividade}
              dominio={dominio}
              onClick={() => abrirDetalheAtividade(atividade.id)}
            />
          );
        })
      )}
    </motion.div>
  );
}

interface WeekActivityCardProps {
  atividade: Atividade;
  dominio: Dominio | undefined;
  problematico?: boolean;
  onClick?: () => void;
}

const WeekActivityCard = forwardRef<HTMLButtonElement, WeekActivityCardProps>(
  function WeekActivityCard({ atividade, dominio, problematico, onClick, ...props }, ref) {
    const cor = dominio?.cor ?? "#1B1F2A";

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        style={problematico ? undefined : { backgroundColor: corPastel(cor) }}
        className={cn(
          "flex w-full items-center gap-3 rounded-3xl p-4 text-left shadow-card transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
          problematico && "border-2 border-dashed border-conflict bg-conflict/5",
        )}
        {...props}
      >
        {problematico && (
          <AlertTriangle className="size-5 shrink-0 text-conflict" strokeWidth={2.5} />
        )}
        <span className="flex flex-1 flex-col gap-1">
          <span className="text-base font-medium text-ink">{atividade.nome}</span>
          {dominio && <DomainBadge nome={dominio.nome} cor={dominio.cor} />}
        </span>
        <span className="font-mono text-xs tabular-nums text-ink-muted">
          {atividade.metaFrequencia}x/sem
        </span>
      </button>
    );
  },
);
