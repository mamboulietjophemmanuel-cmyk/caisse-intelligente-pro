import { Product, Sale, AppSettings } from '../types';

// Generated high-fidelity asset paths
import beersImg from '../assets/images/drink_beers_bar_1792216292266.jpg';
import cocktailsImg from '../assets/images/drink_cocktails_tropical_1792216293287.jpg';
import champagneImg from '../assets/images/drink_wine_champagne_1792216293759.jpg';
import sodasImg from '../assets/images/drink_soda_fresh_1792216294488.jpg';

const STORAGE_KEYS = {
  PRODUCTS: 'caisse_pro_products_v2',
  SALES: 'caisse_pro_sales_v2',
  SETTINGS: 'caisse_pro_settings_v2',
  SYNC_QUEUE: 'caisse_pro_sync_queue_v2',
  LAST_SYNC: 'caisse_pro_last_sync_v2',
};

// Initial default catalogue with authentic bar & restaurant beverages
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Castel Beer 65cl',
    price: 1000,
    category: 'beers',
    image: beersImg,
    stock: 48,
    barcode: '3256220101',
    color: '#D4AF37',
  },
  {
    id: 'prod-2',
    name: 'Beaufort Lager 50cl',
    price: 1200,
    category: 'beers',
    image: beersImg,
    stock: 36,
    barcode: '3256220102',
    color: '#EAB308',
  },
  {
    id: 'prod-3',
    name: 'Guinness Foreign Extra',
    price: 1500,
    category: 'beers',
    image: beersImg,
    stock: 24,
    barcode: '3256220103',
    color: '#713F12',
  },
  {
    id: 'prod-4',
    name: 'Heineken Bouteille 33cl',
    price: 1500,
    category: 'beers',
    image: beersImg,
    stock: 30,
    barcode: '3256220104',
    color: '#15803D',
  },
  {
    id: 'prod-5',
    name: 'Cocktail Mojito Royal',
    price: 3500,
    category: 'cocktails',
    image: cocktailsImg,
    stock: 50,
    color: '#10B981',
  },
  {
    id: 'prod-6',
    name: 'Piña Colada Passion',
    price: 3500,
    category: 'cocktails',
    image: cocktailsImg,
    stock: 40,
    color: '#F59E0B',
  },
  {
    id: 'prod-7',
    name: 'Spritz Agrumes Fizz',
    price: 4000,
    category: 'cocktails',
    image: cocktailsImg,
    stock: 25,
    color: '#EA580C',
  },
  {
    id: 'prod-8',
    name: 'Moët & Chandon Brut',
    price: 45000,
    category: 'wines',
    image: champagneImg,
    stock: 8,
    color: '#CA8A04',
  },
  {
    id: 'prod-9',
    name: 'Veuve Clicquot Ponsardin',
    price: 52000,
    category: 'wines',
    image: champagneImg,
    stock: 6,
    color: '#D97706',
  },
  {
    id: 'prod-10',
    name: 'Vin Rouge Grand Bordeaux',
    price: 12000,
    category: 'wines',
    image: champagneImg,
    stock: 14,
    color: '#991B1B',
  },
  {
    id: 'prod-11',
    name: 'Coca-Cola Verre 33cl',
    price: 600,
    category: 'sodas',
    image: sodasImg,
    stock: 72,
    barcode: '5449000000',
    color: '#DC2626',
  },
  {
    id: 'prod-12',
    name: 'Fanta Orange Frais',
    price: 600,
    category: 'sodas',
    image: sodasImg,
    stock: 60,
    color: '#EA580C',
  },
  {
    id: 'prod-13',
    name: 'Eau Minérale Tangui 1.5L',
    price: 500,
    category: 'waters',
    image: sodasImg,
    stock: 80,
    color: '#0284C7',
  },
  {
    id: 'prod-14',
    name: 'Red Bull Energy 250ml',
    price: 1800,
    category: 'sodas',
    image: sodasImg,
    stock: 45,
    color: '#3B82F6',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  palette: 'gold',
  fontSize: 'normal',
  hapticSound: true,
  storeName: 'OYOMBI LOUNGE & BAR',
  storeSubtitle: 'Caisse Intelligente Pro',
  storeAddress: 'Boulevard Circulaire, Libreville',
  storePhone: '+241 07 45 88 92',
  currency: 'FCFA',
  receiptFooter: 'Merci de votre visite et à très bientôt !',
  autoSync: true,
  cashierName: 'Caisse Principale',
};

