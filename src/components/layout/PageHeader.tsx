interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-8 py-5 bg-[var(--card)] dark:bg-[#18181B] border-b border-[var(--border)]">
      <div>
        <h1 className="text-[17px] font-semibold text-[var(--foreground)] tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5 font-normal">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
