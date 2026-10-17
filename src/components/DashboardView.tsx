import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Download, 
  CheckCircle2,
  Clock,
  CreditCard
} from 'lucide-react';
import { Sale, AppSettings } from '../types';
import { soundEffects } from '../utils/audio';

interface DashboardViewProps {
  sales: Sale[];
  settings: AppSettings;
  currency: string;
  hapticEnabled: boolean;
  onShowReceipt: (sale: Sale) => void;
  onExportCsv: () => void;
  onExportBackup: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sales,
  settings,
  currency,
  hapticEnabled,
  onShowReceipt,
  onExportCsv,
  onExportBackup,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'all' | 'pending'>('today');
  const [expandedSaleIds, setExpandedSaleIds] = useState<Record<string, boolean>>({});

  const todayStr = new Date().toLocaleDateString('fr-FR');

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (filterPeriod === 'today') return s.dateFormatted === todayStr;
      if (filterPeriod === 'pending') return !s.synced;
      return true;
    });
  }, [sales, filterPeriod, todayStr]);

  // KPIs
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalSalesCount = filteredSales.length;
  const averageBasket = totalSalesCount > 0 ? Math.round(totalRevenue / totalSalesCount) : 0;

  const cashTotal = filteredSales
    .filter((s) => s.paymentMethod === 'CASH')
    .reduce((acc, s) => acc + s.total, 0);

  const mobileMoneyTotal = filteredSales
    .filter((s) => s.paymentMethod === 'MOBILE_MONEY')
    .reduce((acc, s) => acc + s.total, 0);

  const toggleDetails = (saleId: string) => {
    soundEffects.tap(hapticEnabled);
    setExpandedSaleIds((prev) => ({
      ...prev,
      [saleId]: !prev[saleId],
    }));
  };

  return (
    <div className="dashboard-container space-y-4 sm:space-y-6">
      {/* Dashboard Top Header - Responsive PC, Tablet, Mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900/60 p-3.5 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs gpu-accelerated">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            <span>Tableau de Bord & Performance</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Suivi des encaissements et synchronisation comptable
          </p>
        </div>

        {/* Export buttons - Responsive touch targets */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEffects.tap(hapticEnabled);
              onExportCsv();
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition-all active:scale-95 min-h-[42px]"
            title="Exporter en fichier CSV pour Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              soundEffects.tap(hapticEnabled);
              onExportBackup();
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl btn-accent font-bold text-xs transition-all shadow-sm active:scale-95 min-h-[42px]"
            title="Télécharger la sauvegarde complète"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sauvegarde</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (2 columns on Mobile, 2 on Tablet, 4 columns on PC) */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 gpu-accelerated">
        {/* Total Revenue */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-accent-subtle bg-accent-subtle/10 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-accent font-semibold mb-2">
            <span className="truncate">Chiffre d'Affaires</span>
            <DollarSign className="w-4 h-4 shrink-0" />
          </div>
          <div className="flex items-baseline flex-wrap gap-x-1">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight tabular-nums whitespace-nowrap">
              {totalRevenue.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-accent whitespace-nowrap">{currency}</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 truncate">
            {filterPeriod === 'today' ? "Aujourd'hui" : 'Total cumulé'}
          </p>
        </div>

        {/* Number of Sales */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-blue-500 font-semibold mb-2">
            <span className="truncate">Transactions</span>
            <Receipt className="w-4 h-4 shrink-0" />
          </div>
          <div className="flex items-baseline flex-wrap gap-x-1">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums whitespace-nowrap">
              {totalSalesCount}
            </span>
            <span className="text-xs text-zinc-500 whitespace-nowrap">ventes</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 truncate">
            {filteredSales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0)} articles servis
          </p>
        </div>

        {/* Average Basket */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-500 font-semibold mb-2">
            <span className="truncate">Panier Moyen</span>
            <TrendingUp className="w-4 h-4 shrink-0" />
          </div>
          <div className="flex items-baseline flex-wrap gap-x-1">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums whitespace-nowrap">
              {averageBasket.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-emerald-500 whitespace-nowrap">{currency}</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 truncate">
            Par commande client
          </p>
        </div>

        {/* Payment Split - Perfectly structured and aligned on mobile, tablet & PC */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-500 font-semibold mb-2">
            <span className="truncate">Répartition Règlements</span>
            <CreditCard className="w-4 h-4 shrink-0 text-amber-500" />
          </div>

          <div className="space-y-1.5 my-auto">
            {/* Espèces row */}
            <div className="p-1.5 sm:p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
                Espèces
              </span>
              <div className="font-mono tabular-nums text-right shrink-0 whitespace-nowrap">
                <span className="text-xs sm:text-sm font-extrabold text-accent">
                  {cashTotal.toLocaleString('fr-FR')}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 ml-1">{currency}</span>
              </div>
            </div>

            {/* Mobile Money row */}
            <div className="p-1.5 sm:p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
                M-Money
              </span>
              <div className="font-mono tabular-nums text-right shrink-0 whitespace-nowrap">
                <span className="text-xs sm:text-sm font-extrabold text-blue-500">
                  {mobileMoneyTotal.toLocaleString('fr-FR')}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 ml-1">{currency}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 truncate">
            Sécurisé et tracé
          </p>
        </div>
      </div>

      {/* Filter Tabs & History List */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Historique des Ventes
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Cliquez sur une vente pour afficher les détails des boissons
            </p>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => {
                soundEffects.tap(hapticEnabled);
                setFilterPeriod('today');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterPeriod === 'today'
                  ? 'btn-accent font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => {
                soundEffects.tap(hapticEnabled);
                setFilterPeriod('all');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterPeriod === 'all'
                  ? 'btn-accent font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Toutes ({sales.length})
            </button>
            <button
              onClick={() => {
                soundEffects.tap(hapticEnabled);
                setFilterPeriod('pending');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterPeriod === 'pending'
                  ? 'btn-accent font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              En attente sync ({sales.filter(s => !s.synced).length})
            </button>
          </div>
        </div>

        {/* List of sales with row optimization */}
        <div className="mt-4 space-y-2.5">
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
              <Receipt className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm font-semibold">Aucune vente enregistrée pour ce filtre.</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Les ventes validées s'afficheront ici en direct.</p>
            </div>
          ) : (
            filteredSales.map((sale) => {
              const isExpanded = !!expandedSaleIds[sale.id];

              return (
                <div
                  key={sale.id}
                  className="sale-row-optimized rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors hover:border-accent-subtle"
                >
                  {/* Row Header */}
                  <div
                    onClick={() => toggleDetails(sale.id)}
                    className="p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-accent shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {sale.receiptNumber}
                          </span>
                          {/* Sync badge */}
                          {sale.synced ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-md bg-emerald-500/10">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Synchronisé</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-accent px-1.5 py-0.2 rounded-md bg-accent-subtle">
                              <Clock className="w-3 h-3" />
                              <span>En attente sync</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {sale.dateFormatted} à {sale.timeFormatted} · {sale.paymentMethod} {sale.mobileMoneyProvider ? `(${sale.mobileMoneyProvider})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800/50">
                      <div className="text-left sm:text-right">
                        <span className="text-base sm:text-lg font-mono font-extrabold text-accent block tabular-nums leading-tight">
                          {sale.total.toLocaleString('fr-FR')} {currency}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {sale.items.length} article{sale.items.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.tap(hapticEnabled);
                            onShowReceipt(sale);
                          }}
                          title="Imprimer / Voir le ticket"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-accent hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Items Breakdown */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-white dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                      <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold pb-1 border-b border-zinc-200 dark:border-zinc-800">
                        <span>Détail Boisson</span>
                        <span>Qte × Prix</span>
                        <span>Total</span>
                      </div>
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-zinc-700 dark:text-zinc-300">
                          <span className="truncate flex-1 pr-2">{item.productName}</span>
                          <span className="text-zinc-500 shrink-0 px-2">{item.quantity} × {item.unitPrice.toLocaleString('fr-FR')}</span>
                          <span className="font-bold text-accent shrink-0 text-right">
                            {item.totalPrice.toLocaleString('fr-FR')} {currency}
                          </span>
                        </div>
                      ))}
                      {sale.paymentMethod === 'CASH' && (
                        <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800/60 flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                          <span>Espèces reçues : {sale.amountReceived.toLocaleString('fr-FR')} {currency}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Monnaie rendue : {sale.changeGiven.toLocaleString('fr-FR')} {currency}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
