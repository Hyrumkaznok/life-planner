interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 md:px-8 md:py-5 bg-[var(--card)] dark:bg-[#18181B] border-b border-[var(--border)] flex-wrap">
      <div className="min-w-0">
        <h1 className="text-[15px] sm:text-[17px] font-semibold text-[var(--foreground)] tracking-tight">
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
