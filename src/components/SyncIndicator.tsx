import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SyncStats } from '../types';
import { soundEffects } from '../utils/audio';

interface SyncIndicatorProps {
  syncStats: SyncStats;
  hapticEnabled: boolean;
  onManualSync: () => void;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  syncStats,
  hapticEnabled,
  onManualSync,
}) => {
  if (syncStats.isOnline && syncStats.pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 lg:bottom-5 left-4 z-40 max-w-sm flex items-center gap-2.5 p-2.5 pl-3 rounded-2xl bg-zinc-950/95 border border-amber-500/40 text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
      <div className="shrink-0">
        {!syncStats.isOnline ? (
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <WifiOff className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <RefreshCw className={`w-4 h-4 ${syncStats.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-bold text-zinc-100 truncate leading-tight">
          {!syncStats.isOnline ? 'Mode Hors-Ligne Actif' : `${syncStats.pendingCount} vente(s) à synchroniser`}
        </p>
        <p className="text-[10px] text-zinc-400 truncate">
          {!syncStats.isOnline
            ? 'Données enregistrées en local en toute sécurité'
            : 'En attente de transmission cloud'}
        </p>
      </div>

      {syncStats.isOnline && syncStats.pendingCount > 0 && (
        <button
          onClick={() => {
            soundEffects.tap(hapticEnabled);
            onManualSync();
          }}
          disabled={syncStats.syncStatus === 'syncing'}
          className="shrink-0 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-[11px] transition-colors shadow-sm"
        >
          {syncStats.syncStatus === 'syncing' ? 'Sync...' : 'Synchroniser'}
        </button>
      )}
    </div>
  );
};
