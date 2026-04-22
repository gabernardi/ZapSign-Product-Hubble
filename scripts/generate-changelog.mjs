#!/usr/bin/env node
// Gera lib/data/changelog.generated.ts a partir dos Pull Requests mergeados
// nos repositórios reais da ZapSign no Bitbucket (truora/web + truora/api).
//
// Para cada PR, uma única chamada à IA (a) classifica se a mudança é
// relevante para o usuário final do produto e (b) reescreve título,
// descrição e impacto em linguagem humana, em português do Brasil.
// Resultados são cacheados por PR + hash do conteúdo em
// lib/data/changelog-ai-cache.json (commitado), para só pagar tokens em
// PRs novos ou editados.
//
// Rodado automaticamente via `predev` e `prebuild` no package.json.
//
// Variáveis de ambiente:
//   BITBUCKET_USER            — usuário Atlassian/Bitbucket (email).
//   BITBUCKET_APP_PASSWORD    — app password com escopo mínimo: repositórios: leitura, pull requests: leitura.
//   BITBUCKET_WORKSPACE       — opcional, default "truora".
//   BITBUCKET_REPOS           — opcional, CSV. Default "web,api".
//   BITBUCKET_BRANCH          — opcional, branch de destino. Default "main".
//   CHANGELOG_SINCE_DAYS      — opcional, janela de tempo em dias. Default 90.
//   OPENAI_API_KEY            — opcional. Sem ela, os PRs não são filtrados (tudo user-facing) e usam fallback heurístico.
//   OPENAI_MODEL              — opcional. Default: gpt-4o-mini.
//   CHANGELOG_AI=0            — força desabilitar a chamada à IA.
//   CHANGELOG_AI_LIMIT        — opcional, limita quantos PRs novos são enriquecidos por run.

