"use client";

import { useAppStore } from "@/store/useAppStore";

export function WeekLegend() {
  const dominios = useAppStore((s) => s.dominios);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
      {dominios.map((d) => (
        <span key={d.id} className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: d.cor }}
            aria-hidden="true"
          />
          {d.nome}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-conflict" aria-hidden="true" />
        Conflito
      </span>
    </div>
  );
}
