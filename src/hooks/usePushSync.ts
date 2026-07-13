"use client";

import { useEffect } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { assinarPush, montarReminders, pushConfigurado, sincronizarPush } from "@/lib/push";
import { useAppStore } from "@/store/useAppStore";

/**
 * Mantém os lembretes sincronizados com o servidor de push sempre que as
 * atividades/alocações mudam — desde que já exista uma inscrição no dispositivo.
 * Não faz nada se o backend de push não estiver configurado.
 */
export function usePushSync() {
  const hidratado = useHydrated();
  const atividades = useAppStore((s) => s.atividades);
  const dominios = useAppStore((s) => s.dominios);
  const encaixeSemanal = useAppStore((s) => s.encaixeSemanal);

  useEffect(() => {
    if (!hidratado || !pushConfigurado()) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const reminders = montarReminders(atividades, dominios, encaixeSemanal);
    // Com lembretes ativos, garante a inscrição (cria se ainda não existir —
    // ex.: permissão concedida antes do push estar disponível). Sem lembretes,
    // apenas atualiza o servidor se já houver inscrição.
    if (reminders.length > 0) {
      void assinarPush(reminders);
    } else {
      void sincronizarPush(reminders);
    }
  }, [hidratado, atividades, dominios, encaixeSemanal]);
}
