import type { Metadata } from "next";
import { Bodoni_Moda, Archivo } from "next/font/google";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bodoni-moda",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zaya — Moda Feminina",
  description: "Zaya. Moda feminina com identidade editorial e refinamento discreto. Descubra a nova coleção.",
  openGraph: {
    title: "Zaya — Moda Feminina",
    description: "Moda feminina com identidade editorial e refinamento discreto.",
    siteName: "Zaya",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Instruir o browser a tratar o site como light mode — evita dark mode automático no mobile */}
        <meta name="color-scheme" content="light only" />
      </head>
      <body
        className={`${bodoniModa.variable} ${archivo.variable} antialiased`}
        style={{ background: "#FAFAFA", color: "#1A1A1A" }}
      >
        {children}
      </body>
    </html>
  );
}

