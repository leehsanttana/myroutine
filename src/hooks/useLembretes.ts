"use client";

import { useEffect, useState } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { diaSemanaAtual, hojeISO } from "@/lib/date";
import {
  chaveLembrete,
  dispararLembrete,
  horarioComoData,
  horarioValido,
  jaDisparado,
  marcarDisparado,
  momentoDoLembrete,
  suportaNotificacoes,
} from "@/lib/lembretes";
import { pushConfigurado } from "@/lib/push";
import { useAppStore } from "@/store/useAppStore";

const MAX_DELAY = 2 ** 31 - 1; // limite do setTimeout (~24,8 dias)

function msAteProximaMeiaNoite(): number {
  const agora = new Date();
  const meiaNoite = new Date(agora);
  meiaNoite.setHours(24, 0, 0, 0);
  return meiaNoite.getTime() - agora.getTime();
}

/**
 * Agenda notificações locais ~15 min antes de cada atividade de hoje que
 * tenha horário de lembrete. Funciona enquanto o app estiver aberto.
 */
export function useLembretes() {
  const hidratado = useHydrated();
  const atividades = useAppStore((s) => s.atividades);
  const dominios = useAppStore((s) => s.dominios);
  const encaixeSemanal = useAppStore((s) => s.encaixeSemanal);

  // "nonce" que reavalia os lembretes ao virar o dia.
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setNonce((n) => n + 1), msAteProximaMeiaNoite() + 1000);
    return () => clearTimeout(timer);
  }, [nonce]);

  useEffect(() => {
    if (!hidratado) return;
    // Com backend de push configurado, o servidor cuida dos avisos (app aberto
    // ou fechado). Evita notificação duplicada desativando o agendador local.
    if (pushConfigurado()) return;
    if (!suportaNotificacoes() || Notification.permission !== "granted") return;

    const diaHoje = diaSemanaAtual();
    const dataHoje = hojeISO();
    const idsHoje = new Set(
      encaixeSemanal.filter((a) => a.diaDaSemana === diaHoje).map((a) => a.atividadeId),
    );

    const timers: ReturnType<typeof setTimeout>[] = [];
    const agora = Date.now();

    for (const atividade of atividades) {
      if (!idsHoje.has(atividade.id)) continue;
      if (!horarioValido(atividade.horarioLembrete)) continue;

      const chave = chaveLembrete(atividade.id, dataHoje, atividade.horarioLembrete);
      if (jaDisparado(chave)) continue;

      const horaAtividade = horarioComoData(atividade.horarioLembrete).getTime();
      if (agora >= horaAtividade) continue; // a atividade já começou, não avisa

      const dominio = dominios.find((d) => d.id === atividade.dominioId);
      const disparar = () => {
        void dispararLembrete(atividade, dominio);
        marcarDisparado(chave, dataHoje);
      };

      const delay = momentoDoLembrete(atividade.horarioLembrete).getTime() - agora;
      if (delay <= 0) {
        // já passou da hora do aviso, mas a atividade ainda não começou: avisa agora
        disparar();
      } else {
        timers.push(setTimeout(disparar, Math.min(delay, MAX_DELAY)));
      }
    }

    return () => timers.forEach(clearTimeout);
  }, [hidratado, atividades, dominios, encaixeSemanal, nonce]);
}
