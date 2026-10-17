/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, ArrowRight, Banknote } from 'lucide-react';
import { Product, CartItem, Sale, AppSettings, SyncStats } from './types';
import { StorageService } from './utils/storage';
import { soundEffects } from './utils/audio';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useThemeManager } from './hooks/useThemeManager';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useFullscreen } from './hooks/useFullscreen';

import { TopBar } from './components/TopBar';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { CatalogueView } from './components/CatalogueView';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ProductsAdminView } from './components/ProductsAdminView';
import { DashboardView } from './components/DashboardView';
import { SettingsModal } from './components/SettingsModal';
import { SyncIndicator } from './components/SyncIndicator';

export default function App() {
  // App persistent states
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [sales, setSales] = useState<Sale[]>(() => StorageService.getSales());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [cart, setCart] = useState<CartItem[]>([]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('vente');

  // Modals & Drawers state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [prefilledCheckoutAmount, setPrefilledCheckoutAmount] = useState<number | undefined>(undefined);
  const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [currentReceiptSale, setCurrentReceiptSale] = useState<Sale | null>(null);

  // Sync state & network
  const isOnline = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number | null>(() => StorageService.getLastSync());
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(() => StorageService.getSyncQueue().length);

  // Notifications toast state
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle?: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Theme, PWA & Fullscreen hooks
  const { isDark } = useThemeManager(settings.themeMode, settings.palette, settings.fontSize);
  const { isInstallable, install: installPWA } = usePWAInstall();
  const { isFullscreen, toggleFullscreen, isSupported: isFullscreenSupported } = useFullscreen();

  const showToast = useCallback((title: string, subtitle?: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ title, subtitle, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Sync stats aggregated
  const syncStats: SyncStats = {
    isOnline,
    pendingCount: pendingQueueCount,
    syncedCount: sales.filter((s) => s.synced).length,
    lastSyncTimestamp,
    syncStatus,
  };

  // Perform background or manual sync
  const handleManualSync = useCallback(async () => {
    if (!isOnline) {
      showToast('Mode Hors-Ligne', 'La synchronisation nécessite une connexion Internet.', 'info');
      return;
    }

    setSyncStatus('syncing');
    try {
      const result = await StorageService.processSyncQueue();
      setSales(StorageService.getSales());
      setPendingQueueCount(result.remainingCount);
      setLastSyncTimestamp(Date.now());
      setSyncStatus('synced');
      soundEffects.cashSuccess(settings.hapticSound);
      showToast('Synchronisation Réussie', `${result.syncedCount} vente(s) transmise(s) avec succès.`, 'success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch {
      setSyncStatus('error');
      showToast('Erreur de Synchronisation', 'Impossible de contacter le serveur distant.', 'error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, [isOnline, settings.hapticSound, showToast]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingQueueCount > 0 && settings.autoSync) {
      handleManualSync();
    }
  }, [isOnline, pendingQueueCount, settings.autoSync, handleManualSync]);

  // Cart operations (Memoized with useCallback for peak mobile responsiveness)
  const handleAddToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const handleUpdateCartQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  }, []);

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Checkout flow
  const handleStartCheckout = useCallback((prefilledAmount?: number) => {
    if (cart.length === 0) {
      showToast('Panier vide', 'Veuillez sélectionner au moins une boisson.', 'error');
      return;
    }
    setPrefilledCheckoutAmount(prefilledAmount);
    setIsCartMobileOpen(false);
    setIsCheckoutOpen(true);
  }, [cart.length, showToast]);

  const handleCompleteSale = useCallback((sale: Sale) => {
    const { sale: savedSale, queueCount } = StorageService.recordSale(sale, isOnline);
    setSales(StorageService.getSales());
    setProducts(StorageService.getProducts());
    setPendingQueueCount(queueCount);
    setCart([]);
    setIsCheckoutOpen(false);

    showToast(
      'Vente validée !',
      `${sale.total.toLocaleString('fr-FR')} ${settings.currency} · Monnaie : ${sale.changeGiven.toLocaleString('fr-FR')} ${settings.currency}`,
      'success'
    );

    // Open receipt modal
    setCurrentReceiptSale(savedSale);
    setIsReceiptOpen(true);
  }, [isOnline, settings.currency, showToast]);

  // Product management operations
  const handleAddProduct = useCallback((newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      StorageService.saveProducts(updated);
      return updated;
    });
    showToast('Produit ajouté', `${newProduct.name} a été ajouté au catalogue.`, 'success');
  }, [showToast]);

  const handleUpdateProduct = useCallback((updatedProduct: Product) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      StorageService.saveProducts(updated);
      return updated;
    });
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updatedProduct.id ? { ...item, product: updatedProduct } : item
      )
    );
    showToast('Produit mis à jour', `${updatedProduct.name} a été modifié avec succès.`, 'success');
  }, [showToast]);

  const handleDeleteProduct = useCallback((productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      StorageService.saveProducts(updated);
      return updated;
    });
    showToast('Produit supprimé', 'Le produit a été retiré.', 'info');
  }, [showToast]);

  // Settings operations
  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    showToast('Paramètres mis à jour', 'Vos préférences ont été enregistrées.', 'success');
  }, [showToast]);

  const handleToggleTheme = useCallback(() => {
    const nextMode = isDark ? 'light' : 'dark';
    handleSaveSettings({ ...settings, themeMode: nextMode });
  }, [isDark, settings, handleSaveSettings]);

  // Export and backup handlers
  const handleExportCsv = useCallback(() => {
    const headers = ['Ticket', 'Date', 'Heure', 'Articles', 'Total_FCFA', 'Mode_Paiement', 'Caissier', 'Synchronise'];
    const rows = sales.map((s) => [
      s.receiptNumber,
      s.dateFormatted,
      s.timeFormatted,
      `"${s.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}"`,
      s.total,
      s.paymentMethod,
      s.cashierName,
      s.synced ? 'OUI' : 'NON',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ventes_CaissePro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export réussi', 'Fichier CSV généré avec succès.', 'success');
  }, [sales, showToast]);

  const handleExportBackup = useCallback(() => {
    const jsonStr = StorageService.exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CaissePro_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Sauvegarde prête', 'Fichier JSON téléchargé.', 'success');
  }, [showToast]);

  const handleImportBackup = useCallback((jsonStr: string) => {
    const success = StorageService.importDatabaseBackup(jsonStr);
    if (success) {
      setProducts(StorageService.getProducts());
      setSales(StorageService.getSales());
      setSettings(StorageService.getSettings());
      showToast('Base de données restaurée', 'Tous vos produits et ventes sont rechargés.', 'success');
    }
    return success;
  }, [showToast]);

  // Desktop / PC Keyboard shortcuts (1-4 or F1-F4 for tabs, Esc for modal closing, Enter to checkout)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);

      if (e.key === 'Escape') {
        if (isCheckoutOpen) setIsCheckoutOpen(false);
        else if (isCartMobileOpen) setIsCartMobileOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isReceiptOpen) setIsReceiptOpen(false);
        return;
      }

      if (isInput) return;

      if (e.key === '1' || e.key === 'F1') {
        e.preventDefault();
        soundEffects.tap(settings.hapticSound);
        setActiveTab('vente');
      } else if (e.key === '2' || e.key === 'F2') {
        e.preventDefault();
        soundEffects.tap(settings.hapticSound);
        setActiveTab('produits');
      } else if (e.key === '3' || e.key === 'F3') {
        e.preventDefault();
        soundEffects.tap(settings.hapticSound);
        setActiveTab('historique');
      } else if (e.key === '4' || e.key === 'F4') {
        e.preventDefault();
        soundEffects.tap(settings.hapticSound);
        setActiveTab('parametres');
      } else if (e.key === 'Enter' && activeTab === 'vente' && cart.length > 0 && !isCheckoutOpen) {
        e.preventDefault();
        handleStartCheckout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTab, 
    cart.length, 
    handleStartCheckout, 
    isCartMobileOpen, 
    isCheckoutOpen, 
    isReceiptOpen, 
    isSettingsOpen, 
    settings.hapticSound
  ]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      {/* Background ambient lighting - Desktop only */}
      <div 
        aria-hidden="true"
        className="hidden md:block fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none -z-10 transition-colors"
        style={{ backgroundColor: 'var(--accent)', opacity: isDark ? 0.08 : 0.04 }}
      />
      <div 
        aria-hidden="true"
        className="hidden md:block fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none -z-10 transition-colors"
        style={{ backgroundColor: 'var(--accent-light)', opacity: isDark ? 0.06 : 0.03 }}
      />

      {/* Top Application Bar */}
      <TopBar
        settings={settings}
        syncStats={syncStats}
        isDark={isDark}
        cartItemCount={cartItemCount}
        cartTotal={cartTotal}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={handleToggleTheme}
        onOpenCartMobile={() => setIsCartMobileOpen(true)}
        onManualSync={handleManualSync}
        onInstallPWA={installPWA}
        isInstallable={isInstallable}
      />

      {/* Main Responsive Content (Mobile, Tablet & PC tailored) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Navigation Tabs (Top strip on Tablet/PC, bottom bar on Mobile) */}
        <NavigationTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          hapticEnabled={settings.hapticSound}
          cartBadgeCount={cartItemCount}
        />

        {/* Tab 1: Caisse & Vente (Dual pane split on Tablet/PC, single on Mobile) */}
        {activeTab === 'vente' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-start">
            {/* Left: Drinks Catalogue */}
            <div className="md:col-span-7 xl:col-span-8">
              <CatalogueView
                products={products}
                cart={cart}
                currency={settings.currency}
                hapticEnabled={settings.hapticSound}
                onAddToCart={handleAddToCart}
                onOpenAddProductModal={() => setActiveTab('produits')}
              />
            </div>

            {/* Right: Persistent Cart on Tablet & PC */}
            <div className="hidden md:block md:col-span-5 xl:col-span-4">
              <CartSidebar
                cart={cart}
                currency={settings.currency}
                hapticEnabled={settings.hapticSound}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onCheckout={handleStartCheckout}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Produits & Stocks */}
        {activeTab === 'produits' && (
          <ProductsAdminView
            products={products}
            currency={settings.currency}
            hapticEnabled={settings.hapticSound}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {/* Tab 3: Historique & Stats */}
        {activeTab === 'historique' && (
          <DashboardView
            sales={sales}
            settings={settings}
            currency={settings.currency}
            hapticEnabled={settings.hapticSound}
            onShowReceipt={(sale) => {
              setCurrentReceiptSale(sale);
              setIsReceiptOpen(true);
            }}
            onExportCsv={handleExportCsv}
            onExportBackup={handleExportBackup}
          />
        )}

        {/* Tab 4: Paramètres & Sync (Direct inline access) */}
        {activeTab === 'parametres' && (
          <div className="max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Console de Personnalisation & Paramètres
              </h2>
              <p className="text-xs text-zinc-500 mb-4">
                Configurez le nom de votre établissement, le thème, les couleurs d'accentuation et les tickets.
              </p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="py-3 px-6 rounded-xl btn-accent font-bold text-sm shadow-md inline-flex items-center gap-2 active:scale-95 transition-all"
              >
                Ouvrir les Paramètres
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Offline & Sync Indicator */}
      <SyncIndicator
        syncStats={syncStats}
        hapticEnabled={settings.hapticSound}
        onManualSync={handleManualSync}
      />

      {/* Mobile Floating Quick-Checkout Bar (Ergonomic Phone Thumb-Zone, hidden on Tablet/PC) */}
      {cartItemCount > 0 && activeTab === 'vente' && (
        <div className="md:hidden fixed bottom-18 left-3 right-3 z-30 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between p-2 pl-3.5 rounded-2xl bg-zinc-900/95 dark:bg-zinc-900/95 text-white border border-zinc-700 shadow-2xl backdrop-blur-md">
            {/* Tap left part to inspect cart */}
            <div
              onClick={() => {
                soundEffects.tap(settings.hapticSound);
                setIsCartMobileOpen(true);
              }}
              role="button"
              tabIndex={0}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none active:opacity-80"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <span className="absolute -top-1.5 -right-2 px-1 min-w-[16px] h-4 rounded-full bg-rose-600 text-[10px] font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              </div>
              <div className="min-w-0 pr-2">
                <div className="text-xs font-mono font-extrabold text-accent leading-tight">
                  {cartTotal.toLocaleString('fr-FR')} {settings.currency}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {cartItemCount} boisson{cartItemCount > 1 ? 's' : ''} (Voir détails)
                </div>
              </div>
            </div>

            {/* Direct Instant Checkout Button */}
            <button
              onClick={() => {
                soundEffects.tap(settings.hapticSound);
                handleStartCheckout();
              }}
              className="btn-accent px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 shrink-0 min-h-[44px]"
            >
              <Banknote className="w-4 h-4" />
              <span>ENCAISSER</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Cart */}
      {isCartMobileOpen && (
        <CartSidebar
          cart={cart}
          currency={settings.currency}
          hapticEnabled={settings.hapticSound}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onCheckout={handleStartCheckout}
          isMobileDrawer={true}
          onCloseMobileDrawer={() => setIsCartMobileOpen(false)}
        />
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cart}
        currency={settings.currency}
        cashierName={settings.cashierName}
        hapticEnabled={settings.hapticSound}
        prefilledAmount={prefilledCheckoutAmount}
        onClose={() => setIsCheckoutOpen(false)}
        onCompleteSale={handleCompleteSale}
        onShowReceipt={(sale) => {
          setCurrentReceiptSale(sale);
          setIsReceiptOpen(true);
        }}
      />

      {/* Thermal Receipt Modal */}
      <ReceiptModal
        sale={currentReceiptSale}
        settings={settings}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen || activeTab === 'parametres'}
        settings={settings}
        syncStats={syncStats}
        onClose={() => {
          setIsSettingsOpen(false);
          if (activeTab === 'parametres') setActiveTab('vente');
        }}
        onSaveSettings={handleSaveSettings}
        onManualSync={handleManualSync}
        onClearCache={() => StorageService.clearAppCache()}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm rounded-2xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-3.5 px-4 shadow-2xl border border-accent-subtle backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-top-3 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight truncate">{toastMessage.title}</p>
            {toastMessage.subtitle && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{toastMessage.subtitle}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
