import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Guidelines · ZapSign",
  description: "Guias de processo e ferramentas para o time de Produto da ZapSign.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
