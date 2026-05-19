import { NavLink } from 'react-router-dom';
import { appNavLinks, NavIcons } from './navConfig';

export default function MobileNav() {
  return (
    <nav
      className="no-print fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-[#0c0f14]/95 backdrop-blur-xl lg:hidden"
      aria-label="Main navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {appNavLinks.map(({ to, label, icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`
              }
            >
              {NavIcons[icon]}
              <span>{label.split(' ')[0]}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
