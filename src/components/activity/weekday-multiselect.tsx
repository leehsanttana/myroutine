"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DIA_LABELS, WEEK_ORDER } from "@/lib/constants";
import type { DiaSemana } from "@/lib/types";

interface WeekdayMultiselectProps {
  value: DiaSemana[];
  onChange: (dias: DiaSemana[]) => void;
}

export function WeekdayMultiselect({ value, onChange }: WeekdayMultiselectProps) {
  return (
    <ToggleGroup
      type="multiple"
      variant="outline"
      value={value.map(String)}
      onValueChange={(vals: string[]) => onChange(vals.map(Number) as DiaSemana[])}
      className="flex-wrap gap-1.5"
    >
      {WEEK_ORDER.map((dia) => (
        <ToggleGroupItem
          key={dia}
          value={String(dia)}
          className="h-10 min-w-10 rounded-full border border-border bg-surface font-mono text-xs shadow-soft data-[state=on]:border-ink data-[state=on]:bg-ink data-[state=on]:text-paper"
        >
          {DIA_LABELS[dia]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
