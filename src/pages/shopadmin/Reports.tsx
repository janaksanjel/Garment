import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Scissors,
  Shirt,
  PackageOpen,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = ['Overview', 'Production', 'Stock', 'Sales'] as const;
type Tab = typeof tabs[number];

const Reports: React.FC = () => {
  const { activeBrandId } = useAuthStore();
  const {
    getDashboardKPIs,
    getStockByBrand,
    getCuttingOrdersByBrand,
    getStitchingTasksByBrand,
    getPackagingBatchesByBrand,
    getSalesOrdersByBrand,
    getLowStockItems,
  } = useInventoryStore();

  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const kpis       = activeBrandId ? getDashboardKPIs(activeBrandId) : null;
  const stock      = activeBrandId ? getStockByBrand(activeBrandId) : [];
  const cutting    = activeBrandId ? getCuttingOrdersByBrand(activeBrandId) : [];
  const stitching  = activeBrandId ? getStitchingTasksByBrand(activeBrandId) : [];
  const packaging  = activeBrandId ? getPackagingBatchesByBrand(activeBrandId) : [];
  const sales      = activeBrandId ? getSalesOrdersByBrand(activeBrandId) : [];
  const lowStock   = activeBrandId ? getLowStockItems(activeBrandId) : [];

  const totalStockValue = stock.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalSalesValue = sales.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);

  const stockByCategory = ['raw_material', 'finished_goods', 'accessory', 'packaging'].map((cat) => {
    const items = stock.filter((i) => i.category === cat);
    return {
      label: cat.replace('_', ' '),
      count: items.length,
      value: items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
      qty: items.reduce((s, i) => s + i.quantity, 0),
    };
  });

  const productionSummary = [
    { label: 'Cutting',   total: cutting.reduce((s, o) => s + o.totalPieces, 0),   done: cutting.reduce((s, o) => s + o.completedPieces, 0),   icon: Scissors,    color: 'text-info',    bg: 'bg-info/10' },
    { label: 'Stitching', total: stitching.reduce((s, t) => s + t.totalPieces, 0), done: stitching.reduce((s, t) => s + t.completedPieces, 0), icon: Shirt,       color: 'text-accent',  bg: 'bg-accent/10' },
    { label: 'Packaging', total: packaging.reduce((s, b) => s + b.totalPieces, 0), done: packaging.reduce((s, b) => s + b.packagedPieces, 0),  icon: PackageOpen, color: 'text-success', bg: 'bg-success/10' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Stock, production & sales performance overview</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Stock Value',      value: `रु${totalStockValue.toLocaleString()}`, icon: Package,      bg: 'bg-info/10',        color: 'text-info',        trend: '+12.5%', up: true },
              { label: 'Revenue Collected',value: `रु${totalSalesValue.toLocaleString()}`, icon: DollarSign,   bg: 'bg-success/10',     color: 'text-success',     trend: '+8.3%',  up: true },
              { label: 'Low Stock Alerts', value: lowStock.length,                        icon: AlertTriangle, bg: 'bg-destructive/10', color: 'text-destructive', trend: '',       up: false },
              { label: 'Active Orders',    value: sales.filter((o) => !['delivered','cancelled','returned'].includes(o.status)).length, icon: ShoppingCart, bg: 'bg-warning/10', color: 'text-warning', trend: '', up: true },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="card-elevated p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', kpi.bg)}>
                      <Icon className={cn('w-5 h-5', kpi.color)} />
                    </div>
                    {kpi.trend && (
                      <span className={cn('text-xs font-medium flex items-center gap-0.5', kpi.up ? 'text-success' : 'text-destructive')}>
                        {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {kpi.trend}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                </div>
              );
            })}
          </div>

          {/* Production Pipeline */}
          <div className="card-elevated p-5">
            <h3 className="font-semibold mb-4">Production Pipeline</h3>
            <div className="space-y-4">
              {productionSummary.map((stage) => {
                const pct = stage.total > 0 ? Math.round((stage.done / stage.total) * 100) : 0;
                const Icon = stage.icon;
                return (
                  <div key={stage.label} className="flex items-center gap-4">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', stage.bg)}>
                      <Icon className={cn('w-4 h-4', stage.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{stage.label}</span>
                        <span className="text-muted-foreground">{stage.done} / {stage.total} pcs</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', stage.color.replace('text-', 'bg-'))} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-semibold w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCTION ── */}
      {activeTab === 'Production' && (
        <div className="space-y-6">
          {[
            { title: 'Cutting Orders', items: cutting, getCode: (o: any) => o.batchCode, getProgress: (o: any) => ({ done: o.completedPieces, total: o.totalPieces }), icon: Scissors, color: 'text-info', bg: 'bg-info/10' },
            { title: 'Stitching Tasks', items: stitching, getCode: (o: any) => o.batchCode, getProgress: (o: any) => ({ done: o.completedPieces, total: o.totalPieces }), icon: Shirt, color: 'text-accent', bg: 'bg-accent/10' },
            { title: 'Packaging Batches', items: packaging, getCode: (o: any) => o.batchCode, getProgress: (o: any) => ({ done: o.packagedPieces, total: o.totalPieces }), icon: PackageOpen, color: 'text-success', bg: 'bg-success/10' },
          ].map((section) => (
            <div key={section.title} className="card-elevated overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', section.bg)}>
                  <section.icon className={cn('w-4 h-4', section.color)} />
                </div>
                <h3 className="font-semibold">{section.title}</h3>
                <span className="ml-auto text-sm text-muted-foreground">{section.items.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="table-premium">
                  <thead>
                    <tr>
                      <th>Batch Code</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No records</td></tr>
                    ) : section.items.map((item: any) => {
                      const { done, total } = section.getProgress(item);
                      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                      return (
                        <tr key={item.id}>
                          <td><span className="font-mono font-semibold">{section.getCode(item)}</span></td>
                          <td>
                            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                              item.status === 'completed' ? 'badge-success' :
                              item.status === 'in_progress' ? 'badge-info' :
                              item.status === 'pending' ? 'badge-warning' : 'bg-muted text-muted-foreground'
                            )}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="w-32">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </td>
                          <td><span className="font-semibold">{pct}%</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STOCK ── */}
      {activeTab === 'Stock' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stockByCategory.map((cat) => (
              <div key={cat.label} className="card-elevated p-4">
                <p className="text-sm font-medium capitalize mb-1">{cat.label}</p>
                <p className="text-2xl font-bold">{cat.count}</p>
                <p className="text-xs text-muted-foreground">{cat.qty.toLocaleString()} units</p>
                <p className="text-xs text-success font-medium mt-1">रु{cat.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {lowStock.length > 0 && (
            <div className="card-elevated overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <h3 className="font-semibold">Low Stock Alerts</h3>
                <span className="ml-auto text-sm text-destructive font-medium">{lowStock.length} items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="table-premium">
                  <thead>
                    <tr><th>Item</th><th>SKU</th><th>Current</th><th>Minimum</th><th>Deficit</th></tr>
                  </thead>
                  <tbody>
                    {lowStock.map((item) => (
                      <tr key={item.id}>
                        <td><span className="font-medium">{item.name}</span></td>
                        <td><span className="font-mono text-xs">{item.sku}</span></td>
                        <td><span className="text-destructive font-semibold">{item.quantity}</span></td>
                        <td><span className="text-muted-foreground">{item.minQuantity}</span></td>
                        <td><span className="text-destructive font-medium">{item.minQuantity - item.quantity}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Full Stock List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr><th>Name</th><th>SKU</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Value</th><th>Location</th></tr>
                </thead>
                <tbody>
                  {stock.map((item) => (
                    <tr key={item.id}>
                      <td><span className="font-medium">{item.name}</span></td>
                      <td><span className="font-mono text-xs">{item.sku}</span></td>
                      <td><span className="capitalize text-sm text-muted-foreground">{item.category.replace('_', ' ')}</span></td>
                      <td>
                        <span className={cn('font-semibold', item.quantity <= item.minQuantity ? 'text-destructive' : '')}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td><span className="text-sm">रु{item.unitPrice.toFixed(2)}</span></td>
                      <td><span className="font-semibold text-success">रु{(item.quantity * item.unitPrice).toLocaleString()}</span></td>
                      <td><span className="text-xs text-muted-foreground">{item.location}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SALES ── */}
      {activeTab === 'Sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders',   value: sales.length,                                                                                  icon: ShoppingCart, bg: 'bg-accent/10',      color: 'text-accent' },
              { label: 'Delivered',      value: sales.filter((o) => o.status === 'delivered').length,                                          icon: CheckCircle2, bg: 'bg-success/10',     color: 'text-success' },
              { label: 'In Progress',    value: sales.filter((o) => ['confirmed','processing','shipped'].includes(o.status)).length,            icon: Clock,        bg: 'bg-warning/10',     color: 'text-warning' },
              { label: 'Cancelled',      value: sales.filter((o) => o.status === 'cancelled').length,                                          icon: AlertTriangle, bg: 'bg-destructive/10', color: 'text-destructive' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card-elevated p-4">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-2', s.bg)}>
                    <Icon className={cn('w-4 h-4', s.color)} />
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              );
            })}
          </div>

          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Sales Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr><th>Order #</th><th>Customer</th><th>Status</th><th>Payment</th><th>Items</th><th>Total</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {sales.map((order) => (
                    <tr key={order.id}>
                      <td><span className="font-mono font-semibold">{order.orderNumber}</span></td>
                      <td><span className="text-sm">{order.customerName}</span></td>
                      <td>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                          order.status === 'delivered' ? 'badge-success' :
                          order.status === 'processing' ? 'badge-warning' :
                          order.status === 'cancelled' ? 'badge-destructive' : 'badge-info'
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className={cn('text-sm font-medium',
                          order.paymentStatus === 'paid' ? 'text-success' :
                          order.paymentStatus === 'pending' ? 'text-warning' : 'text-muted-foreground'
                        )}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td><span className="text-sm">{order.items.length}</span></td>
                      <td><span className="font-semibold">रु{order.total.toLocaleString()}</span></td>
                      <td><span className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Reports;
