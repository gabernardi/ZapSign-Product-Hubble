import { Resend } from "resend";

let client: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new Resend(apiKey);
  }
  return client;
}

export function getCommentsEmailFrom(): string | null {
  return (
    process.env.COMMENTS_FROM_EMAIL ??
    process.env.RESEND_FROM_EMAIL ??
    null
  );
}

export function getCommentsAppBaseUrl(): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function sendResendEmail(input: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const resend = getResendClient();
  const from = getCommentsEmailFrom();
  if (!resend || !from || input.to.length === 0) {
    return false;
  }

  await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  return true;
}
