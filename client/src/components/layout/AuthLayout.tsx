import type { ReactNode } from 'react';
import Logo from '../ui/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="app-mesh-bg flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between border-r border-slate-800/60 bg-slate-900/30 p-12 lg:flex">
        <Logo to="/" size="lg" />
        <div>
          <h2 className="text-3xl font-bold leading-tight text-white">
            Proposals that win clients.
          </h2>
          <p className="mt-4 max-w-md text-slate-400">
            Turn briefs into polished proposals with AI, share public links, and collect deposits
            with Stripe.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-500">
            <li className="flex items-center gap-2">
              <span className="text-brand-400">✓</span> Structured scope & timeline
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-400">✓</span> Usage-based free tier
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-400">✓</span> Pro payment links
            </li>
          </ul>
        </div>
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} BriefAI</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="card w-full max-w-md border-slate-700/50">
          <Logo to="/" className="lg:hidden" />
          <h1 className="mt-6 text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
