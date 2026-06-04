import Link from 'next/link';
import { Layers } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-bg min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link href="/login" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-9 h-9 rounded-xl bg-[var(--foreground)] flex items-center justify-center shadow-sm">
          <Layers size={16} className="text-[var(--background)]" strokeWidth={1.5} />
        </div>
        <span className="text-[var(--foreground)] font-semibold text-lg tracking-tight">
          Life Planner
        </span>
      </Link>
      {children}
    </div>
  );
}
