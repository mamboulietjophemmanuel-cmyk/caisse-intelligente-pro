import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Banknote, 
  Smartphone, 
  CreditCard, 
  Check, 
  X, 
  Delete, 
  AlertTriangle
} from 'lucide-react';
import { CartItem, PaymentMethod, MobileMoneyProvider, Sale } from '../types';
import { soundEffects } from '../utils/audio';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  currency: string;
  cashierName: string;
  hapticEnabled: boolean;
  prefilledAmount?: number;
  onClose: () => void;
  onCompleteSale: (sale: Sale) => void;
  onShowReceipt: (sale: Sale) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cart,
  currency,
  cashierName,
  hapticEnabled,
  prefilledAmount,
  onClose,
  onCompleteSale,
  onShowReceipt,
}) => {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [mobileProvider, setMobileProvider] = useState<MobileMoneyProvider>('Wave');
  const [amountReceivedStr, setAmountReceivedStr] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (prefilledAmount !== undefined && prefilledAmount > 0) {
        setAmountReceivedStr(String(prefilledAmount));
      } else {
        setAmountReceivedStr(String(total));
      }
      setErrorMsg('');
      setNotes('');
      setPaymentMethod('CASH');
    }
  }, [isOpen, prefilledAmount, total]);

  if (!isOpen) return null;

  const amountReceived = parseInt(amountReceivedStr, 10) || 0;
  const changeDue = Math.max(0, amountReceived - total);
  const isInsufficient = paymentMethod === 'CASH' && amountReceived < total;

  // Numpad handlers
  const handleKeyTap = (key: string) => {
    soundEffects.tap(hapticEnabled);
    setErrorMsg('');
    if (key === 'CLEAR') {
      setAmountReceivedStr('');
    } else if (key === 'BACKSPACE') {
      setAmountReceivedStr((prev) => prev.slice(0, -1));
    } else if (key === 'EXACT') {
      setAmountReceivedStr(String(total));
    } else {
      if (amountReceivedStr === '0') {
        setAmountReceivedStr(key);
      } else {
        setAmountReceivedStr((prev) => (prev.length < 9 ? prev + key : prev));
      }
    }
  };

  const setQuickAmount = (amount: number) => {
    soundEffects.tap(hapticEnabled);
    setErrorMsg('');
    setAmountReceivedStr(String(amount));
  };

  const handleConfirm = () => {
    if (paymentMethod === 'CASH' && amountReceived < total) {
      setErrorMsg(`Montant insuffisant : il manque ${(total - amountReceived).toLocaleString('fr-FR')} ${currency}`);
      soundEffects.deleteItem(hapticEnabled);
      return;
    }

    const now = new Date();
    const saleId = `sale-${Date.now()}`;
    const receiptNumber = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;

    const newSale: Sale = {
      id: saleId,
      receiptNumber,
      timestamp: now.getTime(),
      dateFormatted: now.toLocaleDateString('fr-FR'),
      timeFormatted: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      items: cart.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        unitPrice: it.product.price,
        quantity: it.quantity,
        totalPrice: it.product.price * it.quantity,
      })),
      total,
      amountReceived: paymentMethod === 'CASH' ? amountReceived : total,
      changeGiven: paymentMethod === 'CASH' ? changeDue : 0,
      paymentMethod,
      mobileMoneyProvider: paymentMethod === 'MOBILE_MONEY' ? mobileProvider : undefined,
      cashierName,
      synced: false,
      notes: notes.trim() || undefined,
    };

    soundEffects.cashSuccess(hapticEnabled);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Ignore
    }

    onCompleteSale(newSale);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full sm:max-w-lg max-h-[94dvh] sm:max-h-[90vh] bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl relative flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile touch indicator */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header - Fixed */}
        <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl btn-accent flex items-center justify-center font-bold shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Encaissement Rapide
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                {cart.length} ligne{cart.length > 1 ? 's' : ''} de commande
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">

        {/* Total Display */}
        <div className="my-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Total à régler
          </span>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-accent font-mono tabular-nums">
              {total.toLocaleString('fr-FR')}
            </span>
            <span className="text-sm font-bold text-accent ml-1.5">{currency}</span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              soundEffects.tap(hapticEnabled);
              setPaymentMethod('CASH');
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[50px] ${
              paymentMethod === 'CASH'
                ? 'btn-accent shadow-md'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <Banknote className="w-4 h-4 mb-1" />
            <span>Espèces</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.tap(hapticEnabled);
              setPaymentMethod('MOBILE_MONEY');
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[50px] ${
              paymentMethod === 'MOBILE_MONEY'
                ? 'btn-accent shadow-md'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <Smartphone className="w-4 h-4 mb-1" />
            <span>Mobile Money</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.tap(hapticEnabled);
              setPaymentMethod('CARD');
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[50px] ${
              paymentMethod === 'CARD'
                ? 'btn-accent shadow-md'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <CreditCard className="w-4 h-4 mb-1" />
            <span>Carte Bancaire</span>
          </button>
        </div>

        {/* If Mobile Money: Provider selection */}
        {paymentMethod === 'MOBILE_MONEY' && (
          <div className="mb-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mb-2 block">
              Opérateur Mobile Money :
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money'] as MobileMoneyProvider[]).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => {
                    soundEffects.tap(hapticEnabled);
                    setMobileProvider(prov);
                  }}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all truncate ${
                    mobileProvider === prov
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cash Tender Area & Change Calculation */}
        {paymentMethod === 'CASH' && (
          <div className="space-y-3 mb-4">
            {/* Quick Bill presets */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              <button
                type="button"
                onClick={() => setQuickAmount(total)}
                className="py-2 sm:py-1.5 px-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-accent-subtle text-accent text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-700 min-h-[36px] flex items-center justify-center active:scale-95 transition-transform"
              >
                Exact
              </button>
              {[1000, 2000, 5000, 10000, 20000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuickAmount(val)}
                  className="py-2 sm:py-1.5 px-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-700 min-h-[36px] flex items-center justify-center active:scale-95 transition-transform"
                >
                  {val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>

            {/* Display: Montant Reçu and Monnaie à rendre */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">
                  Montant Reçu
                </label>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {amountReceived.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs font-bold text-zinc-400">{currency}</span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${
                isInsufficient
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/60 text-rose-600 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-300'
              }`}>
                <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1">
                  {isInsufficient ? 'Manque' : 'Monnaie à rendre'}
                </label>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums">
                    {isInsufficient
                      ? (total - amountReceived).toLocaleString('fr-FR')
                      : changeDue.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs font-bold opacity-80">{currency}</span>
                </div>
              </div>
            </div>

            {/* Tactile Virtual Numpad (Scaled for Phone touch & PC clicks) */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyTap(digit)}
                  className="h-12 sm:h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-90 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-lg border border-zinc-200 dark:border-zinc-800 transition-all select-none min-h-[46px]"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeyTap('BACKSPACE')}
                className="h-12 sm:h-11 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 active:scale-90 text-rose-500 dark:text-rose-300 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 transition-all select-none min-h-[46px]"
                aria-label="Effacer le dernier chiffre"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        </div>

        {/* Action Buttons - Sticky footer */}
        <div className="shrink-0 p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-sm flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs border border-zinc-300 dark:border-zinc-700 transition-colors min-h-[46px] flex items-center justify-center active:scale-95"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isInsufficient}
            className={`flex-[2] py-3 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all min-h-[46px] ${
              isInsufficient
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                : 'btn-accent active:scale-[0.98]'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span className="truncate">CONFIRMER L'ENCAISSEMENT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
