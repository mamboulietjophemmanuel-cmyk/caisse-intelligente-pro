import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Trash2, 
  Boxes, 
  Search, 
  X, 
  AlertCircle,
  Wine,
  PackagePlus,
  Pencil,
  Upload,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { soundEffects } from '../utils/audio';

// Import default generated high-fidelity beverage images for quick presets
import beersImg from '../assets/images/drink_beers_bar_1792216292266.jpg';
import cocktailsImg from '../assets/images/drink_cocktails_tropical_1792216293287.jpg';
import champagneImg from '../assets/images/drink_wine_champagne_1792216293759.jpg';
import sodasImg from '../assets/images/drink_soda_fresh_1792216294488.jpg';

interface ProductsAdminViewProps {
  products: Product[];
  currency: string;
  hapticEnabled: boolean;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductsAdminView: React.FC<ProductsAdminViewProps> = ({
  products,
  currency,
  hapticEnabled,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // New product form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('beers');
  const [stock, setStock] = useState('50');
  const [barcode, setBarcode] = useState('');
  const [newProductImage, setNewProductImage] = useState<string>('');
  const [formError, setFormError] = useState('');

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState<ProductCategory>('beers');
  const [editStock, setEditStock] = useState('0');
  const [editBarcode, setEditBarcode] = useState('');
  const [editImage, setEditImage] = useState<string>('');
  const [editError, setEditError] = useState('');

  // Lock body scroll on mobile when editing modal / bottom sheet is active
  useEffect(() => {
    if (editingProduct) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [editingProduct]);

  const imagePresets = [
    { label: 'Bières', img: beersImg },
    { label: 'Cocktails', img: cocktailsImg },
    { label: 'Vins & Bulles', img: champagneImg },
    { label: 'Sodas & Eaux', img: sodasImg },
  ];

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Le nom du produit est requis.');
      return;
    }
    const numPrice = parseInt(price, 10);
    if (!numPrice || numPrice <= 0) {
      setFormError('Veuillez entrer un prix valide supérieur à 0.');
      return;
    }

    soundEffects.cashSuccess(hapticEnabled);
    onAddProduct({
      name: name.trim(),
      price: numPrice,
      category,
      stock: parseInt(stock, 10) || 0,
      barcode: barcode.trim() || undefined,
      image: newProductImage || undefined,
    });

    // Reset form
    setName('');
    setPrice('');
    setCategory('beers');
    setStock('50');
    setBarcode('');
    setNewProductImage('');
    setFormError('');
    setIsAddFormOpen(false);
  };

  const handleStartEdit = (prod: Product) => {
    soundEffects.tap(hapticEnabled);
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(String(prod.price));
    setEditCategory(prod.category);
    setEditStock(String(prod.stock ?? 0));
    setEditBarcode(prod.barcode || '');
    setEditImage(prod.image || '');
    setEditError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editName.trim()) {
      setEditError('Le nom du produit est obligatoire.');
      return;
    }
    const numPrice = parseInt(editPrice, 10);
    if (!numPrice || numPrice <= 0) {
      setEditError('Le prix doit être supérieur à 0.');
      return;
    }

    soundEffects.cashSuccess(hapticEnabled);
    const updated: Product = {
      ...editingProduct,
      name: editName.trim(),
      price: numPrice,
      category: editCategory,
      stock: parseInt(editStock, 10) || 0,
      barcode: editBarcode.trim() || undefined,
      image: editImage || undefined,
    };

    onUpdateProduct(updated);
    setEditingProduct(null);
  };

