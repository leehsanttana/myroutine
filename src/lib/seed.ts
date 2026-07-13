import { gerarId } from "./id";
import type { AlocacaoSemanal, Atividade, Conclusao, Dominio } from "./types";

export interface SeedData {
  dominios: Dominio[];
  atividades: Atividade[];
  encaixeSemanal: AlocacaoSemanal[];
  conclusoes: Conclusao[];
}

export function buildSeedData(): SeedData {
  const dominioMovimento: Dominio = { id: gerarId(), nome: "Movimento", cor: "#E24E6B" };
  const dominioEstudo: Dominio = { id: gerarId(), nome: "Estudo", cor: "#2E5AA8" };
  const dominioAlimentacao: Dominio = { id: gerarId(), nome: "Alimentação", cor: "#3E9E6E" };

  const fisioterapiaId = gerarId();
  const treinoId = gerarId();
  const estudoId = gerarId();
  const refeicoesId = gerarId();

  const atividades: Atividade[] = [
    {
      id: fisioterapiaId,
      nome: "Fisioterapia",
      dominioId: dominioMovimento.id,
      metaFrequencia: 3,
      diasPermitidos: [1, 3, 5],
      exclusaoSameDay: [],
      conteudoExecucao:
        "Alongamento cervical — 3x15s\nMobilidade de ombro com bastão — 2x10\nFortalecimento de lombar — 3 séries de 12",
      horarioLembrete: "",
    },
    {
      id: treinoId,
      nome: "Treino",
      dominioId: dominioMovimento.id,
      metaFrequencia: 3,
      diasPermitidos: [1, 2, 3, 4, 5, 6],
      exclusaoSameDay: [fisioterapiaId],
      conteudoExecucao:
        "Aquecimento — 5 min\nTreino de força — 4 exercícios, 3 séries\nAlongamento final — 5 min",
      horarioLembrete: "",
    },
    {
      id: estudoId,
      nome: "Estudo",
      dominioId: dominioEstudo.id,
      metaFrequencia: 5,
      diasPermitidos: [1, 2, 3, 4, 5],
      exclusaoSameDay: [],
      conteudoExecucao:
        "Revisar anotações da aula anterior\n25 min de leitura focada + 5 min de resumo\nFlashcards de vocabulário",
      horarioLembrete: "",
    },
    {
      id: refeicoesId,
      nome: "Refeições",
      dominioId: dominioAlimentacao.id,
      metaFrequencia: 7,
      diasPermitidos: [0, 1, 2, 3, 4, 5, 6],
      exclusaoSameDay: [],
      conteudoExecucao:
        "Café da manhã: ovos + fruta\nAlmoço: proteína + salada + carboidrato\nJantar: leve, evitar depois das 21h\nÁgua: garrafa de 1L por período",
      horarioLembrete: "",
    },
  ];

  const encaixeSemanal: AlocacaoSemanal[] = [
    ...[1, 3, 5].map((dia) => ({ atividadeId: fisioterapiaId, diaDaSemana: dia }) as AlocacaoSemanal),
    ...[2, 4, 6].map((dia) => ({ atividadeId: treinoId, diaDaSemana: dia }) as AlocacaoSemanal),
    ...[1, 2, 3, 4, 5].map((dia) => ({ atividadeId: estudoId, diaDaSemana: dia }) as AlocacaoSemanal),
    ...[0, 1, 2, 3, 4, 5, 6].map((dia) => ({ atividadeId: refeicoesId, diaDaSemana: dia }) as AlocacaoSemanal),
  ];

  return {
    dominios: [dominioMovimento, dominioEstudo, dominioAlimentacao],
    atividades,
    encaixeSemanal,
    conclusoes: [],
  };
}