import {
  writeFileSync,
  readFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outPath = path.join(repoRoot, "lib/data/changelog.generated.ts");
const cachePath = path.join(repoRoot, "lib/data/changelog-ai-cache.json");

/* ──────────────────────── .env.local loader ────────────────────────
   Parser minimal para não depender de `node --env-file` (que tem
   limitações no Node 20 com comentários e linhas em branco) nem de
   dotenv como dependência. */

function loadDotEnv() {
  const candidates = [".env.local", ".env"];
  for (const name of candidates) {
    const file = path.join(repoRoot, name);
    if (!existsSync(file)) continue;
    const raw = readFileSync(file, "utf8");
    for (const lineRaw of raw.split(/\r?\n/)) {
      const line = lineRaw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      if (!key || !/^[A-Z_][A-Z0-9_]*$/i.test(key)) continue;
      if (process.env[key] !== undefined) continue;
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const AI_CONCURRENCY = 4;
const AI_TIMEOUT_MS = 25_000;
const BB_TIMEOUT_MS = 30_000;
const BB_PAGELEN = 50;
// Limite defensivo para não sobrecarregar em caso de configuração errada.
const BB_MAX_PAGES = 20;

// Versão do prompt. Incremente ao editar o prompt para invalidar o cache e
// regenerar todas as entradas com a nova versão.
const PROMPT_VERSION = 2;

/* ──────────────────────── Config ──────────────────────── */

function readConfig() {
  const user = process.env.BITBUCKET_USER?.trim();
  const pass = process.env.BITBUCKET_APP_PASSWORD?.trim();
  const workspace = (process.env.BITBUCKET_WORKSPACE || "truora").trim();
  const repos = (process.env.BITBUCKET_REPOS || "web,api")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const branch = (process.env.BITBUCKET_BRANCH || "main").trim();
  const sinceDaysRaw = Number.parseInt(
    process.env.CHANGELOG_SINCE_DAYS ?? "",
    10,
  );
  const sinceDays =
    Number.isFinite(sinceDaysRaw) && sinceDaysRaw > 0 ? sinceDaysRaw : 90;

  const hasCredentials = Boolean(user && pass);
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);

  return {
    user,
    pass,
    workspace,
    repos,
    branch,
    sinceDays,
    since,
    hasCredentials,
  };
}

/* ──────────────────────── Bitbucket ──────────────────────── */

function authHeader(user, pass) {
  const token = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${token}`;
}

async function bbFetch(url, { user, pass }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BB_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: authHeader(user, pass),
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(
        `Bitbucket ${res.status} em ${url}: ${txt.slice(0, 300)}`,
      );
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchMergedPRs({ workspace, repo, branch, since, user, pass }) {
  // Bitbucket Cloud 2.0: filtro via `q` aceita AND lógico e comparações.
  //   https://developer.atlassian.com/cloud/bitbucket/rest/intro/#filtering
  const sinceIso = since.toISOString().replace(/\.\d+Z$/, "+00:00");
  const q = `destination.branch.name = "${branch}" AND updated_on >= ${sinceIso}`;
  const base = `https://api.bitbucket.org/2.0/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repo)}/pullrequests`;
  const params = new URLSearchParams({
    state: "MERGED",
    sort: "-updated_on",
    pagelen: String(BB_PAGELEN),
    q,
  });
  let url = `${base}?${params.toString()}`;

  const all = [];
  let pages = 0;
  while (url && pages < BB_MAX_PAGES) {
    const data = await bbFetch(url, { user, pass });
    pages += 1;
    const values = Array.isArray(data?.values) ? data.values : [];
    for (const pr of values) {
      // Alguns PRs marcados como MERGED podem não ter merge_commit (raros, mas
      // tratamos). Também filtramos defensivamente por data de fechamento.
      const closed = pr.closed_on ?? pr.updated_on;
      if (!closed) continue;
      if (new Date(closed).getTime() < since.getTime()) continue;

      all.push({
        repo: `${workspace}/${repo}`,
        repoShort: repo,
        prNumber: pr.id,
        prUrl: pr?.links?.html?.href ?? "",
        title: (pr.title || "").trim(),
        description: (pr?.summary?.raw || "").trim(),
        author:
          (pr?.author?.display_name || pr?.author?.nickname || "—").trim(),
        date: closed,
        mergeHash: pr?.merge_commit?.hash ?? null,
        sourceBranch: pr?.source?.branch?.name ?? null,
      });
    }
    url = data?.next || null;
  }
  if (pages >= BB_MAX_PAGES && url) {
    console.warn(
      `[changelog] ${workspace}/${repo}: limite de ${BB_MAX_PAGES} páginas atingido. Considere reduzir CHANGELOG_SINCE_DAYS.`,
    );
  }
  return all;
}

/* ──────────────────────── Cache ──────────────────────── */

function loadCache() {
  if (!existsSync(cachePath)) return {};
  try {
    const raw = readFileSync(cachePath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.warn(
      "[changelog] cache inválido, recomeçando do zero:",
      err instanceof Error ? err.message : err,
    );
    return {};
  }
}

function saveCache(cache) {
  const dir = path.dirname(cachePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n", "utf8");
}

function contentHash(pr) {
  return createHash("sha1")
    .update(pr.title)
    .update("\u241F")
    .update(pr.description)
    .digest("hex")
    .slice(0, 12);
}

function cacheKey(pr) {
  return `pr:v${PROMPT_VERSION}:${pr.repo}:${pr.prNumber}:${contentHash(pr)}`;
}

/* ──────────────────────── PR parsing helpers ──────────────────────── */

// Remove emoji + sufixos tipo "🚀 (main)" e prefixos "ZEX-123:" do título
// do PR para passar um título mais limpo à IA. Preserva o ticket Jira à
// parte, se houver.
function cleanPrTitle(raw) {
  let t = (raw || "").trim();
  // Remove emojis (faixa BMP de dingbats/emoticons) — ficam no raw mas
  // poluem o prompt.
  t = t.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu,
    "",
  );
  // Remove sufixo " (main)" ou " → main" no final.
  t = t.replace(/\s*(?:\(main\)|→\s*main)\s*$/i, "");
  // Colapsa espaços.
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

// Extrai o ticket Jira (ex. ZEX-578, ZSU-916) se aparecer no título.
function extractJiraKey(title) {
  const m = title.match(/\b([A-Z]{2,5}-\d+)\b/);
  return m ? m[1] : null;
}

// Tenta extrair o "Change Type" do corpo da descrição (template interno:
// "Change Type: Bug Fix" / "Change Type: Feature" etc.).
function extractChangeType(description) {
  if (!description) return null;
  const m = description.match(
    /Change\s*Type\s*[:=]\s*[`*_\s]*([A-Za-z][A-Za-z\s/&-]{2,40})/i,
  );
  if (!m) return null;
  const raw = m[1].replace(/[`*_]/g, "").trim().toLowerCase();
  if (/bug\s*fix|hotfix|fix/.test(raw)) return "bug_fix";
  if (/feature|feat/.test(raw)) return "feature";
  if (/refactor/.test(raw)) return "refactor";
  if (/chore|maint/.test(raw)) return "chore";
  if (/doc/.test(raw)) return "docs";
  if (/test/.test(raw)) return "test";
  if (/perf|performance/.test(raw)) return "perf";
  return null;
}

/* ──────────────────────── IA ──────────────────────── */

function heuristicAi(pr) {
  // Sem IA disponível: assumimos que todo PR mergeado é publicável, e
  // devolvemos o título original como fallback. O operador pode acionar a
  // IA depois; o cache vai preencher só o que for novo.
  const title =
    pr.title.length > 80 ? pr.title.slice(0, 77) + "…" : pr.title || "Mudança";
  const description = pr.description
    ? pr.description.split("\n").find((l) => l.trim().length > 0)?.slice(0, 220) ?? ""
    : "";
  return {
    userFacing: true,
    reason: "sem-ia",
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description,
    impact: "",
    source: "fallback",
  };
}

function buildPrompt(pr) {
  const surface =
    pr.repoShort === "web"
      ? "Frontend web (dashboard que os clientes usam no navegador)"
      : pr.repoShort === "api"
        ? "Backend/API (regras de negócio, integrações, dados)"
        : pr.repoShort;

  const desc = pr.description?.trim()
    ? pr.description.slice(0, 4000)
    : "(sem descrição)";

  const cleanTitle = cleanPrTitle(pr.title);
  const jira = extractJiraKey(pr.title) || extractJiraKey(pr.description || "");
  const changeType = extractChangeType(pr.description || "");

  const typeGuidance = {
    bug_fix: [
      "TIPO = CORREÇÃO DE BUG. Trate como fix pontual, não como feature.",
      "Título deve começar com: 'Correção em…', 'Correção de…', 'Ajuste em…'",
      "(ou redação equivalente de correção). NUNCA escreva como se fosse",
      "implementação nova. Proibido nesses casos: 'Implementa', 'Adiciona',",
      "'Lança', 'Suporte a', 'Nova(o)', 'Passa a oferecer', 'Agora é possível'",
      "quando o sentido for 'fixado um comportamento quebrado'. A descrição",
      "deve dizer o que estava errado E o que passa a acontecer.",
    ].join("\n   "),
    feature: [
      "TIPO = FEATURE. Descreva como capacidade nova, mas sem inflar.",
      "Se a feature é pequena (ex.: um campo novo, uma opção nova num menu),",
      "diga isso com honestidade. Não escreva como se fosse um produto novo.",
    ].join("\n   "),
    refactor:
      "TIPO = REFACTOR. Quase sempre userFacing=false. Só marque true se houver efeito observável (ex.: performance perceptível).",
    chore:
      "TIPO = CHORE/MANUTENÇÃO. Quase sempre userFacing=false. Só marque true se houver efeito observável.",
    docs: "TIPO = DOCUMENTAÇÃO. userFacing=false a menos que seja documentação pública lida por clientes.",
    test: "TIPO = TESTES. userFacing=false.",
    perf: "TIPO = PERFORMANCE. Marque true só se o ganho for perceptível pro cliente (carregamento, upload, etc.).",
  }[changeType] ?? "TIPO = NÃO INFORMADO. Deduza do conteúdo, mas em dúvida prefira 'bug_fix' se o tom da descrição indicar correção.";

  return [
    "Contexto: ZapSign é uma plataforma brasileira de assinatura eletrônica",
    "de documentos, usada por PMEs, escritórios de advocacia, setor financeiro",
    "e RH. O público do changelog são os CLIENTES e USUÁRIOS FINAIS do",
    "produto — não engenheiros. Eles querem saber 'o que mudou pra mim'.",
    "",
    "Você recebe um Pull Request já mergeado na branch de produção e deve:",
    "",
    "1) CLASSIFICAR se a mudança é user-facing.",
    "   userFacing = true quando o PR entrega algo observável para o cliente:",
    "     — Mudança em tela, fluxo, formulário, notificação, e-mail, PDF.",
    "     — Nova integração, novo método de assinatura, nova API pública.",
    "     — Mudança em regra de negócio, cobrança, limites, permissões.",
    "     — Correção de bug reproduzível por cliente.",
    "     — Melhoria de performance perceptível (carregamento, upload).",
    "   userFacing = false quando é puramente interno:",
    "     — Refactor, reorganização de código, renomes.",
    "     — Testes, CI, lint, tipagem, build.",
    "     — Migrações de banco sem efeito visível, infraestrutura, observabilidade.",
    "     — Bump de dependência sem mudança de comportamento.",
    "     — Documentação interna, toggles desligados, feature flags sem rollout.",
    "   Em dúvida genuína, prefira false. O bar é alto.",
    "",
    "2) Se userFacing = true, REESCREVER em pt-BR, voltado ao cliente,",
    "   MANTENDO PROPORÇÃO com a mudança real:",
    "",
    `   ${typeGuidance}`,
    "",
    "   Campos:",
    "   — title: até 70 caracteres. Sem prefixos tipo 'feat:'/'fix:'. Capitaliza só",
    "     a primeira letra. Menciona o objeto concreto (ex.: 'Assinatura com",
    "     selo ICP-Brasil em lote', não 'Melhoria na assinatura').",
    "     **Se o tipo for bug_fix, o título deve refletir correção, não feature.**",
    "   — description: 1 a 2 frases (até 240 caracteres). Responde 'o que mudou'.",
    "     Se conseguir inferir o 'por quê', inclua. Use fatos do PR, não invente.",
    "     Se for fix, diga o que estava errado e o que passa a acontecer.",
    "   — impact: até 160 caracteres. Efeito OBSERVÁVEL e CONCRETO pro cliente.",
    "     Exemplos bons: 'Ao enviar vários documentos de uma vez, agora dá pra",
    "     escolher ICP-Brasil pra todos em uma só etapa', 'O link de assinatura",
    "     expira em 7 dias em vez de 30'. Se o impacto só se repetir o que está no",
    "     title/description, deixe vazio.",
    "",
    "3) Se userFacing = false, preencha title/description/impact com string",
    "   VAZIA. Em 'reason', explique em até 100 caracteres por que é interno.",
    "",
    "Regras proibidas para title/description/impact:",
    "— Nunca use 'melhora a experiência', 'mais intuitivo', 'mais seguro',",
    "  'mais eficiente', 'otimiza o fluxo', 'aumenta produtividade',",
    "  'facilita a colaboração', 'mais robusto'. São vagas demais.",
    "— Nunca cite nome de branch, hash, arquivo, classe, função ou teste.",
    "— Nunca use jargão técnico sem traduzir ('migration', 'webhook', 'payload').",
    "— Nunca infle: se o PR muda 1 comportamento pequeno, a entrada tem que",
    "  soar pequena. Melhor um título curto e preciso do que um grandioso e falso.",
    "",
    "Pull Request:",
    `— repositório: ${pr.repo} (${surface})`,
    `— tipo declarado: ${changeType ?? "desconhecido"}`,
    `— ticket Jira: ${jira ?? "—"}`,
    `— #${pr.prNumber}: ${cleanTitle}`,
    `— título bruto original: ${pr.title}`,
    `— autor: ${pr.author}`,
    `— mergeado em: ${pr.date}`,
    `— branch de origem: ${pr.sourceBranch ?? "—"}`,
    "— descrição:",
    desc,
  ].join("\n");
}

async function callOpenAI({ apiKey, model, pr }) {
  const prompt = buildPrompt(pr);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "changelog_entry",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                userFacing: { type: "boolean" },
                reason: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                impact: { type: "string" },
              },
              required: [
                "userFacing",
                "reason",
                "title",
                "description",
                "impact",
              ],
            },
          },
        },
        messages: [
          {
            role: "system",
            content: [
              "Você escreve notas de release da ZapSign em pt-BR, voltadas ao",
              "cliente final. Regras não-negociáveis:",
              "1. Descarte tudo que for puramente interno (refactor, teste, CI,",
              "   migração sem efeito visível, bump). Em dúvida, descarte.",
              "2. Nunca use frases-molde vagas. Se só conseguir escrever uma,",
              "   descarte o PR (userFacing=false).",
              "3. Fale em português, sem jargão técnico exposto.",
              "4. MANTENHA PROPORÇÃO: se o PR é um bug fix pontual, escreva",
              "   como correção, não como feature. Se é refactor disfarçado de",
              "   feature, descarte. Nunca 'infle' a mudança.",
              "5. Bug fix NUNCA começa com 'Implementa', 'Adiciona', 'Lança',",
              "   'Suporte a', 'Nova'. Sempre inicia como correção.",
              "6. Responda APENAS no schema JSON fornecido.",
            ].join("\n"),
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`OpenAI ${res.status}: ${txt.slice(0, 200)}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error("resposta sem content");
    const parsed = JSON.parse(content);

    return {
      userFacing: Boolean(parsed.userFacing),
      reason: String(parsed.reason ?? "").trim(),
      title: String(parsed.title ?? "").trim(),
      description: String(parsed.description ?? "").trim(),
      impact: String(parsed.impact ?? "").trim(),
      source: "openai",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function enrichPRs(prs) {
  const cache = loadCache();
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const disabled =
    process.env.CHANGELOG_AI === "0" || process.env.CHANGELOG_AI === "false";
  const budget = Number.parseInt(process.env.CHANGELOG_AI_LIMIT ?? "", 10);
  const maxNewCalls = Number.isFinite(budget) && budget > 0 ? budget : Infinity;

  const canUseAi = Boolean(apiKey) && !disabled;

  const needCall = [];
  const results = new Map();

  for (const pr of prs) {
    const key = cacheKey(pr);
    const cached = cache[key];
    if (cached && typeof cached.userFacing === "boolean") {
      results.set(key, cached);
    } else {
      needCall.push({ pr, key });
    }
  }

  if (!canUseAi) {
    if (!apiKey && !disabled) {
      console.warn(
        "[changelog] OPENAI_API_KEY ausente — usando fallback heurístico (sem classificação user-facing).",
      );
    }
    for (const { pr, key } of needCall) {
      results.set(key, heuristicAi(pr));
    }
  } else {
    let calls = 0;
    let idx = 0;
    const errors = [];

    async function worker() {
      while (idx < needCall.length && calls < maxNewCalls) {
        const myIdx = idx++;
        if (myIdx >= needCall.length) break;
        const { pr, key } = needCall[myIdx];
        if (calls >= maxNewCalls) {
          results.set(key, heuristicAi(pr));
          continue;
        }
        calls++;
        try {
          const ai = await callOpenAI({ apiKey, model, pr });
          results.set(key, ai);
          cache[key] = ai;
        } catch (err) {
          errors.push({ id: `${pr.repoShort}#${pr.prNumber}`, err });
          results.set(key, heuristicAi(pr));
        }
      }
    }

    const workers = Array.from(
      { length: Math.min(AI_CONCURRENCY, needCall.length) },
      () => worker(),
    );
    await Promise.all(workers);

    if (calls > 0) {
      console.log(
        `[changelog] IA: ${calls} PRs novos processados${needCall.length - calls > 0 ? ` (${needCall.length - calls} sem chamada por limite)` : ""}.`,
      );
    }
    if (errors.length) {
      console.warn(
        `[changelog] IA: ${errors.length} falhas (fallback heurístico aplicado). Ex.: ${errors
          .slice(0, 3)
          .map((e) => `${e.id}: ${e.err instanceof Error ? e.err.message : e.err}`)
          .join(" | ")}`,
      );
    }

    saveCache(cache);
  }

  return prs
    .map((pr) => {
      const ai = results.get(cacheKey(pr)) ?? heuristicAi(pr);
      // Nota: rawDescription e author não entram no bundle — a descrição
      // bruta dos PRs chega a milhares de linhas (templates extensos) e
      // não é usada pela UI. Ficam apenas em memória durante o run para
      // alimentar o prompt da IA.
      return {
        id: `${pr.repoShort}-${pr.prNumber}`,
        repo: pr.repo,
        repoShort: pr.repoShort,
        prNumber: pr.prNumber,
        prUrl: pr.prUrl,
        date: pr.date,
        rawTitle: pr.title,
        ai,
      };
    })
    .filter((entry) => entry.ai.userFacing === true);
}

