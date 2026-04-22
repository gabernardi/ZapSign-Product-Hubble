import type { Metadata } from "next";
import {
  ThemeProvider,
  THEME_INIT_SCRIPT,
} from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZapSign | Product Hubble",
  description: "Product Hubble — guia interno do time de Produto da ZapSign.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          // Runs synchronously before paint so the theme attribute is set
          // before the first frame renders, preventing a flash.
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
