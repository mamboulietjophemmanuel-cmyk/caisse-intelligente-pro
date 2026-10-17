import React from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  X, 
  Banknote
} from 'lucide-react';
import { CartItem } from '../types';
import { soundEffects } from '../utils/audio';

interface CartSidebarProps {
  cart: CartItem[];
  currency: string;
  hapticEnabled: boolean;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: (prefilledAmount?: number) => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  currency,
  hapticEnabled,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Common quick tender bill buttons for FCFA
  const quickBills = [
    { label: 'Exact', amount: totalPrice },
    { label: '1 000', amount: 1000 },
    { label: '2 000', amount: 2000 },
    { label: '5 000', amount: 5000 },
    { label: '10 000', amount: 10000 },
    { label: '20 000', amount: 20000 },
  ].filter(b => b.amount >= totalPrice || b.label === 'Exact');

  const handleMinus = (productId: string, currentQty: number) => {
    if (currentQty <= 1) {
      soundEffects.deleteItem(hapticEnabled);
      onRemoveItem(productId);
    } else {
      soundEffects.tap(hapticEnabled);
      onUpdateQuantity(productId, -1);
    }
  };

  const handlePlus = (productId: string) => {
    soundEffects.tap(hapticEnabled);
    onUpdateQuantity(productId, 1);
  };

  const handleClear = () => {
    soundEffects.deleteItem(hapticEnabled);
    onClearCart();
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              Panier en cours
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {totalItems} article{totalItems > 1 ? 's' : ''} sélectionné{totalItems > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              onClick={handleClear}
              title="Vider le panier"
              className="text-xs text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vider</span>
            </button>
          )}

          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cart items list */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 min-h-[160px] max-h-[420px] lg:max-h-[calc(100vh-380px)]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 dark:text-zinc-500">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-zinc-400 dark:text-zinc-600" />
            </div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-400">
              Le panier est vide
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-[200px]">
              Touchez une boisson dans le catalogue pour l'ajouter
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60 transition-all hover:border-accent-subtle"
            >
              {/* Product Info */}
              <div className="min-w-0 flex-1 pr-2">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {item.product.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-mono tabular-nums">
                    {item.product.price.toLocaleString('fr-FR')} {currency}
                  </span>
                  <span>×</span>
                  <span className="font-bold text-accent font-mono">
                    {item.quantity}
                  </span>
                </div>
              </div>

              {/* Quantity Controls + Item Total */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-300 dark:border-zinc-800/80">
                  <button
                    onClick={() => handleMinus(item.product.id, item.quantity)}
                    aria-label="Diminuer"
                    className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-800/80 active:scale-90 transition-all"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3.5 h-3.5" />}
                  </button>

                  <span className="w-7 text-center font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => handlePlus(item.product.id)}
                    aria-label="Augmenter"
                    className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-800/80 active:scale-90 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 block tabular-nums">
                    {(item.product.price * item.quantity).toLocaleString('fr-FR')}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">{currency}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Fast Tender */}
      {cart.length > 0 && (
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80 space-y-3">
          {/* Quick Tender shortcuts */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
              Coupures rapides
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {quickBills.slice(0, 6).map((bill, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundEffects.tap(hapticEnabled);
                    onCheckout(bill.amount);
                  }}
                  className="px-2 py-2 sm:py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/80 hover:bg-accent-subtle hover:border-accent text-xs font-mono font-bold text-accent border border-zinc-200 dark:border-zinc-800 transition-all text-center truncate active:scale-95 min-h-[38px] sm:min-h-[34px] flex items-center justify-center"
                >
                  {bill.label === 'Exact' ? 'Exact' : `${bill.label}`}
                </button>
              ))}
            </div>
          </div>

          {/* Subtotal & Total display */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>Sous-total ({totalItems} articles)</span>
              <span className="font-mono tabular-nums">{totalPrice.toLocaleString('fr-FR')} {currency}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800/50">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                TOTAL À PAYER
              </span>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-accent font-mono tracking-tight tabular-nums">
                  {totalPrice.toLocaleString('fr-FR')}
                </span>
                <span className="text-xs font-bold text-accent ml-1">{currency}</span>
              </div>
            </div>
          </div>

          {/* Checkout Big Tactile CTA */}
          <button
            onClick={() => {
              soundEffects.tap(hapticEnabled);
              onCheckout();
            }}
            className="w-full py-3.5 sm:py-4 px-4 rounded-xl btn-accent font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all min-h-[50px] sm:min-h-[52px]"
          >
            <Banknote className="w-5 h-5 stroke-[2.5]" />
            <span>ENCAISSER</span>
            <span className="font-mono text-xs sm:text-sm px-2 py-0.5 rounded-md bg-black/20 text-white">
              {totalPrice.toLocaleString('fr-FR')} {currency}
            </span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </button>
        </div>
      )}
    </div>
  );

  if (isMobileDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm transition-opacity">
        <div className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-zinc-950 rounded-t-3xl border-t border-accent-subtle p-4 sm:p-5 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200">
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3 shrink-0" />
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-md backdrop-blur-sm sticky top-20">
      {content}
    </div>
  );
};
