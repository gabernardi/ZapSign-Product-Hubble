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

- `SMSDEV_API_KEY` (opcional): chave da API do SMS Dev usada pela ferramenta
  em `/dashboard/ferramentas/sms-dev`. Quando definida, o time consulta o
  saldo com um clique sem precisar colar a chave. Quando ausente, cada
  pessoa pode colar a própria chave no formulário (fica salva apenas no
  `localStorage` do navegador). Gere a chave no painel do SMS Dev em
  Configurações → API.

## Comentários globais
O sistema de comentários suporta:

- inbox global em `/dashboard/comentarios`
- badge global de não lidos
- deep-link para thread com `?thread=<id>`
- notificações por e-mail via Resend para novas interações
- real-time via WebSockets (Pusher Channels) — comentários aparecem
  instantaneamente em todas as abas e navegadores conectados
