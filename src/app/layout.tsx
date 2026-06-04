import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeApplier } from "@/components/layout/ThemeApplier";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Life Planner",
  description: "Seu planejador de vida pessoal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased bg-[#F8FAFC] dark:bg-[#09090B] text-[#0F172A] dark:text-[#FAFAFA]">
        <AppProvider>
          <ThemeApplier />
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
          <Toaster
            richColors
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05), 0 12px 40px rgba(0,0,0,0.08)",
                fontFamily: "Inter Variable, Inter, system-ui, sans-serif",
                fontSize: "13px",
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}
