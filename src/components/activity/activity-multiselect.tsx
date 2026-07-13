"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { Atividade } from "@/lib/types";

interface ActivityMultiselectProps {
  atividades: Atividade[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export function ActivityMultiselect({
  atividades,
  value,
  onChange,
}: ActivityMultiselectProps) {
  if (atividades.length === 0) {
    return <p className="text-sm text-ink-muted">Nenhuma outra atividade cadastrada ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {atividades.map((atividade) => {
        const checked = value.includes(atividade.id);
        return (
          <label
            key={atividade.id}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-3 text-sm shadow-soft"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(state) => {
                onChange(
                  state === true
                    ? [...value, atividade.id]
                    : value.filter((id) => id !== atividade.id),
                );
              }}
            />
            {atividade.nome}
          </label>
        );
      })}
    </div>
  );
}
