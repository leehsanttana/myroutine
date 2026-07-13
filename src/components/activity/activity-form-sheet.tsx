"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DomainSelect } from "@/components/domain/domain-select";
import { WeekdayMultiselect } from "@/components/activity/weekday-multiselect";
import { ActivityMultiselect } from "@/components/activity/activity-multiselect";
import { useAppStore } from "@/store/useAppStore";
import {
  LEMBRETE_ANTECEDENCIA_MIN,
  horarioValido,
  solicitarPermissaoNotificacao,
  suportaNotificacoes,
} from "@/lib/lembretes";
import { assinarPush, montarReminders, pushConfigurado } from "@/lib/push";
import type { Atividade, Dominio, DiaSemana } from "@/lib/types";

interface FormState {
  nome: string;
  dominioId: string;
  metaFrequencia: number;
  diasPermitidos: DiaSemana[];
  exclusaoSameDay: string[];
  conteudoExecucao: string;
  horarioLembrete: string;
}

function estadoInicial(
  modoEdicao: boolean,
  atividadeEmEdicao: Atividade | undefined,
  dominios: Dominio[],
): FormState {
  if (modoEdicao && atividadeEmEdicao) {
    return {
      nome: atividadeEmEdicao.nome,
      dominioId: atividadeEmEdicao.dominioId,
      metaFrequencia: atividadeEmEdicao.metaFrequencia,
      diasPermitidos: atividadeEmEdicao.diasPermitidos,
      exclusaoSameDay: atividadeEmEdicao.exclusaoSameDay,
      conteudoExecucao: atividadeEmEdicao.conteudoExecucao,
      horarioLembrete: atividadeEmEdicao.horarioLembrete ?? "",
    };
  }
  return {
    nome: "",
    dominioId: dominios[0]?.id ?? "",
    metaFrequencia: 1,
    diasPermitidos: [],
    exclusaoSameDay: [],
    conteudoExecucao: "",
    horarioLembrete: "",
  };
}

export function ActivityFormSheet() {
  const sheetAberta = useAppStore((s) => s.ui.sheetAberta);
  const atividadeSelecionadaId = useAppStore((s) => s.ui.atividadeSelecionadaId);
  const fecharSheet = useAppStore((s) => s.fecharSheet);

  const modoEdicao = sheetAberta === "editar";
  const open = sheetAberta === "criar" || sheetAberta === "editar";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && fecharSheet()}>
      <SheetContent side="bottom" className="max-h-[90vh] rounded-t-xl">
        {open && (
          <ActivityFormBody
            key={modoEdicao ? `editar-${atividadeSelecionadaId}` : "criar"}
            modoEdicao={modoEdicao}
            atividadeId={atividadeSelecionadaId}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

interface ActivityFormBodyProps {
  modoEdicao: boolean;
  atividadeId: string | null;
}

function ActivityFormBody({ modoEdicao, atividadeId }: ActivityFormBodyProps) {
  const dominios = useAppStore((s) => s.dominios);
  const atividades = useAppStore((s) => s.atividades);
  const criarAtividade = useAppStore((s) => s.criarAtividade);
  const atualizarAtividade = useAppStore((s) => s.atualizarAtividade);
  const fecharSheet = useAppStore((s) => s.fecharSheet);

  const atividadeEmEdicao = atividades.find((a) => a.id === atividadeId);
  const [form, setForm] = useState<FormState>(() =>
    estadoInicial(modoEdicao, atividadeEmEdicao, dominios),
  );

  const podeSalvar = form.nome.trim().length > 0 && form.dominioId !== "" && form.metaFrequencia > 0;

  async function handleSalvar() {
    if (!podeSalvar) return;

    if (horarioValido(form.horarioLembrete)) {
      if (!suportaNotificacoes()) {
        toast.warning("Seu navegador não suporta notificações; o lembrete não será enviado.");
      } else if (Notification.permission === "default") {
        const resultado = await solicitarPermissaoNotificacao();
        if (resultado !== "granted") {
          toast.warning("Sem permissão de notificação — o lembrete ficará salvo, mas não avisará.");
        }
      } else if (Notification.permission === "denied") {
        toast.warning("Notificações bloqueadas nas configurações do navegador.");
      }
    }

    if (modoEdicao && atividadeId) {
      atualizarAtividade(atividadeId, form);
    } else {
      criarAtividade(form);
    }

    // Com backend de push, cria/atualiza a inscrição para avisar mesmo fechado.
    if (
      horarioValido(form.horarioLembrete) &&
      pushConfigurado() &&
      suportaNotificacoes() &&
      Notification.permission === "granted"
    ) {
      const st = useAppStore.getState();
      void assinarPush(montarReminders(st.atividades, st.dominios, st.encaixeSemanal));
    }

    fecharSheet();
  }

  const outrasAtividades = atividades.filter((a) => a.id !== atividadeId);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-display text-2xl font-semibold">
          {modoEdicao ? "Editar atividade" : "Nova atividade"}
        </SheetTitle>
      </SheetHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        <div className="flex flex-col gap-5 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex.: Fisioterapia"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Domínio</Label>
            <DomainSelect
              dominios={dominios}
              value={form.dominioId}
              onChange={(dominioId) => setForm((f) => ({ ...f, dominioId }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meta">Meta de frequência (dias/semana)</Label>
            <Input
              id="meta"
              type="number"
              min={1}
              max={7}
              value={form.metaFrequencia}
              onChange={(e) =>
                setForm((f) => ({ ...f, metaFrequencia: Number(e.target.value) || 0 }))
              }
              className="font-mono tabular-nums"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lembrete">Lembrete (opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="lembrete"
                type="time"
                value={form.horarioLembrete}
                onChange={(e) =>
                  setForm((f) => ({ ...f, horarioLembrete: e.target.value }))
                }
                className="font-mono tabular-nums"
              />
              {form.horarioLembrete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setForm((f) => ({ ...f, horarioLembrete: "" }))}
                >
                  Limpar
                </Button>
              )}
            </div>
            <p className="text-xs text-ink-muted">
              Avisamos {LEMBRETE_ANTECEDENCIA_MIN} min antes
              {pushConfigurado() ? "." : ", com o app aberto."}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Dias permitidos</Label>
            <WeekdayMultiselect
              value={form.diasPermitidos}
              onChange={(diasPermitidos) => setForm((f) => ({ ...f, diasPermitidos }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Exclusão same-day</Label>
            <p className="text-xs text-ink-muted">
              Atividades que não podem cair no mesmo dia desta.
            </p>
            <ActivityMultiselect
              atividades={outrasAtividades}
              value={form.exclusaoSameDay}
              onChange={(exclusaoSameDay) => setForm((f) => ({ ...f, exclusaoSameDay }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="conteudo">Conteúdo de execução</Label>
            <Textarea
              id="conteudo"
              rows={5}
              value={form.conteudoExecucao}
              onChange={(e) => setForm((f) => ({ ...f, conteudoExecucao: e.target.value }))}
              placeholder="Texto livre — o que fazer ao executar esta atividade"
            />
          </div>
        </div>
      </div>

      <SheetFooter className="flex-row gap-2 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={fecharSheet}>
          Cancelar
        </Button>
        <Button
          className="flex-1"
          disabled={!podeSalvar}
          onClick={handleSalvar}
        >
          Salvar
        </Button>
      </SheetFooter>
    </>
  );
}
