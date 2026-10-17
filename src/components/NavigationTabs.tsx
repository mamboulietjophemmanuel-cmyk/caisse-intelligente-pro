import React from 'react';
import { ShoppingCart, Boxes, BarChart3, SlidersHorizontal } from 'lucide-react';
import { soundEffects } from '../utils/audio';

export type TabType = 'vente' | 'produits' | 'historique' | 'parametres';

interface NavigationTabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  hapticEnabled?: boolean;
  cartBadgeCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  hapticEnabled = true,
  cartBadgeCount = 0,
}) => {
  const tabs = [
    {
      id: 'vente' as TabType,
      label: 'Caisse & Vente',
      shortLabel: 'Vente',
      icon: ShoppingCart,
      badge: cartBadgeCount > 0 ? cartBadgeCount : undefined,
    },
    {
      id: 'produits' as TabType,
      label: 'Catalogue & Stocks',
      shortLabel: 'Produits',
      icon: Boxes,
    },
    {
      id: 'historique' as TabType,
      label: 'Historique & Stats',
      shortLabel: 'Rapports',
      icon: BarChart3,
    },
    {
      id: 'parametres' as TabType,
      label: 'Paramètres & Sync',
      shortLabel: 'Options',
      icon: SlidersHorizontal,
    },
  ];

  const handleTabClick = (tabId: TabType) => {
    soundEffects.tap(hapticEnabled);
    onSelectTab(tabId);
  };

  return (
    <>
      {/* Desktop & Tablet Navigation strip in main content */}
      <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-1.5 p-1.5 bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 mb-6 shadow-xs transition-colors">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                isActive
                  ? 'btn-accent shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              
              {/* Keyboard shortcut hint for PC / Desktop */}
              <kbd className="hidden xl:inline-block text-[10px] font-mono px-1 rounded opacity-60 bg-black/10 dark:bg-white/10 ml-0.5">
                {idx + 1}
              </kbd>

              {tab.badge && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-xs font-mono font-bold ${
                  isActive ? 'bg-black/20 text-white' : 'badge-accent'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile-First Fixed Bottom Navigation Bar (Phone thumb zone: Android & iOS) */}
      <nav 
        aria-label="Navigation mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800/80 pb-safe transition-colors"
      >
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 transition-all active:scale-90 min-h-[48px] select-none ${
                  isActive
                    ? 'text-accent font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-mono text-[10px] flex items-center justify-center shadow-sm">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] tracking-tight mt-1 whitespace-nowrap">
                  {tab.shortLabel}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-accent" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
