import type { AlocacaoSemanal, Atividade, Dominio } from "@/lib/types";
import { horarioValido } from "@/lib/lembretes";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const PUSH_API = process.env.NEXT_PUBLIC_PUSH_API ?? "";

export interface Reminder {
  nome: string;
  dominio?: string;
  horario: string;
  dias: number[];
}

/** Push com backend está configurado? (variáveis de build presentes) */
export function pushConfigurado(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && PUSH_API);
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/** Monta a lista de lembretes (atividade + dias alocados) para enviar ao servidor. */
export function montarReminders(
  atividades: Atividade[],
  dominios: Dominio[],
  encaixeSemanal: AlocacaoSemanal[],
): Reminder[] {
  const reminders: Reminder[] = [];
  for (const a of atividades) {
    if (!horarioValido(a.horarioLembrete)) continue;
    const dias = [
      ...new Set(
        encaixeSemanal.filter((e) => e.atividadeId === a.id).map((e) => e.diaDaSemana),
      ),
    ];
    if (dias.length === 0) continue;
    const dominio = dominios.find((d) => d.id === a.dominioId);
    reminders.push({ nome: a.nome, dominio: dominio?.nome, horario: a.horarioLembrete, dias });
  }
  return reminders;
}

function tz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

async function obterInscricao(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

/** Garante a inscrição de push e envia os lembretes ao Worker. */
export async function assinarPush(reminders: Reminder[]): Promise<boolean> {
  if (!pushConfigurado()) return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  if (Notification.permission !== "granted") return false;

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });
  }

  const res = await fetch(`${PUSH_API}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ subscription: sub.toJSON(), reminders, tz: tz() }),
  });
  return res.ok;
}

/** Reenvia os lembretes se já existe uma inscrição ativa (sincronização). */
export async function sincronizarPush(reminders: Reminder[]): Promise<boolean> {
  if (!pushConfigurado()) return false;
  const sub = await obterInscricao();
  if (!sub) return false;
  const res = await fetch(`${PUSH_API}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ subscription: sub.toJSON(), reminders, tz: tz() }),
  });
  return res.ok;
}

/** Cancela a inscrição de push no dispositivo e no servidor. */
export async function cancelarPush(): Promise<void> {
  const sub = await obterInscricao();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => {});
  if (pushConfigurado()) {
    await fetch(`${PUSH_API}/unsubscribe`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint }),
    }).catch(() => {});
  }
}
