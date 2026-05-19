import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../ui/ConfirmDialog';
import Logo from '../ui/Logo';
import AppSidebar from './AppSidebar';
import MobileNav from './MobileNav';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div className="app-layout-root app-shell-bg">
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out?"
        message="You will need to sign in again to access your briefs and proposals."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        variant="danger"
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => !loggingOut && setShowLogoutConfirm(false)}
      />

      <AppSidebar onLogout={() => setShowLogoutConfirm(true)} />

      <div className="app-main-panel">
        <header className="glass-nav no-print shrink-0 flex items-center justify-between gap-3 border-b border-slate-800/50 px-4 py-3 lg:hidden">
          <Logo to="/dashboard" size="sm" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm text-slate-400">{user?.name}</span>
            <button
              type="button"
              className="btn-ghost shrink-0 text-xs text-slate-500 hover:text-slate-300"
              onClick={() => setShowLogoutConfirm(true)}
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="app-main-scroll">
          <main className="app-main-inner">
            <Outlet />
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
