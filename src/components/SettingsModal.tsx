import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  Sun, 
  Moon, 
  Laptop, 
  Volume2, 
  VolumeX, 
  Type, 
  RefreshCw, 
  Trash, 
  Download, 
  Upload, 
  Check, 
  ShieldCheck, 
  Wifi, 
  WifiOff,
  Store,
  Sparkles,
  Maximize
} from 'lucide-react';
import { AppSettings, ThemeMode, ThemePalette, FontSizePreference, SyncStats } from '../types';
import { soundEffects } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  syncStats: SyncStats;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose: () => void;
  onSaveSettings: (settings: AppSettings) => void;
  onManualSync: () => void;
  onClearCache: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  syncStats,
  isFullscreen = false,
  onToggleFullscreen,
  onClose,
  onSaveSettings,
  onManualSync,
  onClearCache,
  onExportBackup,
  onImportBackup,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [importStatus, setImportStatus] = useState<string>('');

  // Keep localSettings in sync if settings update from outside
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleUpdate = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    soundEffects.tap(localSettings.hapticSound);
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportBackup(content);
        if (success) {
          setImportStatus('Sauvegarde restaurée avec succès !');
          setTimeout(() => setImportStatus(''), 3000);
        } else {
          setImportStatus('Erreur : Fichier JSON invalide.');
          setTimeout(() => setImportStatus(''), 4000);
        }
      }
    };
    reader.readAsText(file);
  };

  const palettes: { id: ThemePalette; label: string; color: string; desc: string }[] = [
    { id: 'gold', label: 'Or Royal', color: '#D4AF37', desc: 'Prestige & Ambre' },
    { id: 'emerald', label: 'Émeraude', color: '#10B981', desc: 'Nature & Fraîcheur' },
    { id: 'sapphire', label: 'Saphir', color: '#3B82F6', desc: 'Océan & Moderne' },
    { id: 'ruby', label: 'Rubis', color: '#E11D48', desc: 'Velours & Passion' },
    { id: 'obsidian', label: 'Titane', color: '#64748B', desc: 'Pur & Minimaliste' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full sm:max-w-xl max-h-[92dvh] sm:max-h-[88vh] bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl relative flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile touch indicator */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header - Fixed at top */}
        <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl btn-accent flex items-center justify-center font-bold shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Paramètres & Préférences
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                Personnalisation de l'enseigne, thème et synchronisation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
          {/* Section 1: Nom du Bistro & Enseigne (Dédiée et en avant) */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-accent-subtle shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span>Identité du Bistro & Enseigne</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">Affiché sur l'en-tête et les tickets</span>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                Nom du Bistro / Bar / Établissement *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={localSettings.storeName}
                  onChange={(e) => handleUpdate('storeName', e.target.value)}
                  placeholder="Ex : OYOMBI LOUNGE & BAR, BISTRO DU PORT..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-['Cinzel'] tracking-wide"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Sous-titre / Spécialité</label>
                <input
                  type="text"
                  value={localSettings.storeSubtitle}
                  onChange={(e) => handleUpdate('storeSubtitle', e.target.value)}
                  placeholder="Ex : Premium Bar & Lounge"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Téléphone de contact</label>
                <input
                  type="text"
                  value={localSettings.storePhone}
                  onChange={(e) => handleUpdate('storePhone', e.target.value)}
                  placeholder="Ex : +241 07 45 88 92"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Adresse physique</label>
                <input
                  type="text"
                  value={localSettings.storeAddress}
                  onChange={(e) => handleUpdate('storeAddress', e.target.value)}
                  placeholder="Ex : Boulevard Circulaire..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Nom du caissier / Poste</label>
                <input
                  type="text"
                  value={localSettings.cashierName}
                  onChange={(e) => handleUpdate('cashierName', e.target.value)}
                  placeholder="Ex : Caisse Principale"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            {/* Live brand preview snippet */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Aperçu en direct :</span>
              <span className="font-['Cinzel'] font-bold text-accent">
                {localSettings.storeName || 'Mon Bistro'} · {localSettings.storeSubtitle || 'POS'}
              </span>
            </div>
          </div>

          {/* Section 2: Thème et Mode Sombre */}
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-2.5">
              Mode d'Affichage & Thème
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleUpdate('themeMode', 'system')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  localSettings.themeMode === 'system'
                    ? 'btn-accent font-bold shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Laptop className="w-4 h-4 mb-1" />
                <span>Système (Auto)</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate('themeMode', 'dark')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  localSettings.themeMode === 'dark'
                    ? 'btn-accent font-bold shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Moon className="w-4 h-4 mb-1" />
                <span>Sombre Royal</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate('themeMode', 'light')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  localSettings.themeMode === 'light'
                    ? 'btn-accent font-bold shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Sun className="w-4 h-4 mb-1" />
                <span>Clair Platine</span>
              </button>
            </div>
          </div>

          {/* Section 3: Nuancier & Palette d'accent */}
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-2.5">
              Couleur d'Accentuation
            </span>
            <div className="grid grid-cols-5 gap-2">
              {palettes.map((pal) => {
                const isSelected = localSettings.palette === pal.id;
                return (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => handleUpdate('palette', pal.id)}
                    className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-accent bg-accent-subtle/20 shadow-md ring-2 ring-accent'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full mb-1.5 flex items-center justify-center text-white shadow-sm transition-transform"
                      style={{ backgroundColor: pal.color }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate w-full">
                      {pal.label}
                    </span>
                    <span className="text-[9px] text-zinc-500 truncate w-full mt-0.5">
                      {pal.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Ergonomie & Accessibilité */}
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-2.5">
              Accessibilité & Audio
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Font Scaling */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
                  <Type className="w-3.5 h-3.5 text-accent" />
                  <span>Taille du texte / Densité</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['compact', 'normal', 'comfortable'] as FontSizePreference[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleUpdate('fontSize', size)}
                      className={`py-1.5 px-2 rounded-lg text-xs capitalize transition-all ${
                        localSettings.fontSize === size
                          ? 'btn-accent font-bold'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {size === 'compact' ? 'Compact' : size === 'normal' ? 'Normal' : 'Confort'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Haptic / Sound Toggle */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    {localSettings.hapticSound ? (
                      <Volume2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-zinc-400" />
                    )}
                    <span>Bips & Carillon Caisse</span>
                  </span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Effets sonores tactiles Web Audio
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdate('hapticSound', !localSettings.hapticSound)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    localSettings.hapticSound ? 'bg-accent' : 'bg-zinc-300 dark:bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white dark:bg-zinc-950 transition-transform ${
                      localSettings.hapticSound ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Fullscreen & Android Navigation Bar Setting */}
              {onToggleFullscreen && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Maximize className="w-4 h-4 text-accent" />
                      <span>Mode Immersif & Plein Écran (Masquer boutons Android)</span>
                    </span>
                    <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Masque le triangle, le rond et le carré de navigation du bas sur téléphone pour maximiser l'écran tactile
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.tap(localSettings.hapticSound);
                      onToggleFullscreen();
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0 ml-2 min-h-[38px] ${
                      isFullscreen 
                        ? 'btn-accent shadow-sm' 
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:btn-accent'
                    }`}
                  >
                    {isFullscreen ? 'Plein écran actif' : 'Activer'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Support Hors-Ligne & Contournement Cache */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Stockage Hors-Ligne & Gestion du Cache</span>
            </span>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                {syncStats.isOnline ? (
                  <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <WifiOff className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span className="text-zinc-700 dark:text-zinc-300">
                  {syncStats.isOnline ? 'Connecté au réseau' : 'Mode hors-ligne actif (données stockées localement)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                <span>{syncStats.pendingCount} en attente</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={onManualSync}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Synchroniser Maintenant</span>
              </button>

              <button
                type="button"
                onClick={onClearCache}
                title="Supprime les caches HTTP et recharge l'application pour contourner les blocages du navigateur"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold text-accent border border-zinc-300 dark:border-zinc-700 transition-colors"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>Purger le Cache Navigateur</span>
              </button>
            </div>

            {/* Backup Export / Restore */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={onExportBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter JSON</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-medium cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Importer JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>

              {importStatus && (
                <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold ml-2">
                  {importStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal close CTA - Sticky at bottom */}
        <div className="shrink-0 p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-sm flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl btn-accent font-bold text-xs shadow-md transition-all active:scale-95 min-h-[44px] flex items-center justify-center"
          >
            Fermer les paramètres
          </button>
        </div>
      </div>
    </div>
  );
};
