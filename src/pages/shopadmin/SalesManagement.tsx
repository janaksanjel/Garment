import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  ShoppingCart,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  User,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { SalesOrder } from '@/types';

type OrderStatus = SalesOrder['status'];
type PaymentStatus = SalesOrder['paymentStatus'];

const ORDER_STATUS: Record<OrderStatus, { label: string; icon: React.ElementType; badge: string }> = {
  draft:       { label: 'Draft',       icon: FileText,    badge: 'bg-muted text-muted-foreground' },
  confirmed:   { label: 'Confirmed',   icon: CheckCircle2, badge: 'badge-info' },
  processing:  { label: 'Processing',  icon: Clock,        badge: 'badge-warning' },
  shipped:     { label: 'Shipped',     icon: Truck,        badge: 'badge-accent' },
  delivered:   { label: 'Delivered',   icon: PackageCheck, badge: 'badge-success' },
  cancelled:   { label: 'Cancelled',   icon: XCircle,      badge: 'badge-destructive' },
  returned:    { label: 'Returned',    icon: RotateCcw,    badge: 'bg-muted text-muted-foreground' },
};

const PAYMENT_STATUS: Record<PaymentStatus, { label: string; cls: string }> = {
  pending:  { label: 'Pending',  cls: 'text-warning' },
  partial:  { label: 'Partial',  cls: 'text-info' },
  paid:     { label: 'Paid',     cls: 'text-success' },
  refunded: { label: 'Refunded', cls: 'text-destructive' },
};

const PAYMENT_ICONS: Record<SalesOrder['paymentMethod'], React.ElementType> = {
  cash: Banknote, card: CreditCard, bank_transfer: Building2, credit: Receipt,
};

const STATUS_FLOW: OrderStatus[] = ['draft', 'confirmed', 'processing', 'shipped', 'delivered'];

const SalesManagement: React.FC = () => {
  const { activeBrandId } = useAuthStore();
  const { getSalesOrdersByBrand, updateSalesOrder, getCustomersByBrand } = useInventoryStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const orders = activeBrandId ? getSalesOrdersByBrand(activeBrandId) : [];
  const customers = activeBrandId ? getCustomersByBrand(activeBrandId) : [];

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const advanceOrder = (order: SalesOrder) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx >= 0 && idx < STATUS_FLOW.length - 1 && activeBrandId) {
      const next = STATUS_FLOW[idx + 1];
      updateSalesOrder(activeBrandId, order.id, {
        status: next,
        ...(next === 'delivered' ? { paymentStatus: 'paid' } : {}),
      });
    }
  };

  const totalRevenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const pendingPayment = orders.filter((o) => o.paymentStatus === 'pending').reduce((s, o) => s + o.total, 0);

  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const cfg = ORDER_STATUS[status];
    const Icon = cfg.icon;
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1', cfg.badge)}>
        <Icon className="w-3 h-3" /> {cfg.label}
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Sales & POS</h1>
          <p className="text-muted-foreground mt-1">Manage orders, customers & payments</p>
        </div>
        <Button className="btn-accent-gradient gap-2">
          <Plus className="w-4 h-4" /> New Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
            <ShoppingCart className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold">{orders.length}</p>
          <p className="text-xs text-muted-foreground">Total Orders</p>
        </div>
        <div className="card-elevated p-4">
          <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Revenue Collected</p>
        </div>
        <div className="card-elevated p-4">
          <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold">${pendingPayment.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Pending Payment</p>
        </div>
        <div className="card-elevated p-4">
          <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center mb-2">
            <User className="w-4 h-4 text-info" />
          </div>
          <p className="text-2xl font-bold">{customers.length}</p>
          <p className="text-xs text-muted-foreground">Customers</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', statusFilter === 'all' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground')}
        >
          All ({orders.length})
        </button>
        {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', statusFilter === s ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground')}
            >
              {ORDER_STATUS[s].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="card-elevated p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Method</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No orders found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const PayIcon = PAYMENT_ICONS[order.paymentMethod];
                  const payStatus = PAYMENT_STATUS[order.paymentStatus];
                  const canAdvance = STATUS_FLOW.includes(order.status) && STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1;
                  return (
                    <tr key={order.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-accent" />
                          </div>
                          <span className="font-mono font-semibold text-sm">{order.orderNumber}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <span className="text-sm">{order.customerName}</span>
                        </div>
                      </td>
                      <td><StatusBadge status={order.status} /></td>
                      <td>
                        <span className={cn('text-sm font-medium', payStatus.cls)}>{payStatus.label}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <PayIcon className="w-4 h-4" />
                          <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      </td>
                      <td>
                        <span className="font-semibold">${order.total.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {canAdvance && (
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => advanceOrder(order)}>
                              Advance
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Eye className="w-4 h-4" /> View Order
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Edit className="w-4 h-4" /> Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer text-destructive"
                                onClick={() => activeBrandId && updateSalesOrder(activeBrandId, order.id, { status: 'cancelled' })}
                              >
                                <XCircle className="w-4 h-4" /> Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customers Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Customers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="card-elevated p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.city}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-success font-medium">${c.totalPurchases.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{c.loyaltyPoints} pts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SalesManagement;
