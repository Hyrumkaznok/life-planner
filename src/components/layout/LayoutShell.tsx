'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

const AUTH_PATHS = ['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha'];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex h-[100dvh] overflow-hidden">
        <Sidebar />
        {/* pb-14 no mobile reserva espaço para o bottom nav fixo */}
        <main className="flex-1 overflow-y-auto pb-14 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </>
  );
}
