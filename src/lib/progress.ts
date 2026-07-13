import type { Atividade, Conclusao, Dominio } from "./types";
import { dataDentroDaSemanaAtual } from "./date";

export interface ProgressoDominio {
  dominioId: string;
  concluidas: number;
  meta: number;
  percentual: number;
}

/**
 * Progressão derivada por domínio: conclusões da semana corrente sobre a
 * soma das metas de frequência das atividades do domínio. Nunca persistida.
 */
export function calcularProgressoPorDominio(
  dominios: Dominio[],
  atividades: Atividade[],
  conclusoes: Conclusao[],
): Map<string, ProgressoDominio> {
  const conclusoesDaSemana = conclusoes.filter((c) =>
    dataDentroDaSemanaAtual(c.data),
  );

  const resultado = new Map<string, ProgressoDominio>();

  for (const dominio of dominios) {
    const atividadesDoDominio = atividades.filter(
      (a) => a.dominioId === dominio.id,
    );
    const atividadeIds = new Set(atividadesDoDominio.map((a) => a.id));

    const meta = atividadesDoDominio.reduce(
      (soma, a) => soma + a.metaFrequencia,
      0,
    );
    const concluidas = conclusoesDaSemana.filter((c) =>
      atividadeIds.has(c.atividadeId),
    ).length;

    resultado.set(dominio.id, {
      dominioId: dominio.id,
      concluidas,
      meta,
      percentual: meta > 0 ? Math.min(1, concluidas / meta) : 0,
    });
  }

  return resultado;
}
