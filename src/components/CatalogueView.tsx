import React, { useState, useMemo, memo } from 'react';
import { 
  Search, 
  X, 
  Plus, 
  Check, 
  AlertCircle, 
  Wine, 
  Beer, 
  GlassWater, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Product, ProductCategory, CartItem } from '../types';
import { soundEffects } from '../utils/audio';

interface CatalogueViewProps {
  products: Product[];
  cart: CartItem[];
  currency: string;
  hapticEnabled: boolean;
  onAddToCart: (product: Product) => void;
  onOpenAddProductModal: () => void;
}

// Highly optimized memoized Product Card for zero-lag mobile scrolling and tapping
const ProductCard = memo(({
  product,
  inCartQty,
  currency,
  hapticEnabled,
  onAddToCart,
}: {
  product: Product;
  inCartQty: number;
  currency: string;
  hapticEnabled: boolean;
  onAddToCart: (product: Product) => void;
}) => {
  const isLowStock = product.stock !== undefined && product.stock <= 5;
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleTap = () => {
    if (isOutOfStock) return;
    soundEffects.addCart(hapticEnabled);
    onAddToCart(product);
  };

  return (
    <div
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTap();
        }
      }}
      className={`mobile-touch-card group relative flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border transition-colors select-none cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-xs ${
        inCartQty > 0
          ? 'border-accent shadow-md bg-accent-subtle/10'
          : 'border-zinc-200 dark:border-zinc-800/90 hover:border-accent-subtle'
      } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Image slot with async decoding and lazy loading */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 mb-2.5">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-200 dark:bg-zinc-800 text-accent p-2">
            <Wine className="w-8 h-8 mb-1" />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">{product.category}</span>
          </div>
        )}

        {/* Stock pill / out of stock */}
        {isOutOfStock ? (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600/95 text-white text-[10px] font-bold">
            Épuisé
          </div>
        ) : isLowStock ? (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-[10px] font-bold flex items-center gap-1 shadow-sm">
            <AlertCircle className="w-3 h-3" />
            <span>{product.stock} restants</span>
          </div>
        ) : null}

        {/* In-cart count badge on top right */}
        {inCartQty > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg btn-accent font-mono font-bold text-xs shadow-md flex items-center gap-1">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>{inCartQty}</span>
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight">
            {product.name}
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 capitalize mt-0.5">
            {product.category} {product.stock !== undefined ? `· ${product.stock} en stock` : ''}
          </p>
        </div>

        {/* Price & Touch Action Button */}
        <div className="mt-2.5 flex items-center justify-between gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <div>
            <span className="text-base sm:text-lg font-extrabold text-accent tabular-nums font-mono">
              {product.price.toLocaleString('fr-FR')}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 ml-1">
              {currency}
            </span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              handleTap();
            }}
            aria-label={`Ajouter ${product.name} au panier`}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${
              inCartQty > 0
                ? 'btn-accent shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:btn-accent'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
});

export const CatalogueView: React.FC<CatalogueViewProps> = ({
  products,
  cart,
  currency,
  hapticEnabled,
  onAddToCart,
  onOpenAddProductModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: ProductCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = useMemo(() => [
    { id: 'all', label: 'Toutes', icon: Sparkles },
    { id: 'beers', label: 'Bières', icon: Beer },
    { id: 'cocktails', label: 'Cocktails', icon: Wine },
    { id: 'wines', label: 'Vins & Champagnes', icon: Wine },
    { id: 'sodas', label: 'Sodas & Jus', icon: GlassWater },
    { id: 'waters', label: 'Eaux', icon: GlassWater },
    { id: 'other', label: 'Autres', icon: ShoppingBag },
  ], []);

  // Map cart quantities for instant O(1) lookup
  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cart) {
      map.set(item.product.id, item.quantity);
    }
    return map;
  }, [cart]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q));
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="catalogue-container flex flex-col gap-4">
      {/* Search and Category filter zone */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Instant Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            id="catalogue-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une boisson ou code..."
            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all shadow-xs min-h-[42px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick add custom item button */}
        <button
          onClick={() => {
            soundEffects.tap(hapticEnabled);
            onOpenAddProductModal();
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-accent border border-accent-subtle text-xs font-bold transition-all active:scale-95 shrink-0 min-h-[42px] shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Boisson</span>
        </button>
      </div>

      {/* Category Filter Pills (Responsive scroll & wrap) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none overscroll-x-contain">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundEffects.tap(hapticEnabled);
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 min-h-[38px] shrink-0 ${
                isSelected
                  ? 'btn-accent font-bold shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Products (Tailored: 2 on Phone, 2-3 on Tablet, 3-4 on PC) */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <Wine className="w-12 h-12 mx-auto text-zinc-400 dark:text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-300">
            Aucun produit trouvé
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Aucun résultat pour "${searchQuery}". Essayez un autre terme.`
              : 'Aucun produit dans cette catégorie pour le moment.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors min-h-[40px]"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-2.5 sm:gap-3.5 gpu-accelerated">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              inCartQty={cartQtyMap.get(product.id) || 0}
              currency={currency}
              hapticEnabled={hapticEnabled}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};
