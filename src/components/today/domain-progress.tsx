"use client";

import { motion } from "framer-motion";
import type { ProgressoDominio } from "@/lib/progress";
import type { Dominio } from "@/lib/types";
import { corPastel } from "@/lib/utils";

interface DomainProgressProps {
  dominio: Dominio;
  progresso: ProgressoDominio;
}

export function DomainProgress({ dominio, progresso }: DomainProgressProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-3xl bg-surface p-4 shadow-soft">
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
      <div
        className="h-3 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: corPastel(dominio.cor, 22) }}
      >
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
