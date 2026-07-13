"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DomainBadge } from "@/components/domain/domain-badge";
import { DIA_LABELS, WEEK_ORDER } from "@/lib/constants";
import { hojeISO } from "@/lib/date";
import { useAppStore } from "@/store/useAppStore";

export function ActivityDetailSheet() {
  const sheetAberta = useAppStore((s) => s.ui.sheetAberta);
  const atividadeSelecionadaId = useAppStore((s) => s.ui.atividadeSelecionadaId);
  const atividades = useAppStore((s) => s.atividades);
  const dominios = useAppStore((s) => s.dominios);
  const conclusoes = useAppStore((s) => s.conclusoes);
  const alternarConclusaoHoje = useAppStore((s) => s.alternarConclusaoHoje);
  const removerAtividade = useAppStore((s) => s.removerAtividade);
  const fecharSheet = useAppStore((s) => s.fecharSheet);
  const abrirEditarAtividade = useAppStore((s) => s.abrirEditarAtividade);

  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const open = sheetAberta === "detalhe";
  const atividade = atividades.find((a) => a.id === atividadeSelecionadaId);
  const dominio = dominios.find((d) => d.id === atividade?.dominioId);

  const concluidaHoje = atividade
    ? conclusoes.some((c) => c.atividadeId === atividade.id && c.data === hojeISO())
    : false;

  function handleExcluir() {
    if (!atividade) return;
    const nome = atividade.nome;
    removerAtividade(atividade.id);
    setConfirmarExclusao(false);
    fecharSheet();
    toast.success(`"${nome}" foi excluída.`);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && fecharSheet()}>
        <SheetContent side="bottom" className="flex max-h-[85vh] flex-col rounded-t-xl">
          {atividade && dominio ? (
            <>
              <SheetHeader className="gap-1 pr-12">
                <DomainBadge nome={dominio.nome} cor={dominio.cor} />
                <SheetTitle className="font-display text-2xl font-semibold">
                  {atividade.nome}
                </SheetTitle>
                <p className="font-mono text-xs tabular-nums text-ink-muted">
                  {atividade.metaFrequencia}x/semana ·{" "}
                  {atividade.diasPermitidos
                    .slice()
                    .sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b))
                    .map((d) => DIA_LABELS[d])
                    .join(" ")}
                </p>
                {atividade.horarioLembrete && (
                  <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-ink">
                    <Bell className="size-3.5" strokeWidth={2.5} />
                    Lembrete às {atividade.horarioLembrete}
                  </span>
                )}
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                {atividade.conteudoExecucao ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                    {atividade.conteudoExecucao}
                  </p>
                ) : (
                  <p className="text-sm text-ink-muted">Sem conteúdo de execução.</p>
                )}
              </div>

              <SheetFooter className="gap-2">
                <div className="flex flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => abrirEditarAtividade(atividade.id)}
                  >
                    Editar
                  </Button>
                  <Button
                    className="flex-1 gap-1.5"
                    variant={concluidaHoje ? "outline" : "default"}
                    style={concluidaHoje ? undefined : { backgroundColor: dominio.cor }}
                    onClick={() => alternarConclusaoHoje(atividade.id)}
                  >
                    {concluidaHoje ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <Circle className="size-4" />
                    )}
                    <span className={concluidaHoje ? undefined : "text-surface"}>
                      {concluidaHoje ? "Feito hoje" : "Marcar feito"}
                    </span>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="gap-1.5 text-conflict hover:bg-conflict/10 hover:text-conflict"
                  onClick={() => setConfirmarExclusao(true)}
                >
                  <Trash2 className="size-4" />
                  Excluir atividade
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmarExclusao} onOpenChange={setConfirmarExclusao}>
        <DialogContent showCloseButton={false} className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold">
              Excluir atividade?
            </DialogTitle>
            <DialogDescription>
              {atividade
                ? `"${atividade.nome}" será removida da semana e do histórico. Esta ação não pode ser desfeita.`
                : "Esta ação não pode ser desfeita."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmarExclusao(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleExcluir}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
