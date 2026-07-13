import type { DiaSemana } from "./types";

/** Ordem de exibição segunda→domingo (diferente da ordem numérica de getDay()). */
export const WEEK_ORDER: DiaSemana[] = [1, 2, 3, 4, 5, 6, 0];

export const DIA_LABELS: Record<DiaSemana, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

export const DIA_LABELS_LONGO: Record<DiaSemana, string> = {
  0: "Domingo",
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
};

export const CONFLICT_COLOR = "#7A3B63";
