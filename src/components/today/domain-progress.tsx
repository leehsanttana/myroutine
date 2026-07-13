"use client";

import { motion } from "framer-motion";
import type { ProgressoDominio } from "@/lib/progress";
import type { Dominio } from "@/lib/types";

interface DomainProgressProps {
  dominio: Dominio;
  progresso: ProgressoDominio;
}

export function DomainProgress({ dominio, progresso }: DomainProgressProps) {
  return (
    <div
      className="flex flex-col gap-2.5 rounded-xl border-2 bg-surface p-4 shadow-soft"
      style={{ borderColor: dominio.cor }}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-ink">
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: dominio.cor }}
            aria-hidden="true"
          />
          {dominio.nome}
        </span>
        <span className="font-mono text-base font-medium tabular-nums text-ink">
          {progresso.concluidas}
          <span className="text-ink-muted">/{progresso.meta}</span>
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">

        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: dominio.cor }}
          initial={{ width: 0 }}
          animate={{ width: `${progresso.percentual * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
