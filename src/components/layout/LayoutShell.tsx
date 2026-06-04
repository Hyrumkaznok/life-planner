'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

const AUTH_PATHS = ['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha'];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
