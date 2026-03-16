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

const generateSampleStitchingTasks = (brandId: string): StitchingTask[] => [
  {
    id: uuidv4(),
    cuttingOrderId: 'cut-1',
    batchCode: 'ST-2024-001',
    status: 'in_progress',
    assignedTo: 'worker-1',
    memberName: 'Ayesha Malik',
    totalPieces: 170,
    completedPieces: 90,
    rejectedPieces: 5,
    startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    brandId,
  },
  {
    id: uuidv4(),
    cuttingOrderId: 'cut-2',
    batchCode: 'ST-2024-002',
    status: 'pending',
    assignedTo: '',
    memberName: 'Unassigned',
    totalPieces: 140,
    completedPieces: 0,
    rejectedPieces: 0,
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    brandId,
  },
  {
    id: uuidv4(),
    cuttingOrderId: 'cut-1',
    batchCode: 'ST-2024-003',
    status: 'quality_check',
    assignedTo: 'worker-2',
    memberName: 'Bilal Ahmed',
    totalPieces: 80,
    completedPieces: 80,
    rejectedPieces: 2,
    rejectionReason: 'Seam misalignment',
    startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    brandId,
  },
  {
    id: uuidv4(),
    cuttingOrderId: 'cut-3',
    batchCode: 'ST-2024-004',
    status: 'completed',
    assignedTo: 'worker-3',
    memberName: 'Sara Khan',
    totalPieces: 60,
    completedPieces: 58,
    rejectedPieces: 2,
    startDate: new Date(Date.now() - 86400000 * 8).toISOString(),
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    completedDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    brandId,
  },
];

const generateSamplePackagingBatches = (brandId: string): PackagingBatch[] => [
  {
    id: uuidv4(),
    stitchingTaskId: 'st-4',
    batchCode: 'PK-2024-001',
    status: 'completed',
    totalPieces: 58,
    packagedPieces: 58,
    damagedPieces: 1,
    damageReasons: ['Packaging tear'],
    labelGenerated: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    brandId,
  },
  {
    id: uuidv4(),
    stitchingTaskId: 'st-3',
    batchCode: 'PK-2024-002',
    status: 'in_progress',
    totalPieces: 78,
    packagedPieces: 40,
    damagedPieces: 0,
    damageReasons: [],
    labelGenerated: false,
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    brandId,
  },
  {
    id: uuidv4(),
    stitchingTaskId: 'st-1',
    batchCode: 'PK-2024-003',
    status: 'pending',
    totalPieces: 90,
    packagedPieces: 0,
    damagedPieces: 0,
    damageReasons: [],
    labelGenerated: false,
    createdAt: new Date().toISOString(),
    brandId,
  },
];

const generateSampleWarehouseZones = (brandId: string): WarehouseZone[] => [
  {
    id: 'zone-a',
    name: 'Zone A – Raw Materials',
    type: 'raw',
    capacity: 1000,
    currentStock: 575,
    shelves: [
      { id: 'a1', name: 'Shelf A-1', capacity: 300, currentStock: 500, items: [] },
      { id: 'a2', name: 'Shelf A-2', capacity: 300, currentStock: 75,  items: [] },
      { id: 'a3', name: 'Shelf A-3', capacity: 400, currentStock: 0,   items: [] },
    ],
    brandId,
  },
  {
    id: 'zone-b',
    name: 'Zone B – Accessories',
    type: 'wip',
    capacity: 500,
    currentStock: 2045,
    shelves: [
      { id: 'b1', name: 'Shelf B-1', capacity: 300, currentStock: 2000, items: [] },
      { id: 'b2', name: 'Shelf B-2', capacity: 200, currentStock: 45,   items: [] },
    ],
    brandId,
  },
  {
    id: 'zone-c',
    name: 'Zone C – Finished Goods',
    type: 'finished',
    capacity: 800,
    currentStock: 430,
    shelves: [
      { id: 'c1', name: 'Shelf C-1', capacity: 400, currentStock: 250, items: [] },
      { id: 'c2', name: 'Shelf C-2', capacity: 400, currentStock: 180, items: [] },
    ],
    brandId,
  },
  {
    id: 'zone-d',
    name: 'Zone D – Returns',
    type: 'returns',
    capacity: 200,
    currentStock: 18,
    shelves: [
      { id: 'd1', name: 'Shelf D-1', capacity: 200, currentStock: 18, items: [] },
    ],
    brandId,
  },
];

