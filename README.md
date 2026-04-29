# Product Hubble

## Setup local
Copie `.env.example` para `.env.local` e preencha as variáveis necessárias.

Depois, rode:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Variáveis importantes

### Autenticação
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_SECRET`
- `NEXTAUTH_URL`

### Notificações de comentários (e-mail)
- `RESEND_API_KEY`: chave da conta Resend usada para enviar notificações.
- `COMMENTS_FROM_EMAIL`: remetente usado nos e-mails de comentários.
- `APP_BASE_URL`: URL base usada para montar links profundos para a thread.

Se `APP_BASE_URL` não estiver definida, o app tenta usar `NEXTAUTH_URL` e depois `VERCEL_URL`.

### Banco de dados (Neon / Postgres) — obrigatório para comentários
- `DATABASE_URL`: connection string do Neon. Exemplo:
  `postgres://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`

Crie um projeto gratuito em [neon.tech](https://neon.tech), copie a connection
string do dashboard (aba **Connection Details** → **Pooled connection**) e cole
em `DATABASE_URL`. Depois aplique o schema:

```bash
npm run db:migrate
```

O script é idempotente (usa `CREATE TABLE IF NOT EXISTS`) e pode rodar sempre
que o schema mudar.

### Real-time (Pusher Channels) — obrigatório para real-time de comentários
- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PUSHER_CLUSTER` (ex: `us2`, `sa1`)
- `NEXT_PUBLIC_PUSHER_KEY` (mesmo valor de `PUSHER_KEY`, exposto ao client)
- `NEXT_PUBLIC_PUSHER_CLUSTER` (mesmo valor de `PUSHER_CLUSTER`, exposto ao client)

Crie uma app gratuita em [pusher.com/channels](https://pusher.com/channels). No
dashboard da app, aba **App Keys**, copie `app_id`, `key`, `secret` e `cluster`.

Se as envs do Pusher não estiverem configuradas, o app continua funcionando —
apenas sem propagação em tempo real (cada cliente vê seu estado após reload).

### Ferramentas internas

#### Saldo SMS Dev

- `SMSDEV_API_KEY` (obrigatório para a ferramenta): chave da API usada
  pela ferramenta em `/dashboard/ferramentas/sms-dev` e pelo cron de
  alerta. Gere no painel do SMS Dev em Configurações → API.
- `SMSDEV_THRESHOLD` (opcional, padrão `500`): saldo abaixo do qual a
  ferramenta marca como "saldo baixo".

#### Limpeza de API keys OpenAI

Ferramenta em `/dashboard/ferramentas/openai-keys` que lista todas as
API keys de todos os projetos da organização OpenAI, sinaliza as
ociosas (não usadas há mais de N dias) e nunca usadas, e permite
exclusão em massa via checkboxes (com confirmação digitando
`EXCLUIR`).

- `OPENAI_ADMIN_KEY` (obrigatório para a ferramenta): admin key da
  organização OpenAI. Gere em **Settings → Admin keys** com os
  escopos `api.management.read` e `api.management.write`. **Não
  reaproveite** a `OPENAI_API_KEY` (essa é uma key de projeto sem
  permissão de gestão).

A exclusão é definitiva — qualquer aplicação que ainda use a key vai
parar de funcionar. A ferramenta não tem cron; é manual, sob demanda.

#### Cron de saldo SMS Dev → Google Chat

Duas vezes por dia (**09:00 e 21:00 BRT**), o endpoint
`/api/cron/smsdev-balance` consulta o saldo e posta um card no espaço
do Google Chat configurado.

O agendador é o **GitHub Actions** (workflow em
`.github/workflows/smsdev-cron.yml`) — não a Vercel. O motivo é que o
plano Hobby da Vercel limita cron jobs a 1x/dia; GitHub Actions é
gratuito e ilimitado para repositórios públicos/privados padrão.

Envs no Hubble (Vercel):

- `GOOGLE_CHAT_WEBHOOK_URL` (obrigatório): webhook do espaço do Google
  Chat. Gere em **Apps & Integrações → Webhooks** dentro do espaço.
- `CRON_SECRET` (obrigatório): secret que o GitHub Actions envia como
  `Authorization: Bearer <CRON_SECRET>`. Gere com `openssl rand -hex 32`.

Secrets no GitHub Actions (`Settings → Secrets and variables → Actions`):

- `HUBBLE_BASE_URL`: URL pública do Hubble (ex: `https://hubble.zapsign.com.br`).
- `CRON_SECRET`: mesmo valor configurado na Vercel.

Para testar manualmente:

```bash
# Via terminal
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://<host>/api/cron/smsdev-balance

# Ou via GitHub: aba "Actions" → "SMS Dev — saldo no Google Chat"
# → "Run workflow"
```

## Internacionalização (PT-BR / EN / ES)

O Hubble e a tela de login têm um seletor de idioma com bandeira no canto
superior direito (PT, EN, ES). Ao mudar para inglês ou espanhol:

1. Um motor client-side varre o DOM (text nodes + atributos `placeholder`,
   `aria-label`, `title`, `alt`), ignorando blocos de código e elementos
   marcados com `data-no-translate`.
2. Os textos novos são enviados em batch para `POST /api/translate`, que
   procura no cache e só chama a IA pelos que ainda não foram vistos.
3. As traduções voltam, são aplicadas in-place e armazenadas em
   `translations-cache.json` no Vercel Blob — a partir daí, qualquer
   usuário que peça o mesmo texto recebe a tradução cacheada sem custo
   de IA.

### Variáveis

- `OPENAI_API_KEY` (obrigatório p/ traduzir): a mesma chave já usada em
  `scripts/generate-changelog.mjs`. Sem ela, o switcher continua
  funcionando mas devolve a string original.
- `OPENAI_TRANSLATE_MODEL` (opcional): override do modelo. Default
  `gpt-4o-mini`.
- `BLOB_READ_WRITE_TOKEN` (obrigatório em prod): o cache é gravado em
  Vercel Blob via `lib/data/json-blob-store.ts`. Em dev sem o token, o
  cache cai para o arquivo local `lib/data/translations-cache.json`.

### Excluindo conteúdo da tradução

Marque o elemento com `data-no-translate`:

```tsx
<code data-no-translate>{rawJson}</code>
```

O motor pula descendentes desse elemento e nunca toca em `<code>`,
`<pre>`, `<script>`, `<style>`, `<textarea>` nem regiões marcadas como
`aria-hidden="true"`.

### Invalidando o cache

O cache é "append-only" por design — cada `(locale, hash do texto)`
mapeia para uma tradução. Para forçar regenerar:

1. Delete o blob `translations-cache.json` no painel do Vercel Blob (ou
   apague o arquivo local em `lib/data/`).
2. A próxima visita refaz as chamadas à IA on-demand.

## Comentários globais
O sistema de comentários suporta:

- inbox global em `/dashboard/comentarios`
- badge global de não lidos
- deep-link para thread com `?thread=<id>`
- notificações por e-mail via Resend para novas interações
- real-time via WebSockets (Pusher Channels) — comentários aparecem
  instantaneamente em todas as abas e navegadores conectados
