import type {
  AlocacaoSemanal,
  Atividade,
  ConflitoAtividade,
  DiaSemana,
  TipoConflito,
} from "./types";
import { WEEK_ORDER } from "./constants";

export function agruparAlocacoesPorAtividade(
  encaixe: AlocacaoSemanal[],
): Map<string, Set<DiaSemana>> {
  const mapa = new Map<string, Set<DiaSemana>>();
  for (const { atividadeId, diaDaSemana } of encaixe) {
    const dias = mapa.get(atividadeId) ?? new Set<DiaSemana>();
    dias.add(diaDaSemana);
    mapa.set(atividadeId, dias);
  }
  return mapa;
}

export function agruparAlocacoesPorDia(
  encaixe: AlocacaoSemanal[],
): Map<DiaSemana, string[]> {
  const mapa = new Map<DiaSemana, string[]>();
  for (const { atividadeId, diaDaSemana } of encaixe) {
    const atividades = mapa.get(diaDaSemana) ?? [];
    atividades.push(atividadeId);
    mapa.set(diaDaSemana, atividades);
  }
  return mapa;
}

/** Exclusão same-day é lida como bidirecional mesmo armazenada só do lado editado. */
export function obterExclusoesSimetricas(
  atividadeId: string,
  atividades: Atividade[],
): Set<string> {
  const exclusoes = new Set<string>();
  for (const atividade of atividades) {
    if (atividade.id === atividadeId) {
      for (const id of atividade.exclusaoSameDay) exclusoes.add(id);
    } else if (atividade.exclusaoSameDay.includes(atividadeId)) {
      exclusoes.add(atividade.id);
    }
  }
  return exclusoes;
}

export function detectarConflitos(
  atividades: Atividade[],
  encaixeSemanal: AlocacaoSemanal[],
): Map<string, ConflitoAtividade> {
  const porAtividade = agruparAlocacoesPorAtividade(encaixeSemanal);
  const porDia = agruparAlocacoesPorDia(encaixeSemanal);
  const conflitos = new Map<string, ConflitoAtividade>();

  for (const atividade of atividades) {
    const diasAlocados = porAtividade.get(atividade.id) ?? new Set<DiaSemana>();
    const tipos: TipoConflito[] = [];

    const diasNaoPermitidosAlocados = [...diasAlocados].filter(
      (dia) => !atividade.diasPermitidos.includes(dia),
    );
    if (diasNaoPermitidosAlocados.length > 0) tipos.push("DIA_NAO_PERMITIDO");

    const exclusoes = obterExclusoesSimetricas(atividade.id, atividades);
    const diasComExclusao: { dia: DiaSemana; comAtividadeId: string }[] = [];
    if (exclusoes.size > 0) {
      for (const dia of diasAlocados) {
        const ocupantes = porDia.get(dia) ?? [];
        for (const ocupanteId of ocupantes) {
          if (ocupanteId !== atividade.id && exclusoes.has(ocupanteId)) {
            diasComExclusao.push({ dia, comAtividadeId: ocupanteId });
          }
        }
      }
    }
    if (diasComExclusao.length > 0) tipos.push("EXCLUSAO_SAME_DAY");

    const frequenciaDivergente = diasAlocados.size !== atividade.metaFrequencia;
    if (frequenciaDivergente) tipos.push("FREQUENCIA_DIVERGENTE");

    if (tipos.length > 0) {
      conflitos.set(atividade.id, {
        atividadeId: atividade.id,
        tipos,
        diasNaoPermitidosAlocados,
        diasComExclusao,
        diasAlocadosCount: diasAlocados.size,
        metaFrequencia: atividade.metaFrequencia,
      });
    }
  }

  return conflitos;
}

/**
 * Lista os dias válidos (respeitam diasPermitidos e não colidem com exclusões
 * same-day) para mover uma alocação existente ou adicionar uma nova.
 * Apenas listagem de candidatos — a escolha final é sempre do usuário.
 */
export function calcularDiasValidosSugeridos(
  atividade: Atividade,
  atividades: Atividade[],
  encaixeSemanal: AlocacaoSemanal[],
  diaParaIgnorar?: DiaSemana,
): DiaSemana[] {
  const porDia = agruparAlocacoesPorDia(encaixeSemanal);
  const porAtividade = agruparAlocacoesPorAtividade(encaixeSemanal);
  const exclusoes = obterExclusoesSimetricas(atividade.id, atividades);
  const diasAtuais = porAtividade.get(atividade.id) ?? new Set<DiaSemana>();

  const candidatos = atividade.diasPermitidos.filter((dia) => {
    const jaAlocadaAqui = diasAtuais.has(dia) && dia !== diaParaIgnorar;
    if (jaAlocadaAqui) return false;

    const ocupantes = (porDia.get(dia) ?? []).filter(
      (id) => !(id === atividade.id && dia === diaParaIgnorar),
    );
    return !ocupantes.some((id) => exclusoes.has(id));
  });

  return candidatos.sort(
    (a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b),
  );
}
