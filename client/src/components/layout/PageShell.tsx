import type { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function PageShell({ title, subtitle, action, children }: PageShellProps) {
  return (
    <div className="app-page w-full">
      <header className="page-header">
        <div className="min-w-0 flex-1">
          <h1 className="page-title">{title}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </div>
  );
}
