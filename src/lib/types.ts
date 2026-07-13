/** Alinhado a date-fns getDay(): 0=domingo ... 6=sábado. */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Dominio {
  id: string;
  nome: string;
  cor: string;
}

export interface Atividade {
  id: string;
  nome: string;
  dominioId: string;
  metaFrequencia: number;
  diasPermitidos: DiaSemana[];
  exclusaoSameDay: string[];
  conteudoExecucao: string;
  /** Horário do lembrete no formato "HH:MM" (24h). Vazio = sem lembrete. */
  horarioLembrete: string;
}

export interface AlocacaoSemanal {
  atividadeId: string;
  diaDaSemana: DiaSemana;
}

export interface Conclusao {
  id: string;
  atividadeId: string;
  /** Data real no formato ISO yyyy-MM-dd. */
  data: string;
}

export type TipoConflito =
  | "DIA_NAO_PERMITIDO"
  | "EXCLUSAO_SAME_DAY"
  | "FREQUENCIA_DIVERGENTE";

export interface ConflitoAtividade {
  atividadeId: string;
  tipos: TipoConflito[];
  diasNaoPermitidosAlocados: DiaSemana[];
  diasComExclusao: { dia: DiaSemana; comAtividadeId: string }[];
  diasAlocadosCount: number;
  metaFrequencia: number;
}
