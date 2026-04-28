import { NextResponse } from "next/server";
import { checkSmsDevBalance, SMSDEV_DEFAULT_THRESHOLD } from "@/lib/tools/smsdev";
import { buildSmsDevCard, postToGoogleChat } from "@/lib/tools/google-chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron endpoint que roda a cada 12h (configurado em vercel.json) e
 * posta o saldo da conta SMS Dev no grupo de Produtos no Google Chat.
 *
 * Autenticação: a Vercel envia o header `Authorization: Bearer <CRON_SECRET>`
 * automaticamente quando `CRON_SECRET` está configurada como env. Se a
 * env não estiver presente, o endpoint não exige autenticação (modo
 * desenvolvimento) — em produção, sempre defina `CRON_SECRET`.
 *
 * Para testar manualmente em produção:
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *        https://<host>/api/cron/smsdev-balance
 */
function isAuthorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return true;
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${expected}`;
}

function resolveHubbleUrl(req: Request): string {
  const fromEnv = (
    process.env.APP_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
  ).trim();
  if (fromEnv) {
    return `${fromEnv.replace(/\/$/, "")}/dashboard/ferramentas/sms-dev`;
  }
  const url = new URL(req.url);
  return `${url.origin}/dashboard/ferramentas/sms-dev`;
}

async function runCron(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "GOOGLE_CHAT_WEBHOOK_URL não configurada. Adicione a env var no painel da Vercel.",
      },
      { status: 500 },
    );
  }

  const thresholdEnv = parseInt(
    process.env.SMSDEV_THRESHOLD ?? "",
    10,
  );
  const threshold = Number.isFinite(thresholdEnv) && thresholdEnv > 0
    ? thresholdEnv
    : SMSDEV_DEFAULT_THRESHOLD;

  const result = await checkSmsDevBalance({ threshold });
  const hubbleUrl = resolveHubbleUrl(req);
  const payload = buildSmsDevCard(result, { hubbleUrl });
  const post = await postToGoogleChat(webhookUrl, payload);

  if (!post.ok) {
    return NextResponse.json(
      {
        ok: false,
        result,
        post,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    result,
    postedAt: new Date().toISOString(),
  });
}

export async function GET(req: Request) {
  return runCron(req);
}

export async function POST(req: Request) {
  return runCron(req);
}