// Safe JSON parse helper
function safeJsonParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[Storage] Failed to parse ${key}:`, e);
    return fallback;
  }
}

export const StorageService = {
  getProducts(): Product[] {
    const stored = safeJsonParse<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      return stored;
    }

    // Check legacy storage if user had old products
    try {
      const legacy = localStorage.getItem('produits');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated: Product[] = parsed.map((p, idx) => ({
            id: p.id ? String(p.id) : `legacy-${idx}`,
            name: p.nom || p.name || 'Boisson',
            price: Number(p.prix || p.price || 1000),
            category: 'beers',
            stock: 50,
          }));
          this.saveProducts(migrated);
          return migrated;
        }
      }
    } catch {
      // Continue to initial products
    }

    // Initialize with default catalogue
    this.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      // Keep legacy in sync
      localStorage.setItem('produits', JSON.stringify(products.map(p => ({
        id: p.id,
        nom: p.name,
        prix: p.price,
      }))));
    } catch (e) {
      console.error('[Storage] Error saving products:', e);
    }
  },

  getSales(): Sale[] {
    const stored = safeJsonParse<Sale[] | null>(STORAGE_KEYS.SALES, null);
    if (stored && Array.isArray(stored)) {
      return stored;
    }

    // Check legacy storage
    try {
      const legacy = localStorage.getItem('historique');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated: Sale[] = parsed.map((h, i) => {
            const now = Date.now() - (parsed.length - i) * 60000;
            return {
              id: `sale-legacy-${i}`,
              receiptNumber: `TICK-${1000 + i}`,
              timestamp: now,
              dateFormatted: h.date || new Date(now).toLocaleDateString('fr-FR'),
              timeFormatted: h.heure || new Date(now).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              items: (h.items || []).map((it: { nom?: string; name?: string; id?: string; prix?: number; price?: number; qte?: number; quantity?: number }) => ({
                productId: String(it.id || 'item'),
                productName: it.nom || it.name || 'Article',
                unitPrice: Number(it.prix || it.price || 0),
                quantity: Number(it.qte || it.quantity || 1),
                totalPrice: Number(it.prix || it.price || 0) * Number(it.qte || it.quantity || 1),
              })),
              total: Number(h.total || 0),
              amountReceived: Number(h.total || 0),
              changeGiven: 0,
              paymentMethod: 'CASH',
              cashierName: 'Caisse Principale',
              synced: true,
            };
          });
          this.saveSales(migrated);
          return migrated;
        }
      }
    } catch {
      // Ignore
    }

    return [];
  },

  saveSales(sales: Sale[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
      // Keep legacy format updated
      localStorage.setItem('historique', JSON.stringify(sales.map(s => ({
        date: s.dateFormatted,
        heure: s.timeFormatted,
        total: s.total,
        items: s.items.map(it => ({
          nom: it.productName,
          prix: it.unitPrice,
          qte: it.quantity,
        })),
      }))));
    } catch (e) {
      console.error('[Storage] Error saving sales:', e);
    }
  },

  recordSale(sale: Sale, isOnline: boolean): { sale: Sale; queueCount: number } {
    const currentSales = this.getSales();
    const currentQueue = this.getSyncQueue();

    // Mark sync status based on connectivity
    const saleToSave: Sale = {
      ...sale,
      synced: isOnline,
      syncTimestamp: isOnline ? Date.now() : undefined,
    };

    const updatedSales = [saleToSave, ...currentSales];
    this.saveSales(updatedSales);

    let updatedQueue = currentQueue;
    if (!isOnline) {
      // Add to offline sync queue
      updatedQueue = [...currentQueue, saleToSave.id];
      this.saveSyncQueue(updatedQueue);
    }

    // Decrement stock for inventory accuracy
    const products = this.getProducts();
    const updatedProducts = products.map(p => {
      const soldItem = sale.items.find(it => it.productId === p.id);
      if (soldItem && p.stock !== undefined) {
        return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      }
      return p;
    });
    this.saveProducts(updatedProducts);

    return { sale: saleToSave, queueCount: updatedQueue.length };
  },

  getSyncQueue(): string[] {
    return safeJsonParse<string[]>(STORAGE_KEYS.SYNC_QUEUE, []);
  },

  saveSyncQueue(queue: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('[Storage] Error saving sync queue:', e);
    }
  },

  getLastSync(): number | null {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return raw ? Number(raw) : null;
  },

  setLastSync(timestamp: number): void {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(timestamp));
  },

  async processSyncQueue(): Promise<{ syncedCount: number; remainingCount: number }> {
    const queue = this.getSyncQueue();
    if (queue.length === 0) {
      return { syncedCount: 0, remainingCount: 0 };
    }

    // Simulate reliable background sync / server push
    await new Promise(resolve => setTimeout(resolve, 800));

    const sales = this.getSales();
    const now = Date.now();
    const updatedSales = sales.map(s => {
      if (queue.includes(s.id)) {
        return { ...s, synced: true, syncTimestamp: now };
      }
      return s;
    });

    this.saveSales(updatedSales);
    this.saveSyncQueue([]);
    this.setLastSync(now);

    return { syncedCount: queue.length, remainingCount: 0 };
  },

  getSettings(): AppSettings {
    const stored = safeJsonParse<Partial<AppSettings> | null>(STORAGE_KEYS.SETTINGS, null);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...stored };
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('[Storage] Error saving settings:', e);
    }
  },

  exportDatabaseBackup(): string {
    const backup = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      sales: this.getSales(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importDatabaseBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.products && Array.isArray(parsed.products)) {
        this.saveProducts(parsed.products);
      }
      if (parsed.sales && Array.isArray(parsed.sales)) {
        this.saveSales(parsed.sales);
      }
      if (parsed.settings) {
        this.saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      }
      return true;
    } catch (e) {
      console.error('[Storage] Failed to import backup:', e);
      return false;
    }
  },

  clearAppCache(): void {
    try {
      if ('caches' in window) {
        caches.keys().then(keys => {
          keys.forEach(k => caches.delete(k));
        });
      }
      // Force reload ignoring cache
      window.location.reload();
    } catch (e) {
      console.warn('[Cache] Could not clear cache:', e);
      window.location.reload();
    }
  },
};
