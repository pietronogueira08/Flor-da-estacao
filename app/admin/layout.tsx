import type { Metadata } from "next";
import { Bodoni_Moda, Archivo } from "next/font/google";
import "../globals.css";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminBottomBar from "@/components/admin/AdminBottomBar";
import AdminMobileHeader from "@/components/admin/AdminMobileHeader";

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
  title: "Atelier Zaya — Painel",
  description: "Painel administrativo da Zaya",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${bodoniModa.variable} ${archivo.variable} antialiased bg-branco`}
      >
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar — apenas desktop (md+) */}
          <div className="hidden md:flex">
            <AdminSidebar />
          </div>

          {/* Conteúdo principal */}
          <main className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-20 md:pb-0">
            {/* Header mobile */}
            <AdminMobileHeader />
            {children}
          </main>
        </div>

        {/* Bottom navigation bar — apenas mobile */}
        <AdminBottomBar />
      </body>
    </html>
  );
}