  // Convert uploaded image file into data URL for instant mobile preview and local storage
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        soundEffects.tap(hapticEnabled);
        if (isEditing) {
          setEditImage(result);
        } else {
          setNewProductImage(result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStockAdjust = (product: Product, delta: number) => {
    soundEffects.tap(hapticEnabled);
    const updated = {
      ...product,
      stock: Math.max(0, (product.stock || 0) + delta),
    };
    onUpdateProduct(updated);
  };

  const handleDelete = (id: string, productName: string) => {
    if (window.confirm(`Confirmez-vous la suppression de "${productName}" du catalogue ?`)) {
      soundEffects.deleteItem(hapticEnabled);
      onDeleteProduct(id);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs gpu-accelerated">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-accent" />
            <span>Gestion du Catalogue & Stocks</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {products.length} boisson{products.length > 1 ? 's' : ''} enregistrée{products.length > 1 ? 's' : ''} · Modifier prix, stocks et photos
          </p>
        </div>

        <button
          onClick={() => {
            soundEffects.tap(hapticEnabled);
            setIsAddFormOpen(!isAddFormOpen);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl btn-accent font-bold text-xs shadow-md active:scale-95 transition-all min-h-[44px]"
        >
          {isAddFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[3]" />}
          <span>{isAddFormOpen ? 'Fermer le formulaire' : 'Ajouter un Produit'}</span>
        </button>
      </div>

      {/* Add Product Collapsible Panel */}
      {isAddFormOpen && (
        <form
          onSubmit={handleCreateProduct}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-accent-subtle space-y-4 shadow-xl gpu-accelerated animate-in zoom-in-95 duration-150"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <PackagePlus className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Créer une nouvelle boisson
            </h3>
          </div>

          {formError && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Nom du produit *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Castel Beer, Cocktail..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Prix unitaire ({currency}) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex : 1000"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="beers">Bières</option>
                <option value="cocktails">Cocktails</option>
                <option value="wines">Vins & Champagnes</option>
                <option value="sodas">Sodas & Jus</option>
                <option value="waters">Eaux</option>
                <option value="other">Autres</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Stock initial (bouteilles)
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Ex : 50"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono"
              />
            </div>
          </div>

          {/* Image Selection for new product */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-2">
              Photo du produit (Optionnel)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-zinc-300 dark:border-zinc-700">
                <Upload className="w-3.5 h-3.5 text-accent" />
                <span>Importer photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileUpload(e, false)}
                  className="hidden"
                />
              </label>

              <span className="text-[11px] text-zinc-400">ou modèle :</span>

              {imagePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundEffects.tap(hapticEnabled);
                    setNewProductImage(preset.img);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                    newProductImage === preset.img
                      ? 'border-accent bg-accent-subtle/30 text-accent font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <img src={preset.img} alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span>{preset.label}</span>
                </button>
              ))}

              {newProductImage && (
                <button
                  type="button"
                  onClick={() => setNewProductImage('')}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Retirer
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl btn-accent font-bold text-xs shadow-md"
            >
              Enregistrer la boisson
            </button>
          </div>
        </form>
      )}

      {/* Edit Product Modal (Native Slide-Up Bottom Sheet Menu with createPortal) */}
      {editingProduct && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-hidden animate-fade-in-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingProduct(null);
          }}
        >
          <div 
            className="w-full sm:max-w-lg max-h-[88dvh] sm:max-h-[85vh] bg-white dark:bg-zinc-950 rounded-t-[28px] sm:rounded-3xl border-t sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl relative flex flex-col overflow-hidden animate-bottom-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile swipe/touch indicator bar */}
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

            {/* Modal Header - Pinned at top */}
            <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl btn-accent flex items-center justify-center shrink-0 shadow-xs">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    Modifier le produit
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                    Menu rapide de modification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                aria-label="Fermer le menu"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form with scrollable body and sticky action footer */}
            <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
                {editError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}

                {/* Product Visual / Image changer */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                    Image du produit
                  </label>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
                    <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-950 shrink-0 border border-zinc-300 dark:border-zinc-800 relative shadow-inner">
                      {editImage ? (
                        <img src={editImage} alt="Aperçu" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-accent">
                          <Wine className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2.5">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl btn-accent text-xs font-bold cursor-pointer shadow-xs active:scale-95 transition-transform min-h-[40px]">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Téléverser photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(e, true)}
                            className="hidden"
                          />
                        </label>

                        {editImage && (
                          <button
                            type="button"
                            onClick={() => setEditImage('')}
                            className="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/40 min-h-[40px] transition-colors"
                          >
                            Retirer
                          </button>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                          Ou choisir un modèle prédéfini :
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {imagePresets.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                soundEffects.tap(hapticEnabled);
                                setEditImage(preset.img);
                              }}
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                                editImage === preset.img
                                  ? 'border-accent bg-accent text-accent-contrast font-bold shadow-xs'
                                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                              }`}
                            >
                              <img src={preset.img} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                              <span className="truncate">{preset.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Nom du produit *
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Prix ({currency}) *
                    </label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Catégorie
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as ProductCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] min-h-[44px]"
                    >
                      <option value="beers">Bières</option>
                      <option value="cocktails">Cocktails</option>
                      <option value="wines">Vins & Champagnes</option>
                      <option value="sodas">Sodas & Jus</option>
                      <option value="waters">Eaux</option>
                      <option value="other">Autres</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Stock en réserve
                    </label>
                    <input
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Code-barres / Référence (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={editBarcode}
                    onChange={(e) => setEditBarcode(e.target.value)}
                    placeholder="Ex : 3256220101"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono min-h-[44px]"
                  />
                </div>
              </div>

              {/* Action Buttons - Pinned at bottom with safe area padding */}
              <div className="shrink-0 p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-sm flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pb-safe">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 min-h-[44px] flex items-center justify-center transition-colors active:scale-95"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-accent font-bold text-xs shadow-md min-h-[44px] flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Search Input for Products */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrer un produit..."
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>

      {/* Products Table / List with GPU acceleration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 gpu-accelerated">
        {filtered.map((prod) => (
          <div
            key={prod.id}
            className="mobile-touch-card p-3.5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-3 hover:border-accent-subtle transition-all shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 shrink-0 border border-zinc-200 dark:border-zinc-800">
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-accent">
                      <Wine className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {prod.name}
                  </h4>
                  <p className="text-xs font-mono font-bold text-accent mt-0.5">
                    {prod.price.toLocaleString('fr-FR')} {currency}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize mt-0.5">
                    {prod.category}
                  </p>
                </div>
              </div>

              {/* Action buttons: Pencil (Edit) & Trash (Delete) */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartEdit(prod)}
                  className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-accent hover:bg-accent-subtle/30 transition-all active:scale-90"
                  title="Modifier le produit et son image"
                  aria-label={`Modifier ${prod.name}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(prod.id, prod.name)}
                  className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-90"
                  title="Supprimer"
                  aria-label={`Supprimer ${prod.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick stock manager with touch-friendly targets */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">
                Stock : <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{prod.stock}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStockAdjust(prod, -1)}
                  className="px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold min-h-[34px] sm:min-h-[28px] min-w-[34px] sm:min-w-[28px] flex items-center justify-center active:scale-90 transition-transform"
                  title="Retirer 1"
                >
                  -1
                </button>
                <button
                  onClick={() => handleStockAdjust(prod, 1)}
                  className="px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold min-h-[34px] sm:min-h-[28px] min-w-[34px] sm:min-w-[28px] flex items-center justify-center active:scale-90 transition-transform"
                  title="Ajouter 1"
                >
                  +1
                </button>
                <button
                  onClick={() => handleStockAdjust(prod, 10)}
                  className="px-2.5 py-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-accent-subtle text-accent hover:brightness-110 font-bold text-xs min-h-[34px] sm:min-h-[28px] flex items-center justify-center active:scale-90 transition-transform"
                  title="Réapprovisionner +10"
                >
                  +10
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
