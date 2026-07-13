# myroutine-push — Worker de lembretes (Web Push)

Envia notificações push ~15 min antes das atividades, **mesmo com o app fechado**.
Recebe as inscrições do app (Cloudflare Pages) e, via **Cron Trigger** (a cada
minuto), calcula o que vence agora no fuso de cada dispositivo e dispara o push.

- `src/index.ts` — `/subscribe`, `/unsubscribe` (HTTP) + `scheduled` (cron).
- Armazenamento: **KV** (`SUBS`), uma entrada por inscrição.
- Envio: `@block65/webcrypto-web-push` (VAPID + payload cifrado via WebCrypto).

## Passo a passo do deploy

Rode tudo dentro de `worker/`:

```bash
cd worker
npm install
npx wrangler login            # sua conta Cloudflare
```

### 1. Gerar as chaves VAPID
```bash
npx web-push generate-vapid-keys
```
Guarde a **Public Key** e a **Private Key**.

### 2. Criar o namespace KV e colar o id
```bash
npx wrangler kv namespace create SUBS
```
Copie o `id` retornado para `wrangler.jsonc` em `kv_namespaces[0].id`
(substitui `COLE_O_KV_NAMESPACE_ID_AQUI`).

### 3. Configurar as chaves
- Em `wrangler.jsonc`, cole a **Public Key** em `vars.VAPID_PUBLIC_KEY` e ajuste
  `VAPID_SUBJECT` (seu e-mail) e `ALLOWED_ORIGIN` (a URL do app, ex.:
  `https://myroutine.pages.dev`; ou deixe `*`).
- A **Private Key** vai como secret:
  ```bash
  npx wrangler secret put VAPID_PRIVATE_KEY
  ```

### 4. Deploy do Worker
```bash
npx wrangler deploy
```
Anote a URL publicada, ex.: `https://myroutine-push.SEU-SUBDOMINIO.workers.dev`.

### 5. Configurar o app (Pages)
No projeto raiz, defina as variáveis de build (arquivo `.env.local` para dev,
e as **Environment Variables** do projeto no painel do Cloudflare Pages para prod):
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<a mesma Public Key>
NEXT_PUBLIC_PUSH_API=https://myroutine-push.SEU-SUBDOMINIO.workers.dev
```
Depois **rebuild + redeploy** do Pages (`npm run build` e publicar `out/`), pois
essas variáveis são embutidas no build.

## Testar
```bash
# Local: dispara o cron manualmente
npx wrangler dev
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
# Logs em produção
npx wrangler tail
```
No app: permita notificações ao salvar uma atividade **alocada** com horário.
Defina um horário ~16 min à frente, **feche o app** e aguarde ~1 min.

## Observações
- **iOS/iPhone**: só funciona com o PWA **instalado na tela inicial**.
- Cron roda em UTC; o horário local é calculado por dispositivo a partir do
  fuso (`tz`) enviado na inscrição — robusto a horário de verão.
- Plano free: 3 crons/worker e 10 ms de CPU por invocação — suficiente para uso
  pessoal (poucos dispositivos). Para muitas inscrições, considere o plano pago.
