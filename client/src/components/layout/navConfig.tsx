import type { ReactNode } from 'react';

function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center text-current" aria-hidden>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
}

export const NavIcons = {
  dashboard: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Icon>
  ),
  brief: (
    <Icon>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  ),
  proposals: (
    <Icon>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </Icon>
  ),
  settings: (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </Icon>
  ),
  logout: (
    <Icon>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </Icon>
  ),
};

export type NavIconKey = keyof typeof NavIcons;

export const appNavLinks: { to: string; label: string; icon: NavIconKey; end?: boolean }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/briefs/new', label: 'New brief', icon: 'brief' },
  { to: '/proposals', label: 'Proposals', icon: 'proposals' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];
