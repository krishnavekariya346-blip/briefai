import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../ui/Logo';
import { appNavLinks, NavIcons } from './navConfig';

interface AppSidebarProps {
  onLogout: () => void;
}

export default function AppSidebar({ onLogout }: AppSidebarProps) {
  const { user } = useAuth();
  const limit = user?.freeProposalLimit ?? 3;
  const used = user?.usageThisMonth ?? 0;
  const isPro = user?.plan === 'pro';
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="app-sidebar no-print" aria-label="Sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-brand">
          <Logo to="/dashboard" />
          <p className="sidebar-tagline">Turn client briefs into winning proposals</p>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="sidebar-nav-label">Menu</p>
          <ul className="mt-2 flex flex-col gap-1">
            {appNavLinks.map(({ to, label, icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
                  }
                >
                  {NavIcons[icon]}
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-profile-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-sm font-semibold text-brand-300">
              {initials || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
            <span className="text-xs capitalize text-slate-400">
              {user?.plan} plan
              {!isPro && ` · ${used}/${limit}`}
            </span>
            {!isPro && (
              <Link
                to="/settings"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300"
              >
                Upgrade
              </Link>
            )}
          </div>

          {isPro && (
            <Link
              to="/settings"
              className="mt-3 block text-center text-xs font-medium text-slate-500 hover:text-slate-300"
            >
              Manage billing
            </Link>
          )}

          <button
            type="button"
            className="btn-ghost mt-3 w-full justify-center text-red-400/90 hover:bg-red-500/10 hover:text-red-400"
            onClick={onLogout}
          >
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
