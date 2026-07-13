"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function TodayHeader() {
  const hoje = new Date();
  return (
    <header className="flex flex-col gap-1.5">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">
        {format(hoje, "EEEE, d 'de' MMMM", { locale: ptBR })}
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
        Hoje
      </h1>
    </header>
  );
}
