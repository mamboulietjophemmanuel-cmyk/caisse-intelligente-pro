import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Sun, 
  Moon, 
  Settings, 
  ShoppingBag, 
  RefreshCw,
  Sparkles,
  Download,
  Maximize,
  Minimize
} from 'lucide-react';
import { AppSettings, SyncStats } from '../types';
import { soundEffects } from '../utils/audio';

interface TopBarProps {
  settings: AppSettings;
  syncStats: SyncStats;
  isDark: boolean;
  cartItemCount: number;
  cartTotal: number;
  isFullscreen?: boolean;
  isFullscreenSupported?: boolean;
  onToggleFullscreen?: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onOpenCartMobile: () => void;
  onManualSync: () => void;
  onInstallPWA?: () => void;
  isInstallable?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  syncStats,
  isDark,
  cartItemCount,
  cartTotal,
  isFullscreen = false,
  isFullscreenSupported = true,
  onToggleFullscreen,
  onOpenSettings,
  onToggleTheme,
  onOpenCartMobile,
  onManualSync,
  onInstallPWA,
  isInstallable,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark & Icon */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl btn-accent flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate font-['Cinzel']">
              {settings.storeName || 'CAISSE INTELLIGENTE'}
            </h1>
            <p className="text-[11px] font-semibold text-accent truncate uppercase tracking-wider">
              {settings.storeSubtitle || 'PREMIUM POS'} · {settings.cashierName}
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Online / Offline & Sync Badge */}
          <button
            onClick={() => {
              soundEffects.tap(settings.hapticSound);
              onManualSync();
            }}
            title={syncStats.isOnline ? (syncStats.pendingCount > 0 ? `${syncStats.pendingCount} ventes à synchroniser` : 'En ligne - Données synchronisées') : 'Hors-ligne - Données stockées localement'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              syncStats.isOnline
                ? syncStats.pendingCount > 0
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30'
            }`}
          >
            {syncStats.syncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : syncStats.isOnline ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {syncStats.syncStatus === 'syncing'
                ? 'Sync...'
                : syncStats.isOnline
                ? syncStats.pendingCount > 0
                  ? `${syncStats.pendingCount} en attente`
                  : 'En ligne'
                : 'Hors-ligne'}
            </span>
            {syncStats.pendingCount > 0 && (
              <span className="sm:hidden px-1.5 rounded-full bg-accent text-accent-contrast font-bold text-[10px]">
                {syncStats.pendingCount}
              </span>
            )}
          </button>

          {/* Install PWA Button if available */}
          {isInstallable && onInstallPWA && (
            <button
              onClick={() => {
                soundEffects.tap(settings.hapticSound);
                onInstallPWA();
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold btn-accent transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
          )}

          {/* Fullscreen Immersive Mode Toggle (Hides Android Navigation Bar) */}
          {isFullscreenSupported && onToggleFullscreen && (
            <button
              onClick={() => {
                soundEffects.tap(settings.hapticSound);
                onToggleFullscreen();
              }}
              aria-label={isFullscreen ? 'Quitter le plein écran' : 'Activer le plein écran (Masquer barre système)'}
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran immersif (Masque triangle, rond, carré Android)'}
              className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                isFullscreen
                  ? 'btn-accent shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          )}

          {/* Quick Theme Toggle (Sun / Moon) */}
          <button
            onClick={() => {
              soundEffects.tap(settings.hapticSound);
              onToggleTheme();
            }}
            aria-label="Basculer le thème clair/sombre"
            title="Mode clair / sombre"
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-all active:scale-90"
          >
            {isDark ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => {
              soundEffects.tap(settings.hapticSound);
              onOpenSettings();
            }}
            aria-label="Paramètres de l'application"
            title="Paramètres de l'établissement et thème"
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-all active:scale-90"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mobile Cart Button Trigger (Shown on phone only; on Tablet & PC, cart is persistent on the right) */}
          <button
            onClick={() => {
              soundEffects.tap(settings.hapticSound);
              onOpenCartMobile();
            }}
            aria-label="Ouvrir le panier mobile"
            className="md:hidden relative flex items-center gap-2 px-3 py-2 rounded-xl btn-accent font-bold text-xs shadow-md active:scale-95 transition-transform min-h-[40px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="tabular-nums font-mono">
              {cartTotal.toLocaleString('fr-FR')} {settings.currency}
            </span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white font-mono text-[10px] flex items-center justify-center shadow-sm">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
