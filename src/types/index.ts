export type ProductCategory = 
  | 'all'
  | 'beers'
  | 'cocktails'
  | 'wines'
  | 'sodas'
  | 'waters'
  | 'snacks'
  | 'other';

export interface Product {
  id: string;
  name: string;
  price: number; // in FCFA
  category: ProductCategory;
  image?: string;
  stock: number;
  barcode?: string;
  color?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'CASH' | 'MOBILE_MONEY' | 'CARD';
export type MobileMoneyProvider = 'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money';

export interface SaleItemSummary {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  timestamp: number;
  dateFormatted: string;
  timeFormatted: string;
  items: SaleItemSummary[];
  total: number;
  amountReceived: number;
  changeGiven: number;
  paymentMethod: PaymentMethod;
  mobileMoneyProvider?: MobileMoneyProvider;
  cashierName: string;
  synced: boolean;
  syncTimestamp?: number;
  notes?: string;
}

export type ThemeMode = 'system' | 'dark' | 'light';
export type ThemePalette = 'gold' | 'emerald' | 'sapphire' | 'ruby' | 'obsidian';
export type FontSizePreference = 'compact' | 'normal' | 'comfortable';

export interface AppSettings {
  themeMode: ThemeMode;
  palette: ThemePalette;
  fontSize: FontSizePreference;
  hapticSound: boolean;
  storeName: string;
  storeSubtitle: string;
  storeAddress: string;
  storePhone: string;
  currency: string;
  receiptFooter: string;
  autoSync: boolean;
  cashierName: string;
}

export interface SyncStats {
  isOnline: boolean;
  pendingCount: number;
  syncedCount: number;
  lastSyncTimestamp: number | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}
