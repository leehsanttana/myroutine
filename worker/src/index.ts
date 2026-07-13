import {
  buildPushPayload,
  type PushMessage,
  type PushSubscription,
  type VapidKeys,
} from "@block65/webcrypto-web-push";

/** Antecedência do lembrete, em minutos (igual ao app). */
const LEAD = 15;

interface Reminder {
  nome: string;
  dominio?: string;
  /** "HH:MM" 24h — horário da atividade. */
  horario: string;
  /** Dias da semana alocados (0=domingo … 6=sábado). */
  dias: number[];
}

interface Registro {
  subscription: PushSubscription;
  reminders: Reminder[];
  /** Fuso IANA do dispositivo, ex.: "America/Sao_Paulo". */
  tz: string;
  updatedAt: number;
}

interface Env {
  SUBS: KVNamespace;
  VAPID_SUBJECT: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  ALLOWED_ORIGIN: string;
}

function cors(env: Env): Record<string, string> {
  return {
    "access-control-allow-origin": env.ALLOWED_ORIGIN || "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  };
}

function json(data: unknown, env: Env, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...cors(env) },
  });
}

async function chaveDe(endpoint: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `sub:${hex}`;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(env) });
    }

    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/subscribe") {
      let body: {
        subscription?: PushSubscription;
        reminders?: Reminder[];
        tz?: string;
      };
      try {
        body = await req.json();
      } catch {
        return json({ error: "json inválido" }, env, 400);
      }
      const sub = body.subscription;
      if (!sub?.endpoint || !sub.keys?.auth || !sub.keys?.p256dh) {
        return json({ error: "subscription inválida" }, env, 400);
      }
      const registro: Registro = {
        subscription: sub,
        reminders: Array.isArray(body.reminders) ? body.reminders : [],
        tz: typeof body.tz === "string" ? body.tz : "UTC",
        updatedAt: Date.now(),
      };
      await env.SUBS.put(await chaveDe(sub.endpoint), JSON.stringify(registro));
      return json({ ok: true }, env);
    }

    if (req.method === "POST" && url.pathname === "/unsubscribe") {
      let body: { endpoint?: string };
      try {
        body = await req.json();
      } catch {
        return json({ error: "json inválido" }, env, 400);
      }
      if (body.endpoint) await env.SUBS.delete(await chaveDe(body.endpoint));
      return json({ ok: true }, env);
    }

    return json({ error: "not found" }, env, 404);
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    await enviarDevidos(env);
  },
} satisfies ExportedHandler<Env>;

function minutosDe(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function partesLocais(tz: string, agora: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const p = Object.fromEntries(
    fmt.formatToParts(agora).map((x) => [x.type, x.value]),
  ) as Record<string, string>;
  const mapa: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  let hora = parseInt(p.hour, 10);
  if (hora === 24) hora = 0; // alguns ICU retornam "24" à meia-noite
  return { dia: mapa[p.weekday] ?? 0, hora, minuto: parseInt(p.minute, 10) };
}

function venceAgora(r: Reminder, loc: { dia: number; hora: number; minuto: number }): boolean {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(r.horario)) return false;
  for (const dia of r.dias) {
    let total = minutosDe(r.horario) - LEAD;
    let fireDia = dia;
    if (total < 0) {
      total += 1440;
      fireDia = (dia + 6) % 7; // o aviso cai no dia anterior
    }
    if (fireDia === loc.dia && Math.floor(total / 60) === loc.hora && total % 60 === loc.minuto) {
      return true;
    }
  }
  return false;
}

async function enviarDevidos(env: Env): Promise<void> {
  const vapid: VapidKeys = {
    subject: env.VAPID_SUBJECT,
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
  };
  const agora = new Date();

  let cursor: string | undefined;
  do {
    const lista = await env.SUBS.list({ prefix: "sub:", cursor });
    cursor = lista.list_complete ? undefined : lista.cursor;

    for (const chave of lista.keys) {
      const registro = await env.SUBS.get<Registro>(chave.name, "json");
      if (!registro) continue;

      const loc = partesLocais(registro.tz, agora);
      const devidos = registro.reminders.filter((r) => venceAgora(r, loc));

      for (const r of devidos) {
        const message: PushMessage = {
          data: {
            title: `Lembrete: ${r.nome}`,
            body: `Começa às ${r.horario}${r.dominio ? ` · ${r.dominio}` : ""}`,
            url: "/",
          },
          options: { ttl: 600, urgency: "high" },
        };
        try {
          const payload = await buildPushPayload(message, registro.subscription, vapid);
          const res = await fetch(registro.subscription.endpoint, {
            method: "POST",
            headers: payload.headers,
            body: payload.body as BodyInit,
          });
          if (res.status === 404 || res.status === 410) {
            await env.SUBS.delete(chave.name); // inscrição expirou
          }
        } catch {
          // falha pontual de envio — ignora, tenta no próximo minuto
        }
      }
    }
  } while (cursor);
}
