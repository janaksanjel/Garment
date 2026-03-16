import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { 
  StockItem, 
  StockMovement, 
  Supplier, 
  CuttingOrder, 
  StitchingTask,
  PackagingBatch,
  WarehouseZone,
  Customer,
  SalesOrder,
  DashboardKPI
} from '@/types';

// Generate sample stock data
const generateSampleStock = (brandId: string, dbname: string): StockItem[] => [
  {
    id: uuidv4(),
    sku: 'RAW-COT-001',
    name: 'Premium Cotton Fabric',
    category: 'raw_material',
    supplierId: 'sup-1',
    quantity: 500,
    minQuantity: 100,
    unitPrice: 12.50,
    unit: 'meters',
    location: 'Zone A - Shelf 1',
    brandId,
    dbname,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    sku: 'RAW-SLK-002',
    name: 'Silk Blend Material',
    category: 'raw_material',
    supplierId: 'sup-2',
    quantity: 75,
    minQuantity: 50,
    unitPrice: 45.00,
    unit: 'meters',
    location: 'Zone A - Shelf 2',
    brandId,
    dbname,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    sku: 'FIN-SHR-001',
    name: 'Classic Dress Shirt - White',
    category: 'finished_goods',
    supplierId: 'sup-1',
    quantity: 250,
    minQuantity: 50,
    unitPrice: 35.00,
    unit: 'pieces',
    location: 'Zone C - Shelf 1',
    brandId,
    dbname,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    sku: 'FIN-TRS-002',
    name: 'Slim Fit Trousers - Navy',
    category: 'finished_goods',
    supplierId: 'sup-1',
    quantity: 180,
    minQuantity: 40,
    unitPrice: 55.00,
    unit: 'pieces',
    location: 'Zone C - Shelf 2',
    brandId,
    dbname,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    sku: 'ACC-BTN-001',
    name: 'Pearl Buttons Pack',
    category: 'accessory',
    supplierId: 'sup-3',
    quantity: 2000,
    minQuantity: 500,
    unitPrice: 0.25,
    unit: 'pieces',
    location: 'Zone B - Shelf 1',
    brandId,
    dbname,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    sku: 'ACC-ZIP-002',
    name: 'Metal Zippers 6 inch',
    category: 'accessory',
    supplierId: 'sup-3',
    quantity: 45,
    minQuantity: 100,
    unitPrice: 1.50,
    unit: 'pieces',
    location: 'Zone B - Shelf 2',
    brandId,
    dbname,
    lastUpdated: new Date().toISOString(),
  },
];

const generateSampleSuppliers = (brandId: string): Supplier[] => [
  {
    id: 'sup-1',
    name: 'Premium Textiles Ltd',
    contactPerson: 'Robert Chen',
    email: 'robert@premiumtextiles.com',
    phone: '+1 555-1001',
    address: '456 Industrial Ave, Textile City',
    brandId,
  },
  {
    id: 'sup-2',
    name: 'Silk World Imports',
    contactPerson: 'Maria Santos',
    email: 'maria@silkworld.com',
    phone: '+1 555-1002',
    address: '789 Trade Lane, Import District',
    brandId,
  },
  {
    id: 'sup-3',
    name: 'Accessories Pro',
    contactPerson: 'David Kim',
    email: 'david@accessoriespro.com',
    phone: '+1 555-1003',
    address: '321 Supply Street, Commerce Park',
    brandId,
  },
];

const generateSampleCuttingOrders = (brandId: string): CuttingOrder[] => [
  {
    id: uuidv4(),
    batchCode: 'AC-2024-001',
    status: 'in_progress',
    assignedTo: ['manager-1'],
    sizes: [
      { size: 'S', quantity: 50, completed: 30 },
      { size: 'M', quantity: 100, completed: 80 },
      { size: 'L', quantity: 75, completed: 50 },
      { size: 'XL', quantity: 25, completed: 10 },
    ],
    colors: ['White', 'Navy', 'Black'],
    totalPieces: 250,
    completedPieces: 170,
    wastage: 5,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    brandId,
  },
  {
    id: uuidv4(),
    batchCode: 'AC-2024-002',
    status: 'pending',
    assignedTo: [],
    sizes: [
      { size: 'M', quantity: 80, completed: 0 },
      { size: 'L', quantity: 60, completed: 0 },
    ],
    colors: ['Beige', 'Olive'],
    totalPieces: 140,
    completedPieces: 0,
    wastage: 0,
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    brandId,
  },
];

const generateSampleCustomers = (brandId: string): Customer[] => [
  {
    id: uuidv4(),
    name: 'Fashion Forward Retail',
    email: 'orders@fashionforward.com',
    phone: '+1 555-2001',
    address: '100 Retail Plaza',
    city: 'Los Angeles',
    totalPurchases: 45000,
    loyaltyPoints: 4500,
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    brandId,
  },
  {
    id: uuidv4(),
    name: 'Elite Boutique',
    email: 'purchasing@eliteboutique.com',
    phone: '+1 555-2002',
    address: '250 Luxury Lane',
    city: 'Miami',
    totalPurchases: 78500,
    loyaltyPoints: 7850,
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    brandId,
  },
  {
    id: uuidv4(),
    name: 'Urban Style Co',
    email: 'buy@urbanstyle.com',
    phone: '+1 555-2003',
    address: '75 Downtown St',
    city: 'Chicago',
    totalPurchases: 32000,
    loyaltyPoints: 3200,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    brandId,
  },
];

