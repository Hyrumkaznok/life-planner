interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="relative flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 md:px-8 md:py-5 bg-[var(--card)] dark:bg-[var(--secondary)] border-b border-[var(--border)] flex-wrap overflow-hidden">
      {/* Linha accent no topo */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent dark:via-violet-500/60" />

      <div className="min-w-0">
        <h1 className="text-[15px] sm:text-[17px] font-semibold tracking-tight text-gradient">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] sm:text-[13px] text-[var(--muted-foreground)] mt-0.5 font-normal hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      )}
    </div>
  );
}