const generateSampleSalesOrders = (brandId: string): SalesOrder[] => [
  {
    id: uuidv4(),
    orderNumber: 'SO-2024-001',
    customerId: 'cust-1',
    customerName: 'Fashion Forward Retail',
    status: 'delivered',
    items: [
      { id: uuidv4(), stockItemId: 'fin-1', productName: 'Classic Dress Shirt - White', sku: 'FIN-SHR-001', quantity: 50, unitPrice: 35, discount: 5, total: 1662.5 },
      { id: uuidv4(), stockItemId: 'fin-2', productName: 'Slim Fit Trousers - Navy',    sku: 'FIN-TRS-002', quantity: 30, unitPrice: 55, discount: 0, total: 1650 },
    ],
    subtotal: 3312.5, discount: 5, tax: 165.6, total: 3473,
    paymentMethod: 'bank_transfer', paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdBy: 'manager-1', brandId,
  },
  {
    id: uuidv4(),
    orderNumber: 'SO-2024-002',
    customerId: 'cust-2',
    customerName: 'Elite Boutique',
    status: 'processing',
    items: [
      { id: uuidv4(), stockItemId: 'fin-1', productName: 'Classic Dress Shirt - White', sku: 'FIN-SHR-001', quantity: 80, unitPrice: 35, discount: 10, total: 2520 },
    ],
    subtotal: 2520, discount: 10, tax: 126, total: 2636,
    paymentMethod: 'card', paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    createdBy: 'manager-1', brandId,
  },
  {
    id: uuidv4(),
    orderNumber: 'SO-2024-003',
    customerId: 'cust-3',
    customerName: 'Urban Style Co',
    status: 'confirmed',
    items: [
      { id: uuidv4(), stockItemId: 'fin-2', productName: 'Slim Fit Trousers - Navy', sku: 'FIN-TRS-002', quantity: 40, unitPrice: 55, discount: 0, total: 2200 },
    ],
    subtotal: 2200, discount: 0, tax: 110, total: 2310,
    paymentMethod: 'cash', paymentStatus: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdBy: 'manager-1', brandId,
  },
  {
    id: uuidv4(),
    orderNumber: 'SO-2024-004',
    customerId: 'cust-1',
    customerName: 'Fashion Forward Retail',
    status: 'draft',
    items: [
      { id: uuidv4(), stockItemId: 'fin-1', productName: 'Classic Dress Shirt - White', sku: 'FIN-SHR-001', quantity: 20, unitPrice: 35, discount: 0, total: 700 },
    ],
    subtotal: 700, discount: 0, tax: 35, total: 735,
    paymentMethod: 'credit', paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: 'manager-1', brandId,
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
  getWarehouseZonesByBrand: (brandId: string) => WarehouseZone[];
  
  // Sales
  customers: Record<string, Customer[]>;
  salesOrders: Record<string, SalesOrder[]>;
  getSalesOrdersByBrand: (brandId: string) => SalesOrder[];
  addSalesOrder: (order: Omit<SalesOrder, 'id' | 'createdAt'>) => void;
  updateSalesOrder: (brandId: string, orderId: string, updates: Partial<SalesOrder>) => void;
  
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
  
  // Stitching operations
  getStitchingTasksByBrand: (brandId: string) => StitchingTask[];
  updateStitchingTask: (brandId: string, taskId: string, updates: Partial<StitchingTask>) => void;
  
  // Packaging operations
  getPackagingBatchesByBrand: (brandId: string) => PackagingBatch[];
  updatePackagingBatch: (brandId: string, batchId: string, updates: Partial<PackagingBatch>) => void;
  
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
      stitchingTasks: {
        'anee-clothing': generateSampleStitchingTasks('anee-clothing'),
      },
      packagingBatches: {
        'anee-clothing': generateSamplePackagingBatches('anee-clothing'),
      },
      warehouseZones: {
        'anee-clothing': generateSampleWarehouseZones('anee-clothing'),
      },
      customers: {
        'anee-clothing': generateSampleCustomers('anee-clothing'),
      },
      salesOrders: {
        'anee-clothing': generateSampleSalesOrders('anee-clothing'),
      },

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
            stitchingTasks: {
              ...state.stitchingTasks,
              [brandId]: generateSampleStitchingTasks(brandId),
            },
            packagingBatches: {
              ...state.packagingBatches,
              [brandId]: generateSamplePackagingBatches(brandId),
            },
            warehouseZones: {
              ...state.warehouseZones,
              [brandId]: generateSampleWarehouseZones(brandId),
            },
            customers: {
              ...state.customers,
              [brandId]: generateSampleCustomers(brandId),
            },
            salesOrders: {
              ...state.salesOrders,
              [brandId]: generateSampleSalesOrders(brandId),
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

      getStitchingTasksByBrand: (brandId) => {
        return get().stitchingTasks[brandId] || [];
      },

      updateStitchingTask: (brandId, taskId, updates) => {
        set((state) => ({
          stitchingTasks: {
            ...state.stitchingTasks,
            [brandId]: (state.stitchingTasks[brandId] || []).map((t) =>
              t.id === taskId ? { ...t, ...updates } : t
            ),
          },
        }));
      },

      getPackagingBatchesByBrand: (brandId) => {
        return get().packagingBatches[brandId] || [];
      },

      updatePackagingBatch: (brandId, batchId, updates) => {
        set((state) => ({
          packagingBatches: {
            ...state.packagingBatches,
            [brandId]: (state.packagingBatches[brandId] || []).map((b) =>
              b.id === batchId ? { ...b, ...updates } : b
            ),
          },
        }));
      },

      getWarehouseZonesByBrand: (brandId) => {
        return get().warehouseZones[brandId] || [];
      },

      getSalesOrdersByBrand: (brandId) => {
        return get().salesOrders[brandId] || [];
      },

      addSalesOrder: (order) => {
        const newOrder: SalesOrder = { ...order, id: uuidv4(), createdAt: new Date().toISOString() };
        set((state) => ({
          salesOrders: {
            ...state.salesOrders,
            [order.brandId]: [...(state.salesOrders[order.brandId] || []), newOrder],
          },
        }));
      },

      updateSalesOrder: (brandId, orderId, updates) => {
        set((state) => ({
          salesOrders: {
            ...state.salesOrders,
            [brandId]: (state.salesOrders[brandId] || []).map((o) =>
              o.id === orderId ? { ...o, ...updates } : o
            ),
          },
        }));
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
