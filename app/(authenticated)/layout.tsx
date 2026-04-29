import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getInitialLocale } from "@/lib/i18n/server";
import { AuthenticatedShell } from "./AuthenticatedShell";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLocale = await getInitialLocale();
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </LocaleProvider>
  );
}
