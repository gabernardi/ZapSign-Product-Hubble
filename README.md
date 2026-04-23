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

### Notificações de comentários
- `RESEND_API_KEY`: chave da conta Resend usada para enviar notificações.
- `COMMENTS_FROM_EMAIL`: remetente usado nos e-mails de comentários.
- `APP_BASE_URL`: URL base usada para montar links profundos para a thread.

Se `APP_BASE_URL` não estiver definida, o app tenta usar `NEXTAUTH_URL` e depois `VERCEL_URL`.

## Comentários globais
O sistema de comentários agora suporta:

- inbox global em `/dashboard/comentarios`
- badge global de não lidos
- deep-link para thread com `?thread=<id>`
- notificações por e-mail via Resend para novas interações
