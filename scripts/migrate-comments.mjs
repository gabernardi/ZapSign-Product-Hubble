#!/usr/bin/env node
/**
 * Aplica o schema de comentários no Neon/Postgres.
 *
 * Uso:
 *   DATABASE_URL='postgres://...' node scripts/migrate-comments.mjs
 *
 * Idempotente: usa CREATE ... IF NOT EXISTS, então pode rodar várias vezes
 * sem efeito colateral. Não dropa tabelas nem dados.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "../lib/comments/schema.sql");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL não definida. Exporte antes de rodar:");
  console.error("  export DATABASE_URL='postgres://...'");
  process.exit(1);
}

const sql = neon(databaseUrl);
const schema = readFileSync(schemaPath, "utf8");

// Executa cada statement separadamente. `neon()` não aceita múltiplos
// statements no mesmo call; divide pelo delimitador `;` e remove linhas
// de comentário (mas preserva o statement SQL que vem depois delas).
const stripLeadingComments = (text) =>
  text
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .trim();

const statements = schema
  .split(/;\s*\n/)
  .map(stripLeadingComments)
  .filter((stmt) => stmt.length > 0);

console.log(`Aplicando ${statements.length} statements...`);

for (const [idx, stmt] of statements.entries()) {
  const preview = stmt.replace(/\s+/g, " ").slice(0, 80);
  try {
    await sql.query(stmt);
    console.log(`  [${idx + 1}/${statements.length}] OK: ${preview}...`);
  } catch (err) {
    console.error(`  [${idx + 1}/${statements.length}] FAIL: ${preview}...`);
    console.error(err);
    process.exit(1);
  }
}

console.log("Migration concluída.");