interface InventoryStore {
  // Stock
  stockItems: Record<string, StockItem[]>;
  suppliers: Record<string, Supplier[]>;
  stockMovements: Record<string, StockMovement[]>;
  
  // Production
  cuttingOrders: Record<string, CuttingOrder[]>;
  stitchingTasks: Record<string, StitchingTask[]>;
  packagingBatches: Record<string, PackagingBatch[]>;
  
  // Warehouse
  warehouseZones: Record<string, WarehouseZone[]>;
  
  // Sales
  customers: Record<string, Customer[]>;
  salesOrders: Record<string, SalesOrder[]>;
  
  // Initialize brand data
  initializeBrandData: (brandId: string, dbname: string) => void;
  
  // Stock operations
  getStockByBrand: (brandId: string) => StockItem[];
  addStockItem: (item: Omit<StockItem, 'id' | 'lastUpdated'>) => void;
  updateStockItem: (brandId: string, itemId: string, updates: Partial<StockItem>) => void;
  recordStockMovement: (movement: Omit<StockMovement, 'id' | 'performedAt'>) => void;
  getLowStockItems: (brandId: string) => StockItem[];
  
  // Supplier operations
  getSuppliersByBrand: (brandId: string) => Supplier[];
  
  // Cutting operations
  getCuttingOrdersByBrand: (brandId: string) => CuttingOrder[];
  
  // Customer operations
  getCustomersByBrand: (brandId: string) => Customer[];
  
  // Dashboard KPIs
  getDashboardKPIs: (brandId: string) => DashboardKPI;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      stockItems: {
        'anee-clothing': generateSampleStock('anee-clothing', 'anee_clothing_db'),
      },
      suppliers: {
        'anee-clothing': generateSampleSuppliers('anee-clothing'),
      },
      stockMovements: {},
      cuttingOrders: {
        'anee-clothing': generateSampleCuttingOrders('anee-clothing'),
      },
      stitchingTasks: {},
      packagingBatches: {},
      warehouseZones: {},
      customers: {
        'anee-clothing': generateSampleCustomers('anee-clothing'),
      },
      salesOrders: {},

      initializeBrandData: (brandId, dbname) => {
        const state = get();
        if (!state.stockItems[brandId]) {
          set({
            stockItems: {
              ...state.stockItems,
              [brandId]: generateSampleStock(brandId, dbname),
            },
            suppliers: {
              ...state.suppliers,
              [brandId]: generateSampleSuppliers(brandId),
            },
            cuttingOrders: {
              ...state.cuttingOrders,
              [brandId]: generateSampleCuttingOrders(brandId),
            },
            customers: {
              ...state.customers,
              [brandId]: generateSampleCustomers(brandId),
            },
          });
        }
      },

      getStockByBrand: (brandId) => {
        return get().stockItems[brandId] || [];
      },

      addStockItem: (item) => {
        const newItem: StockItem = {
          ...item,
          id: uuidv4(),
          lastUpdated: new Date().toISOString(),
        };
        
        set((state) => ({
          stockItems: {
            ...state.stockItems,
            [item.brandId]: [...(state.stockItems[item.brandId] || []), newItem],
          },
        }));
      },

      updateStockItem: (brandId, itemId, updates) => {
        set((state) => ({
          stockItems: {
            ...state.stockItems,
            [brandId]: (state.stockItems[brandId] || []).map((item) =>
              item.id === itemId
                ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
                : item
            ),
          },
        }));
      },

      recordStockMovement: (movement) => {
        const newMovement: StockMovement = {
          ...movement,
          id: uuidv4(),
          performedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          stockMovements: {
            ...state.stockMovements,
            [movement.brandId]: [
              ...(state.stockMovements[movement.brandId] || []),
              newMovement,
            ],
          },
        }));
      },

      getLowStockItems: (brandId) => {
        const items = get().stockItems[brandId] || [];
        return items.filter((item) => item.quantity <= item.minQuantity);
      },

      getSuppliersByBrand: (brandId) => {
        return get().suppliers[brandId] || [];
      },

      getCuttingOrdersByBrand: (brandId) => {
        return get().cuttingOrders[brandId] || [];
      },

      getCustomersByBrand: (brandId) => {
        return get().customers[brandId] || [];
      },

      getDashboardKPIs: (brandId) => {
        const stock = get().stockItems[brandId] || [];
        const orders = get().cuttingOrders[brandId] || [];
        const customers = get().customers[brandId] || [];
        
        const totalStockValue = stock.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        );
        
        const lowStockItems = stock.filter(
          (item) => item.quantity <= item.minQuantity
        ).length;
        
        const productionProgress = orders.reduce(
          (sum, order) => sum + order.completedPieces,
          0
        );
        
        const productionTarget = orders.reduce(
          (sum, order) => sum + order.totalPieces,
          0
        );
        
        return {
          totalStockValue,
          stockValueChange: 12.5,
          productionProgress,
          productionTarget,
          salesToday: 8450,
          salesChange: 8.3,
          lowStockItems,
          pendingOrders: orders.filter((o) => o.status === 'pending').length,
          activeWorkers: 24,
          returnRate: 2.1,
        };
      },
    }),
    {
      name: 'gms-inventory-storage',
    }
  )
);