/* ──────────────────────── Serialise ──────────────────────── */

function serialise(entries) {
  return `// Auto-gerado por scripts/generate-changelog.mjs
// NÃO edite este arquivo manualmente — ele é sobrescrito no próximo build.

export interface ChangelogAi {
  title: string;
  description: string;
  impact: string;
  userFacing: boolean;
  reason: string;
  source: "openai" | "fallback";
}

export interface ChangelogEntry {
  id: string;
  repo: string;
  repoShort: string;
  prNumber: number;
  prUrl: string;
  date: string;
  rawTitle: string;
  ai: ChangelogAi;
}

export const CHANGELOG_GENERATED_AT = ${JSON.stringify(new Date().toISOString())};

export const CHANGELOG: ChangelogEntry[] = ${JSON.stringify(entries, null, 2)};
`;
}

function writeEmpty(reason) {
  // Preserva o arquivo existente se já tiver dados — build/dev não deve
  // quebrar só porque a credencial está ausente em um ambiente.
  if (existsSync(outPath)) {
    console.warn(
      `[changelog] ${reason} — mantendo changelog.generated.ts existente.`,
    );
    return;
  }
  const dir = path.dirname(outPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(outPath, serialise([]), "utf8");
  console.warn(`[changelog] ${reason} — arquivo vazio gerado.`);
}

/* ──────────────────────── Main ──────────────────────── */

async function main() {
  const cfg = readConfig();

  if (!cfg.hasCredentials) {
    writeEmpty(
      "Sem BITBUCKET_USER/BITBUCKET_APP_PASSWORD. Defina-os em .env.local para gerar o changelog a partir dos PRs reais.",
    );
    return;
  }

  console.log(
    `[changelog] Buscando PRs mergeados em "${cfg.branch}" nos últimos ${cfg.sinceDays} dias em ${cfg.repos.map((r) => `${cfg.workspace}/${r}`).join(", ")}…`,
  );

  const all = [];
  for (const repo of cfg.repos) {
    try {
      const prs = await fetchMergedPRs({
        workspace: cfg.workspace,
        repo,
        branch: cfg.branch,
        since: cfg.since,
        user: cfg.user,
        pass: cfg.pass,
      });
      console.log(`[changelog] ${cfg.workspace}/${repo}: ${prs.length} PRs.`);
      all.push(...prs);
    } catch (err) {
      console.error(
        `[changelog] Falha ao consultar ${cfg.workspace}/${repo}:`,
        err instanceof Error ? err.message : err,
      );
      // Se um dos repos falhar, seguimos com o que temos, mas se nenhum
      // tiver dado, preservamos o arquivo atual.
    }
  }

  if (all.length === 0) {
    writeEmpty("Nenhum PR retornado pela API do Bitbucket");
    return;
  }

  // Dedup defensivo (PR id é único por repo).
  const seen = new Set();
  const deduped = [];
  for (const pr of all) {
    const k = `${pr.repo}#${pr.prNumber}`;
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(pr);
  }

  // Ordena por data de merge, mais recente primeiro.
  deduped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const enriched = await enrichPRs(deduped);

  const dir = path.dirname(outPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(outPath, serialise(enriched), "utf8");
  const discarded = deduped.length - enriched.length;
  console.log(
    `[changelog] ${enriched.length} entradas user-facing (de ${deduped.length} PRs; ${discarded} descartados) → ${path.relative(repoRoot, outPath)}`,
  );
}

main().catch((err) => {
  console.error("[changelog] erro inesperado:", err);
  process.exit(1);
});
