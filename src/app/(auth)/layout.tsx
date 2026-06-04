import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-bg min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link href="/login" className="flex items-center gap-2.5 mb-8 group">
        <img src="/icon.svg" alt="LifeBook" className="w-9 h-9 rounded-xl shadow-sm" />
        <span className="text-[var(--foreground)] font-semibold text-lg tracking-tight">
          LifeBook
        </span>
      </Link>
      {children}
    </div>
  );
}
