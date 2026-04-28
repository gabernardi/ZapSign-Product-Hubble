import type { SmsDevCheckResult } from "./smsdev";

const TIMEOUT_MS = 10_000;

export interface GoogleChatPostResult {
  ok: boolean;
  status?: number;
  error?: string;
}

export async function postToGoogleChat(
  webhookUrl: string,
  payload: Record<string, unknown>,
): Promise<GoogleChatPostResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json; charset=UTF-8" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return {
        ok: false,
        status: resp.status,
        error: `HTTP ${resp.status} ${resp.statusText} ${text}`.trim(),
      };
    }
    return { ok: true, status: resp.status };
  } catch (err) {
    clearTimeout(timer);
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    return {
      ok: false,
      error: isAbort
        ? "Timeout ao postar no Google Chat."
        : err instanceof Error
          ? err.message
          : "Erro desconhecido ao postar no Google Chat.",
    };
  }
}

/**
 * Constrói o payload Card v2 do Google Chat para o resultado de uma
 * checagem de saldo SMS Dev.
 *
 * Referência: https://developers.google.com/chat/api/guides/v1/messages/create#card
 */
export function buildSmsDevCard(
  result: SmsDevCheckResult,
  options: { hubbleUrl?: string } = {},
): Record<string, unknown> {
  const cardId = `smsdev-balance-${Date.now()}`;
  const hubbleUrl = options.hubbleUrl?.trim();

  const buttonWidget = hubbleUrl
    ? {
        buttonList: {
          buttons: [
            {
              text: "Abrir no Hubble",
              onClick: { openLink: { url: hubbleUrl } },
            },
            {
              text: "Recarregar SMS Dev",
              onClick: {
                openLink: { url: "https://www.smsdev.com.br/v1/painel" },
              },
            },
          ],
        },
      }
    : null;

  if (result.status === "error") {
    return {
      cardsV2: [
        {
          cardId,
          card: {
            header: {
              title: "Saldo SMS Dev",
              subtitle: "Falha na verificação automática",
            },
            sections: [
              {
                widgets: [
                  {
                    decoratedText: {
                      topLabel: "Erro",
                      text: `<font color="#D93025"><b>Não consegui consultar o saldo</b></font>`,
                      bottomLabel: result.descricao,
                      wrapText: true,
                    },
                  },
                ],
              },
              ...(buttonWidget
                ? [{ widgets: [buttonWidget] }]
                : []),
            ],
          },
        },
      ],
    };
  }

  const low = result.status === "low";
  const formattedSaldo = result.saldo.toLocaleString("pt-BR");
  const formattedThreshold = result.threshold.toLocaleString("pt-BR");

  const headerSubtitle = low
    ? "Saldo baixo · ação recomendada"
    : "Verificação automática (a cada 12h)";

  const saldoColor = low ? "#E37400" : "#1E8E3E";
  const saldoLabel = low ? "Saldo atual (baixo)" : "Saldo atual";

  return {
    cardsV2: [
      {
        cardId,
        card: {
          header: {
            title: "Saldo SMS Dev",
            subtitle: headerSubtitle,
          },
          sections: [
            {
              widgets: [
                {
                  decoratedText: {
                    topLabel: saldoLabel,
                    text: `<font color="${saldoColor}"><b>${formattedSaldo}</b></font> SMS`,
                    bottomLabel: low
                      ? `Abaixo do limite de alerta (${formattedThreshold} SMS)`
                      : `Acima do limite de alerta (${formattedThreshold} SMS)`,
                    wrapText: true,
                  },
                },
              ],
            },
            ...(buttonWidget ? [{ widgets: [buttonWidget] }] : []),
          ],
        },
      },
    ],
  };
}
