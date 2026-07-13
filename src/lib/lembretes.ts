import type { Atividade, Dominio } from "@/lib/types";

/** Antecedência do lembrete, em minutos, antes do horário da atividade. */
export const LEMBRETE_ANTECEDENCIA_MIN = 15;

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export function horarioValido(hhmm: string | undefined | null): hhmm is string {
  return typeof hhmm === "string" && HHMM.test(hhmm);
}

/** Data de hoje (base) com o horário "HH:MM" aplicado. */
export function horarioComoData(hhmm: string, base = new Date()): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Momento em que o lembrete deve disparar (horário da atividade − antecedência). */
export function momentoDoLembrete(hhmm: string, base = new Date()): Date {
  const d = horarioComoData(hhmm, base);
  d.setMinutes(d.getMinutes() - LEMBRETE_ANTECEDENCIA_MIN);
  return d;
}

export function suportaNotificacoes(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/** Pede permissão de notificação (deve ser chamado a partir de um gesto do usuário). */
export async function solicitarPermissaoNotificacao(): Promise<NotificationPermission> {
  if (!suportaNotificacoes()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/** Exibe a notificação do lembrete — via service worker quando disponível. */
export async function dispararLembrete(atividade: Atividade, dominio?: Dominio) {
  if (!suportaNotificacoes() || Notification.permission !== "granted") return;

  const corpo = `Começa às ${atividade.horarioLembrete}${
    dominio ? ` · ${dominio.nome}` : ""
  }`;
  const opcoes: NotificationOptions = {
    body: corpo,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: `lembrete-${atividade.id}`,
    data: { url: "/" },
  };

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(`Lembrete: ${atividade.nome}`, opcoes);
      return;
    }
  } catch {
    // cai para o fallback abaixo
  }
  new Notification(`Lembrete: ${atividade.nome}`, opcoes);
}

// --- controle de disparos (evita repetir o mesmo lembrete no mesmo dia) ---

const FIRADOS_KEY = "myroutine-lembretes-firados";

export function chaveLembrete(atividadeId: string, dataISO: string, hhmm: string): string {
  return `${atividadeId}:${dataISO}:${hhmm}`;
}

function lerFirados(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FIRADOS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function jaDisparado(chave: string): boolean {
  return lerFirados().includes(chave);
}

/** Marca a chave como disparada e descarta chaves de outros dias. */
export function marcarDisparado(chave: string, dataISO: string) {
  if (typeof window === "undefined") return;
  const atuais = lerFirados().filter((k) => k.split(":")[1] === dataISO);
  if (!atuais.includes(chave)) atuais.push(chave);
  try {
    window.localStorage.setItem(FIRADOS_KEY, JSON.stringify(atuais));
  } catch {
    // ignora falha de storage
  }
}
