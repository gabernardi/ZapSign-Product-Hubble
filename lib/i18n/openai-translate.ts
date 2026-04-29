import type { Locale } from "./types";

/**
 * Wrapper fino sobre a Chat Completions API da OpenAI para traduzir
 * múltiplas strings em um único request, mantendo o mapeamento
 * source → translated estável via JSON schema.
 *
 * O modelo padrão é `gpt-4o-mini` — barato, rápido e bom o suficiente
 * pra UI. Override via `OPENAI_TRANSLATE_MODEL`.
 */

const TIMEOUT_MS = 25_000;
const MAX_BATCH = 50;

const PRESERVE_TERMS = [
  "ZapSign",
  "Hubble",
  "Product Hubble",
  "Truora",
  "ICP-Brasil",
  "Glasswing",
  "Upstream",
  "Downstream",
  "Pagar.me",
  "Pagarme",
];

const LOCALE_NAME: Record<Locale, string> = {
  pt: "Portuguese (pt-BR)",
  en: "English (en-US)",
  es: "Spanish (es-ES, neutral / Latin American)",
};

function buildSystemPrompt(locale: Locale): string {
  return [
    `You are a UI translator for an internal product tool. Translate from`,
    `Brazilian Portuguese to ${LOCALE_NAME[locale]}.`,
    "",
    "Hard rules:",
    `- Preserve EXACTLY (do not translate): ${PRESERVE_TERMS.join(", ")}.`,
    "- Preserve punctuation, capitalization style, line breaks, and any",
    "  surrounding whitespace from the source.",
    "- Preserve placeholder tokens like {name}, {count}, %s, ${var}.",
    "- Preserve markdown / inline HTML if present.",
    "- Do NOT add quotes, prefixes, or commentary.",
    "- If the source is a single word that is a UI label, translate it as a",
    "  short equivalent UI label.",
    "- If a string is already in the target language or is language-agnostic",
    "  (numbers, emails, URLs), return it unchanged.",
    "",
    "Output: respond ONLY with the JSON schema provided. The `items` array",
    "must have the same length and order as the input, with `index` matching",
    "the input position.",
  ].join("\n");
}

function buildUserPrompt(texts: string[]): string {
  return [
    "Translate each of the following strings. Respond with one item per",
    "input, keeping the same index.",
    "",
    JSON.stringify(
      texts.map((text, index) => ({ index, source: text })),
      null,
      2,
    ),
  ].join("\n");
}

interface OpenAiResponseItem {
  index: number;
  translated: string;
}

async function callOpenAi(
  apiKey: string,
  model: string,
  locale: Locale,
  texts: string[],
): Promise<OpenAiResponseItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.1,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "translations",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      index: { type: "integer" },
                      translated: { type: "string" },
                    },
                    required: ["index", "translated"],
                  },
                },
              },
              required: ["items"],
            },
          },
        },
        messages: [
          { role: "system", content: buildSystemPrompt(locale) },
          { role: "user", content: buildUserPrompt(texts) },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`OpenAI ${res.status}: ${txt.slice(0, 300)}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI: empty content");
    const parsed = JSON.parse(content);
    if (!parsed || !Array.isArray(parsed.items)) {
      throw new Error("OpenAI: malformed items");
    }
    return parsed.items as OpenAiResponseItem[];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Traduz um array de strings em uma única chamada IA (ou várias se
 * passar do tamanho do batch). Devolve um Map source → translated com
 * fallback pra source quando a IA não responde algo válido pra aquele
 * índice.
 */
export async function translateBatch(
  locale: Locale,
  texts: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (texts.length === 0) return result;

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_TRANSLATE_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    console.warn(
      "[i18n] OPENAI_API_KEY ausente — devolvendo strings originais.",
    );
    for (const text of texts) result.set(text, text);
    return result;
  }

  for (let i = 0; i < texts.length; i += MAX_BATCH) {
    const slice = texts.slice(i, i + MAX_BATCH);
    try {
      const items = await callOpenAi(apiKey, model, locale, slice);
      for (const item of items) {
        const source = slice[item.index];
        if (typeof source !== "string") continue;
        const translated =
          typeof item.translated === "string" && item.translated
            ? item.translated
            : source;
        result.set(source, translated);
      }
      for (const source of slice) {
        if (!result.has(source)) result.set(source, source);
      }
    } catch (err) {
      console.error("[i18n] translateBatch failed:", err);
      for (const source of slice) {
        if (!result.has(source)) result.set(source, source);
      }
    }
  }

  return result;
}
