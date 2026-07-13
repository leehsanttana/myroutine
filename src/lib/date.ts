import {
  endOfWeek,
  formatISO,
  getDay,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from "date-fns";
import type { DiaSemana } from "./types";

export function hojeISO(): string {
  return formatISO(new Date(), { representation: "date" });
}

export function diaSemanaDe(dataISO: string): DiaSemana {
  return getDay(parseISO(dataISO)) as DiaSemana;
}

export function diaSemanaAtual(): DiaSemana {
  return getDay(new Date()) as DiaSemana;
}

/** Intervalo [segunda, domingo] da semana corrente. */
export function intervaloSemanaAtual(): { start: Date; end: Date } {
  const hoje = new Date();
  return {
    start: startOfWeek(hoje, { weekStartsOn: 1 }),
    end: endOfWeek(hoje, { weekStartsOn: 1 }),
  };
}

export function dataDentroDaSemanaAtual(dataISO: string): boolean {
  const { start, end } = intervaloSemanaAtual();
  return isWithinInterval(parseISO(dataISO), { start, end });
}
