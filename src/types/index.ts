// ================================
// GARMENT MANAGEMENT SYSTEM TYPES
// ================================

// User & Auth Types
export type UserRole = 
  | 'super_admin'      // Global god user - can manage all brands/DBs/users
  | 'admin'            // Brand-level admin
  | 'production_manager'
  | 'store_manager'
  | 'cutting_supervisor'
  | 'stitching_supervisor'
  | 'sales_staff'
  | 'shop_admin';      // Shop operations admin

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  brandId: string | null; // null for super_admin (global)
  avatar?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeBrandId: string | null;
  activeDbName: string | null;
}

// Brand & Multi-tenancy Types
export interface BrandMoreInfo {
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  description: string;
  taxId: string;
  website?: string;
  foundedYear?: number;
}

export interface Brand {
  id: string;
  name: string;
  dbname: string;
  logoUrl: string;
  moreInfo: BrandMoreInfo;
  primaryColor?: string;
  createdAt: string;
  isActive: boolean;
  userCount: number;
}

// Stock Management Types
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  brandId: string;
}

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: 'raw_material' | 'finished_goods' | 'accessory' | 'packaging';
  supplierId: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  unit: string;
  location: string;
  imageUrl?: string;
  brandId: string;
  dbname: string;
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  performedBy: string;
  performedAt: string;
  brandId: string;
}

// Production Types
export interface CuttingOrder {
  id: string;
  batchCode: string;
  salesOrderId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string[];
  sizes: SizeQuantity[];
  colors: string[];
  totalPieces: number;
  completedPieces: number;
  wastage: number;
  wastageReason?: string;
  createdAt: string;
  dueDate: string;
  brandId: string;
}

export interface SizeQuantity {
  size: string;
  quantity: number;
  completed: number;
}

export interface StitchingTask {
  id: string;
  cuttingOrderId: string;
  batchCode: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'quality_check' | 'completed' | 'rejected';
  assignedTo: string;
  memberName: string;
  totalPieces: number;
  completedPieces: number;
  rejectedPieces: number;
  rejectionReason?: string;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  brandId: string;
}

export interface PackagingBatch {
  id: string;
  stitchingTaskId: string;
  batchCode: string;
  status: 'pending' | 'in_progress' | 'completed';
  totalPieces: number;
  packagedPieces: number;
  damagedPieces: number;
  damageReasons: string[];
  labelGenerated: boolean;
  createdAt: string;
  brandId: string;
}

// Warehouse Types
export interface WarehouseZone {
  id: string;
  name: string;
  type: 'raw' | 'wip' | 'finished' | 'returns';
  capacity: number;
  currentStock: number;
  shelves: Shelf[];
  brandId: string;
}

export interface Shelf {
  id: string;
  name: string;
  capacity: number;
  currentStock: number;
  items: string[]; // StockItem IDs
}

// Sales & POS Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalPurchases: number;
  loyaltyPoints: number;
  createdAt: string;
  brandId: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'credit';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  notes?: string;
  createdAt: string;
  createdBy: string;
  brandId: string;
}

export interface OrderItem {
  id: string;
  stockItemId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface SalesReturn {
  id: string;
  salesOrderId: string;
  orderNumber: string;
  items: ReturnItem[];
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  refundAmount: number;
  createdAt: string;
  processedAt?: string;
  brandId: string;
}

export interface ReturnItem {
  orderItemId: string;
  productName: string;
  quantity: number;
  reason: string;
  condition: 'good' | 'damaged' | 'defective';
}

// Report Types
export interface DashboardKPI {
  totalStockValue: number;
  stockValueChange: number;
  productionProgress: number;
  productionTarget: number;
  salesToday: number;
  salesChange: number;
  lowStockItems: number;
  pendingOrders: number;
  activeWorkers: number;
  returnRate: number;
}

export interface StockReport {
  date: string;
  totalItems: number;
  totalValue: number;
  inMovements: number;
  outMovements: number;
  lowStockAlerts: number;
}

export interface SalesReport {
  date: string;
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  brandId: string | null;
  createdAt: string;
}
