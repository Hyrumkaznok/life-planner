import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { ThemeApplier } from "@/components/layout/ThemeApplier";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "LifeBook",
  description: "Seu planejador de vida pessoal",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover", // safe-area no iPhone
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased bg-[#F8FAFC] dark:bg-[#09090B] text-[#0F172A] dark:text-[#FAFAFA]">
        <AuthProvider>
          <AppProvider>
            <ThemeApplier />
            <LayoutShell>{children}</LayoutShell>
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
        </AuthProvider>
      </body>
    </html>
  );
}
