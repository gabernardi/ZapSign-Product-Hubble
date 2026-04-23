import type { Author, Thread } from "@/lib/comments/types";
import { getCommentsAppBaseUrl, sendResendEmail } from "./resend";

function truncate(value: string, max = 180): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function pageLabel(pageId: string): string {
  if (pageId.startsWith("/dashboard/roadmap/")) {
    const quarter = pageId.split("/").pop()?.toUpperCase() ?? "Roadmap";
    return `Roadmap ${quarter}`;
  }
  switch (pageId) {
    case "/dashboard":
      return "Dashboard";
    case "/dashboard/upstream":
      return "Upstream";
    case "/dashboard/downstream":
      return "Downstream";
    case "/dashboard/papeis":
      return "Papéis & Responsabilidades";
    case "/dashboard/roadmap":
      return "Roadmap";
    case "/dashboard/contribuir":
      return "Laboratório";
    case "/dashboard/changelog":
      return "Changelog";
    case "/dashboard/management-tips":
      return "Liderança";
    default:
      return pageId;
  }
}

function threadUrl(pageId: string, threadId: string): string {
  const baseUrl = getCommentsAppBaseUrl().replace(/\/$/, "");
  return `${baseUrl}${pageId}?thread=${encodeURIComponent(threadId)}`;
}

function participantsExcluding(thread: Thread, actor: Author): string[] {
  return thread.participantEmails.filter((email) => email !== actor.email);
}

function buildHtml(input: {
  title: string;
  intro: string;
  quote: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1A1A1A;">
      <h2 style="margin: 0 0 12px;">${input.title}</h2>
      <p style="margin: 0 0 16px;">${input.intro}</p>
      <blockquote style="margin: 0 0 16px; padding: 12px 16px; border-left: 3px solid #DADCE0; background: #F8F9FA;">
        ${input.quote}
      </blockquote>
      <p style="margin: 0 0 20px;">${input.body}</p>
      <p style="margin: 0;">
        <a href="${input.ctaUrl}" style="display: inline-block; padding: 10px 16px; border-radius: 999px; background: #1A73E8; color: #FFFFFF; text-decoration: none; font-weight: 600;">
          ${input.ctaLabel}
        </a>
      </p>
    </div>
  `.trim();
}

async function safeSend(input: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}) {
  try {
    await sendResendEmail(input);
  } catch (error) {
    console.error("comment notification email failed", error);
  }
}

export async function notifyCommentThreadParticipants(input: {
  pageId: string;
  thread: Thread;
  actor: Author;
  commentBody: string;
}): Promise<void> {
  const recipients = participantsExcluding(input.thread, input.actor);
  if (recipients.length === 0) return;

  const label = pageLabel(input.pageId);
  const url = threadUrl(input.pageId, input.thread.id);
  const actorName = input.actor.name ?? input.actor.email;
  const quote = truncate(input.thread.anchor.quote, 240);
  const body = truncate(input.commentBody, 260);
  const subject = `${actorName} comentou em ${label}`;

  await safeSend({
    to: recipients,
    subject,
    html: buildHtml({
      title: `Novo comentário em ${label}`,
      intro: `${actorName} respondeu uma thread que você acompanha.`,
      quote,
      body,
      ctaLabel: "Abrir discussão",
      ctaUrl: url,
    }),
    text: [
      `Novo comentário em ${label}`,
      "",
      `${actorName} respondeu uma thread que você acompanha.`,
      "",
      `Trecho: ${quote}`,
      "",
      `Comentário: ${body}`,
      "",
      `Abrir discussão: ${url}`,
    ].join("\n"),
  });
}

export async function notifyNewCommentThread(input: {
  pageId: string;
  thread: Thread;
  actor: Author;
}): Promise<void> {
  const recipients = participantsExcluding(input.thread, input.actor);
  if (recipients.length === 0) return;

  const label = pageLabel(input.pageId);
  const url = threadUrl(input.pageId, input.thread.id);
  const actorName = input.actor.name ?? input.actor.email;
  const quote = truncate(input.thread.anchor.quote, 240);
  const openingComment = truncate(input.thread.comments[0]?.body ?? "", 260);
  const subject = `${actorName} abriu uma discussão em ${label}`;

  await safeSend({
    to: recipients,
    subject,
    html: buildHtml({
      title: `Nova discussão em ${label}`,
      intro: `${actorName} abriu uma nova thread de comentários.`,
      quote,
      body: openingComment,
      ctaLabel: "Ver discussão",
      ctaUrl: url,
    }),
    text: [
      `Nova discussão em ${label}`,
      "",
      `${actorName} abriu uma nova thread de comentários.`,
      "",
      `Trecho: ${quote}`,
      "",
      `Comentário inicial: ${openingComment}`,
      "",
      `Ver discussão: ${url}`,
    ].join("\n"),
  });
}
