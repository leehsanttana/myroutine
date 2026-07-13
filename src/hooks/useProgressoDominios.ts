"use client";

import { useMemo } from "react";
import { calcularProgressoPorDominio } from "@/lib/progress";
import { useAppStore } from "@/store/useAppStore";

export function useProgressoDominios() {
  const dominios = useAppStore((s) => s.dominios);
  const atividades = useAppStore((s) => s.atividades);
  const conclusoes = useAppStore((s) => s.conclusoes);

  return useMemo(
    () => calcularProgressoPorDominio(dominios, atividades, conclusoes),
    [dominios, atividades, conclusoes],
  );
}
