import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  ShoppingCart, Plus, Search, Clock, CheckCircle2, Truck, PackageCheck,
  XCircle, RotateCcw, FileText, Eye, Edit, User, CreditCard, Banknote,
  Building2, Receipt, TrendingUp, Trash2, MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { SalesOrder, StockItem } from '@/types';

type OrderStatus = SalesOrder['status'];
type PaymentStatus = SalesOrder['paymentStatus'];

type CartItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
};

const ORDER_STATUS: Record<OrderStatus, { label: string; icon: React.ElementType; badge: string }> = {
  draft:      { label: 'Draft',      icon: FileText,     badge: 'bg-muted text-muted-foreground' },
  confirmed:  { label: 'Confirmed',  icon: CheckCircle2, badge: 'bg-info/10 text-info' },
  processing: { label: 'Processing', icon: Clock,         badge: 'bg-warning/10 text-warning' },
  shipped:    { label: 'Shipped',    icon: Truck,         badge: 'bg-accent/10 text-accent' },
  delivered:  { label: 'Delivered',  icon: PackageCheck,  badge: 'bg-success/10 text-success' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,       badge: 'bg-destructive/10 text-destructive' },
  returned:   { label: 'Returned',   icon: RotateCcw,     badge: 'bg-muted text-muted-foreground' },
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

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const cfg = ORDER_STATUS[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1', cfg.badge)}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
};

const SalesManagement: React.FC = () => {
  const { activeBrandId } = useAuthStore();
  const { getSalesOrdersByBrand, addSalesOrder, updateSalesOrder, getCustomersByBrand, getStockByBrand } = useInventoryStore();

  const orders = activeBrandId ? getSalesOrdersByBrand(activeBrandId) : [];
  const customers = activeBrandId ? getCustomersByBrand(activeBrandId) : [];
  const stockItems = activeBrandId ? getStockByBrand(activeBrandId) : [];
  const finishedGoods = stockItems.filter((s) => s.category === 'finished_goods');

  // POS state
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<SalesOrder['paymentMethod']>('cash');
  const [showCheckout, setShowCheckout] = useState(false);

  // History state
  const [historySearch, setHistorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredProducts = finishedGoods.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(historySearch.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const addToCart = (item: StockItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: item.id, name: item.name, sku: item.sku, price: item.unitPrice, qty: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) { setCart((prev) => prev.filter((c) => c.id !== id)); return; }
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, qty } : c));
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = subtotal * 0.13;
  const total = subtotal - discount + tax;

  const handleConfirmOrder = () => {
    if (!selectedCustomer || cart.length === 0 || !activeBrandId) return;
    const customer = customers.find((c) => c.id === selectedCustomer);
    addSalesOrder({
      orderNumber: `SO-${Date.now()}`,
      customerId: selectedCustomer,
      customerName: customer?.name || 'Unknown',
      status: 'confirmed',
      items: cart.map((c) => ({
        id: crypto.randomUUID(),
        stockItemId: c.id,
        productName: c.name,
        sku: c.sku,
        quantity: c.qty,
        unitPrice: c.price,
        discount: 0,
        total: c.price * c.qty,
      })),
      subtotal,
      discount,
      tax,
      total,
      paymentMethod,
      paymentStatus: 'paid',
      createdBy: 'manager',
      brandId: activeBrandId,
    });
    setCart([]);
    setSelectedCustomer('');
    setDiscount(0);
    setShowCheckout(false);
  };

  const advanceOrder = (order: SalesOrder) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx >= 0 && idx < STATUS_FLOW.length - 1 && activeBrandId) {
      updateSalesOrder(activeBrandId, order.id, {
        status: STATUS_FLOW[idx + 1],
        ...(STATUS_FLOW[idx + 1] === 'delivered' ? { paymentStatus: 'paid' } : {}),
      });
    }
  };

  const totalRevenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const pendingPayment = orders.filter((o) => o.paymentStatus === 'pending').reduce((s, o) => s + o.total, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Sales & POS</h1>
          <p className="text-muted-foreground mt-1">Manage orders, customers & payments</p>
        </div>
      </div>

      {/* Stats */}
      {/*<div className="grid grid-cols-2 md:grid-cols-4 gap-4">*/}
      {/*  <div className="card-elevated p-4">*/}
      {/*    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-2">*/}
      {/*      <ShoppingCart className="w-4 h-4 text-accent" />*/}
      {/*    </div>*/}
      {/*    <p className="text-2xl font-bold">{orders.length}</p>*/}
      {/*    <p className="text-xs text-muted-foreground">Total Orders</p>*/}
      {/*  </div>*/}
      {/*  <div className="card-elevated p-4">*/}
      {/*    <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center mb-2">*/}
      {/*      <TrendingUp className="w-4 h-4 text-success" />*/}
      {/*    </div>*/}
      {/*    <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>*/}
      {/*    <p className="text-xs text-muted-foreground">Revenue Collected</p>*/}
      {/*  </div>*/}
      {/*  <div className="card-elevated p-4">*/}
      {/*    <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center mb-2">*/}
      {/*      <Clock className="w-4 h-4 text-warning" />*/}
      {/*    </div>*/}
      {/*    <p className="text-2xl font-bold">${pendingPayment.toLocaleString()}</p>*/}
      {/*    <p className="text-xs text-muted-foreground">Pending Payment</p>*/}
      {/*  </div>*/}
      {/*  <div className="card-elevated p-4">*/}
      {/*    <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center mb-2">*/}
      {/*      <User className="w-4 h-4 text-info" />*/}
      {/*    </div>*/}
      {/*    <p className="text-2xl font-bold">{customers.length}</p>*/}
      {/*    <p className="text-xs text-muted-foreground">Customers</p>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/* POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-340px)]">
        {/* Left: Products */}
        <div className="lg:col-span-2 space-y-4 overflow-y-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              className="pl-9"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Finished Goods
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:border-accent transition-colors"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Stock: <span className={cn('font-medium', item.quantity <= item.minQuantity ? 'text-destructive' : 'text-success')}>{item.quantity} {item.unit}</span>
                        </p>
                      </div>
                      <p className="text-base font-bold text-accent">${item.unitPrice}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-2 text-center text-muted-foreground py-8 text-sm">
                  No products found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="lg:col-span-1 card-elevated p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="text-lg font-bold">Current Order</h2>
          </div>

          {/* Customer */}
          <div className="mb-4">
            <Label className="text-xs">Customer</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue placeholder="Select customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">Cart is empty</div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">${item.price} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => updateQty(item.id, item.qty - 1)}>-</Button>
                    <span className="text-sm w-6 text-center">{item.qty}</span>
                    <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => updateQty(item.id, item.qty + 1)}>+</Button>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setCart((p) => p.filter((c) => c.id !== item.id))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">Discount ($)</Label>
              <Input
                type="number"
                className="h-8"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (13%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-accent">${total.toFixed(2)}</span>
            </div>
            <Button
              className="w-full btn-accent-gradient"
              size="lg"
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0 || !selectedCustomer}
            >
              <CreditCard className="w-4 h-4 mr-2" /> Complete Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2 font-medium">Item</th>
                    <th className="text-center p-2 font-medium w-12">Qty</th>
                    <th className="text-right p-2 font-medium w-24">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2 font-medium">{item.name}</td>
                      <td className="text-center p-2">x{item.qty}</td>
                      <td className="text-right p-2">${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-right font-medium">${subtotal.toFixed(2)}</span>
              <span className="text-muted-foreground">Discount:</span>
              <span className="text-right font-medium">-${Number(discount).toFixed(2)}</span>
              <span className="text-muted-foreground">Tax (13%):</span>
              <span className="text-right font-medium">${tax.toFixed(2)}</span>
              <span className="font-bold text-base">Total:</span>
              <span className="text-right font-bold text-accent text-base">${total.toFixed(2)}</span>
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as SalesOrder['paymentMethod'])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCheckout(false)}>Cancel</Button>
              <Button className="flex-1 btn-accent-gradient" onClick={handleConfirmOrder}>Confirm Payment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Billing History */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-3">
          <FileText className="w-5 h-5" /> Billing History
        </h2>

        <div className="card-elevated overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order or customer..."
                className="pl-9 h-9"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', statusFilter === 'all' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground')}
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
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', statusFilter === s ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground')}
                  >
                    {ORDER_STATUS[s].label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary bar */}
          <div className="p-3 bg-muted/30 border-b flex flex-wrap gap-2 text-xs">
            <span className="text-muted-foreground">Total Records: {filteredOrders.length}</span>
            <span className="ml-auto px-2 py-1 rounded-md bg-success/10 text-success font-semibold">
              Revenue: ${totalRevenue.toLocaleString()}
            </span>
            <span className="px-2 py-1 rounded-md bg-warning/10 text-warning font-semibold">
              Pending: ${pendingPayment.toLocaleString()}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>S.N</th>
                  <th>Order No</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12">
                      <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => {
                    const PayIcon = PAYMENT_ICONS[order.paymentMethod];
                    const payStatus = PAYMENT_STATUS[order.paymentStatus];
                    const canAdvance = STATUS_FLOW.includes(order.status) && STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1;
                    return (
                      <tr key={order.id}>
                        <td className="font-medium">{index + 1}</td>
                        <td className="font-mono font-semibold text-sm">{order.orderNumber}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <span className="text-sm">{order.customerName}</span>
                          </div>
                        </td>
                        <td className="text-muted-foreground text-sm">
                          {order.items.map((i) => i.productName).join(', ')}
                        </td>
                        <td className="font-semibold text-accent">${order.total.toLocaleString()}</td>
                        <td>
                          <span className={cn('text-sm font-medium', payStatus.cls)}>{payStatus.label}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <PayIcon className="w-4 h-4" />
                            <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td><StatusBadge status={order.status} /></td>
                        <td className="text-muted-foreground text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
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
      </div>
    </motion.div>
  );
};

export default SalesManagement;
