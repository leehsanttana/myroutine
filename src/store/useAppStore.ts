import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { gerarId } from "@/lib/id";
import { buildSeedData } from "@/lib/seed";
import { hojeISO } from "@/lib/date";
import type {
  AlocacaoSemanal,
  Atividade,
  Conclusao,
  DiaSemana,
  Dominio,
} from "@/lib/types";

type SheetAberta = "criar" | "editar" | "detalhe" | null;

interface UiState {
  sheetAberta: SheetAberta;
  atividadeSelecionadaId: string | null;
}

interface AppState {
  dominios: Dominio[];
  atividades: Atividade[];
  encaixeSemanal: AlocacaoSemanal[];
  conclusoes: Conclusao[];
  seeded: boolean;

  criarDominio: (input: Omit<Dominio, "id">) => string;
  atualizarDominio: (id: string, patch: Partial<Omit<Dominio, "id">>) => void;
  removerDominio: (id: string) => { ok: boolean; motivo?: string };

  criarAtividade: (input: Omit<Atividade, "id">) => string;
  atualizarAtividade: (id: string, patch: Partial<Omit<Atividade, "id">>) => void;
  removerAtividade: (id: string) => void;

  alternarAlocacao: (atividadeId: string, dia: DiaSemana) => void;
  moverAlocacao: (
    atividadeId: string,
    diaOrigem: DiaSemana,
    diaDestino: DiaSemana,
  ) => void;

  alternarConclusaoHoje: (atividadeId: string) => void;
  alternarConclusao: (atividadeId: string, dataISO: string) => void;

  semearDadosIniciais: () => void;

  ui: UiState;
  abrirCriarAtividade: () => void;
  abrirEditarAtividade: (id: string) => void;
  abrirDetalheAtividade: (id: string) => void;
  fecharSheet: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      dominios: [],
      atividades: [],
      encaixeSemanal: [],
      conclusoes: [],
      seeded: false,

      criarDominio: (input) => {
        const id = gerarId();
        set((state) => ({ dominios: [...state.dominios, { id, ...input }] }));
        return id;
      },

      atualizarDominio: (id, patch) => {
        set((state) => ({
          dominios: state.dominios.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        }));
      },

      removerDominio: (id) => {
        const temAtividade = get().atividades.some((a) => a.dominioId === id);
        if (temAtividade) {
          return { ok: false, motivo: "Existem atividades vinculadas a este domínio." };
        }
        set((state) => ({ dominios: state.dominios.filter((d) => d.id !== id) }));
        return { ok: true };
      },

      criarAtividade: (input) => {
        const id = gerarId();
        set((state) => ({ atividades: [...state.atividades, { id, ...input }] }));
        return id;
      },

      atualizarAtividade: (id, patch) => {
        set((state) => ({
          atividades: state.atividades.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }));
      },

      removerAtividade: (id) => {
        set((state) => ({
          atividades: state.atividades
            .filter((a) => a.id !== id)
            .map((a) => ({
              ...a,
              exclusaoSameDay: a.exclusaoSameDay.filter((excId) => excId !== id),
            })),
          encaixeSemanal: state.encaixeSemanal.filter((a) => a.atividadeId !== id),
          conclusoes: state.conclusoes.filter((c) => c.atividadeId !== id),
        }));
      },

      alternarAlocacao: (atividadeId, dia) => {
        set((state) => {
          const existe = state.encaixeSemanal.some(
            (a) => a.atividadeId === atividadeId && a.diaDaSemana === dia,
          );
          return {
            encaixeSemanal: existe
              ? state.encaixeSemanal.filter(
                  (a) => !(a.atividadeId === atividadeId && a.diaDaSemana === dia),
                )
              : [...state.encaixeSemanal, { atividadeId, diaDaSemana: dia }],
          };
        });
      },

      moverAlocacao: (atividadeId, diaOrigem, diaDestino) => {
        set((state) => ({
          encaixeSemanal: state.encaixeSemanal.map((a) =>
            a.atividadeId === atividadeId && a.diaDaSemana === diaOrigem
              ? { ...a, diaDaSemana: diaDestino }
              : a,
          ),
        }));
      },

      alternarConclusaoHoje: (atividadeId) => {
        get().alternarConclusao(atividadeId, hojeISO());
      },

      alternarConclusao: (atividadeId, dataISO) => {
        set((state) => {
          const existente = state.conclusoes.find(
            (c) => c.atividadeId === atividadeId && c.data === dataISO,
          );
          return {
            conclusoes: existente
              ? state.conclusoes.filter((c) => c.id !== existente.id)
              : [...state.conclusoes, { id: gerarId(), atividadeId, data: dataISO }],
          };
        });
      },

      semearDadosIniciais: () => {
        if (get().seeded) return;
        const seed = buildSeedData();
        set({ ...seed, seeded: true });
      },

      ui: {
        sheetAberta: null,
        atividadeSelecionadaId: null,
      },

      abrirCriarAtividade: () => {
        set((state) => ({
          ui: { ...state.ui, sheetAberta: "criar", atividadeSelecionadaId: null },
        }));
      },

      abrirEditarAtividade: (id) => {
        set((state) => ({
          ui: { ...state.ui, sheetAberta: "editar", atividadeSelecionadaId: id },
        }));
      },

      abrirDetalheAtividade: (id) => {
        set((state) => ({
          ui: { ...state.ui, sheetAberta: "detalhe", atividadeSelecionadaId: id },
        }));
      },

      fecharSheet: () => {
        set((state) => ({
          ui: { ...state.ui, sheetAberta: null, atividadeSelecionadaId: null },
        }));
      },
    }),
    {
      name: "myroutine-storage",
      version: 2,
      skipHydration: true,
      // v2: remove as atividades pré-programadas antigas, mantendo os domínios.
      migrate: (persisted, version) => {
        const state = persisted as AppState;
        if (version < 2) {
          return { ...state, atividades: [], encaixeSemanal: [], conclusoes: [] };
        }
        return state;
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dominios: state.dominios,
        atividades: state.atividades,
        encaixeSemanal: state.encaixeSemanal,
        conclusoes: state.conclusoes,
        seeded: state.seeded,
      }),
    },
  ),
);
