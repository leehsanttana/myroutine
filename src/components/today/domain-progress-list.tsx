"use client";

import { DomainProgress } from "@/components/today/domain-progress";
import { useProgressoDominios } from "@/hooks/useProgressoDominios";
import { useAppStore } from "@/store/useAppStore";

export function DomainProgressList() {
  const dominios = useAppStore((s) => s.dominios);
  const progresso = useProgressoDominios();

  if (dominios.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {dominios.map((dominio) => {
        const p = progresso.get(dominio.id);
        if (!p) return null;
        return <DomainProgress key={dominio.id} dominio={dominio} progresso={p} />;
      })}
    </div>
  );
}
