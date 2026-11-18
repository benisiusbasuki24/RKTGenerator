import { Download, LogIn, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../firebase';

export type AppTab = 'rkt' | 'rkas' | 'renstra' | 'print' | 'identity';

interface HeaderBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onExportXlsx: () => void;
  itemCount: number;
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

const NAV_ITEMS: { id: AppTab; label: string }[] = [
  { id: 'rkt', label: 'RKT' },
  { id: 'rkas', label: 'RKAS' },
  { id: 'renstra', label: 'RENSTRA' },
  { id: 'print', label: 'Pratinjau Cetak' },
  { id: 'identity', label: 'Identitas Sekolah' },
];

export function HeaderBar({
  activeTab,
  onTabChange,
  onExportXlsx,
  itemCount,
  user,
  authLoading,
  onSignIn,
  onSignOut,
}: HeaderBarProps) {
  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('rkas');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-sm"
        >
          RKT-RKAS Generator
        </a>

        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-6 h-full"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`relative h-full inline-flex items-center text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  isActive
                    ? 'text-teal-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-teal-700"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onExportXlsx}
            disabled={itemCount === 0}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-700 min-h-[40px]"
          >
            <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Unduh Excel</span>
          </button>

          {/* Auth Button / Profile */}
          {authLoading ? (
            <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-slate-600" />
              )}
              <span className="hidden xl:inline text-xs font-medium text-slate-800 max-w-[120px] truncate">
                {user.displayName || user.email}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                <ShieldCheck className="w-3 h-3" />
                Sync
              </span>
              <button
                type="button"
                onClick={onSignOut}
                title="Keluar (Sign Out)"
                className="p-1 text-slate-500 hover:text-red-700 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <LogIn className="w-4 h-4 text-teal-700" />
              <span>Masuk Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation strip */}
      <nav
        aria-label="Navigasi seluler"
        className="flex md:hidden items-center gap-4 px-4 py-2 border-t border-slate-100 overflow-x-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`px-2 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 min-h-[36px] ${
                isActive
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
