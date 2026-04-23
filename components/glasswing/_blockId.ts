/**
 * Gera um id estável a partir de um texto, para uso em `data-comment-block`.
 * Usado pelos componentes compartilhados do Glasswing para tornar todos os
 * elementos textuais comentáveis sem exigir props extras por instância.
 */
export function slugifyForBlockId(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
