import React from 'react';
import { Printer, Share2, X, CheckCircle } from 'lucide-react';
import { Sale, AppSettings } from '../types';
import { soundEffects } from '../utils/audio';

interface ReceiptModalProps {
  sale: Sale | null;
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  settings,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    soundEffects.tap(settings.hapticSound);
    window.print();
  };

  const handleShare = async () => {
    soundEffects.tap(settings.hapticSound);
    const receiptText = `
=== ${settings.storeName} ===
${settings.storeAddress} - Tel: ${settings.storePhone}
Ticket : ${sale.receiptNumber}
Date   : ${sale.dateFormatted} à ${sale.timeFormatted}
Caisse : ${sale.cashierName}
--------------------------------
${sale.items.map(it => `${it.productName} x${it.quantity} = ${it.totalPrice.toLocaleString('fr-FR')} ${settings.currency}`).join('\n')}
--------------------------------
TOTAL  : ${sale.total.toLocaleString('fr-FR')} ${settings.currency}
Mode   : ${sale.paymentMethod} ${sale.mobileMoneyProvider ? `(${sale.mobileMoneyProvider})` : ''}
Reçu   : ${sale.amountReceived.toLocaleString('fr-FR')} ${settings.currency}
Rendu  : ${sale.changeGiven.toLocaleString('fr-FR')} ${settings.currency}
--------------------------------
${settings.receiptFooter}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket ${sale.receiptNumber} - ${settings.storeName}`,
          text: receiptText,
        });
        return;
      } catch {
        // User cancelled or fell back
      }
    }

    navigator.clipboard?.writeText(receiptText);
    alert('Ticket copié dans le presse-papier !');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full sm:max-w-md max-h-[92dvh] sm:max-h-[88vh] bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl relative flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile touch indicator */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Top actions - Fixed header */}
        <div className="shrink-0 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-bold truncate">Vente validée avec succès</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {/* Printable Thermal Receipt Card */}
          <div 
            id="printable-receipt"
            className="p-5 bg-white text-zinc-900 rounded-2xl shadow-inner font-mono text-xs border border-zinc-300"
          >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-zinc-400">
            <h2 className="text-base font-extrabold uppercase tracking-wider font-['Cinzel'] text-zinc-900">
              {settings.storeName}
            </h2>
            <p className="text-[11px] text-zinc-600 mt-0.5">{settings.storeSubtitle}</p>
            <p className="text-[10px] text-zinc-600">{settings.storeAddress}</p>
            <p className="text-[10px] text-zinc-600">Tél : {settings.storePhone}</p>
          </div>

          {/* Meta */}
          <div className="py-2.5 border-b border-dashed border-zinc-400 flex flex-col gap-0.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500">Ticket N° :</span>
              <span className="font-bold">{sale.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Date :</span>
              <span>{sale.dateFormatted} {sale.timeFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Caissier :</span>
              <span>{sale.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Règlement :</span>
              <span className="font-semibold">
                {sale.paymentMethod} {sale.mobileMoneyProvider ? `(${sale.mobileMoneyProvider})` : ''}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-zinc-400">
            <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold mb-1.5">
              <span>Article</span>
              <span>Qte × Prix</span>
              <span>Total</span>
            </div>
            <div className="space-y-1.5">
              {sale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="flex-1 pr-1 truncate font-semibold">
                    {item.productName}
                  </div>
                  <div className="text-zinc-600 shrink-0 px-2">
                    {item.quantity} × {item.unitPrice.toLocaleString('fr-FR')}
                  </div>
                  <div className="font-bold shrink-0 text-right">
                    {item.totalPrice.toLocaleString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Change */}
          <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1 text-[11px]">
            <div className="flex justify-between font-extrabold text-sm pt-1">
              <span>TOTAL :</span>
              <span>{sale.total.toLocaleString('fr-FR')} {settings.currency}</span>
            </div>
            {sale.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between text-zinc-600">
                  <span>Espèces reçues :</span>
                  <span>{sale.amountReceived.toLocaleString('fr-FR')} {settings.currency}</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-900">
                  <span>Monnaie rendue :</span>
                  <span>{sale.changeGiven.toLocaleString('fr-FR')} {settings.currency}</span>
                </div>
              </>
            )}
          </div>

          {/* Simulated Barcode */}
          <div className="pt-3 text-center">
            <div className="h-8 flex items-center justify-center gap-0.5 max-w-[180px] mx-auto overflow-hidden">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="h-full bg-zinc-900"
                  style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1.5 : 2)}px` }}
                />
              ))}
            </div>
            <span className="text-[9px] text-zinc-500 block mt-1 tracking-widest">
              *{sale.receiptNumber}*
            </span>
            <p className="text-[10px] text-zinc-600 italic mt-2">
              {settings.receiptFooter}
            </p>
          </div>
          </div>
        </div>

        {/* Modal footer actions - Sticky at bottom */}
        <div className="shrink-0 p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-sm grid grid-cols-2 gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl btn-accent font-bold text-xs transition-colors shadow-md min-h-[44px] active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer Ticket</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs border border-zinc-300 dark:border-zinc-700 transition-colors min-h-[44px] active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Partager / Copier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
