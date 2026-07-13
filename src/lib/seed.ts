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

  // Sem atividades pré-programadas — o usuário cadastra as próprias.
  const atividades: Atividade[] = [];
  const encaixeSemanal: AlocacaoSemanal[] = [];

  return {
    dominios: [dominioMovimento, dominioEstudo, dominioAlimentacao],
    atividades,
    encaixeSemanal,
    conclusoes: [],
  };
}
