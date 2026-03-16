import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  Users, Plus, Search, Edit, Trash2, MoreHorizontal,
  Mail, Phone, MapPin, ShoppingBag, Star, X, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Customer } from '@/types';

const emptyForm = () => ({
  name: '', email: '', phone: '', address: '', city: '',
});

const CustomerManagement: React.FC = () => {
  const { activeBrandId } = useAuthStore();
  const { getCustomersByBrand, addCustomer, updateCustomer, deleteCustomer } = useInventoryStore();

  const customers = activeBrandId ? getCustomersByBrand(activeBrandId) : [];

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingCustomer(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({ name: customer.name, email: customer.email, phone: customer.phone, address: customer.address, city: customer.city });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrandId) return;
    if (editingCustomer) {
      updateCustomer(activeBrandId, editingCustomer.id, form);
    } else {
      addCustomer({ ...form, brandId: activeBrandId });
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!activeBrandId) return;
    deleteCustomer(activeBrandId, id);
    setDeleteConfirm(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your clients and customers</p>
        </div>
        <Button className="btn-accent-gradient gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">
              रु{customers.reduce((s, c) => s + c.totalPurchases, 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <Star className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Loyalty Points</p>
            <p className="text-2xl font-bold">
              {customers.reduce((s, c) => s + c.loyaltyPoints, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card-elevated p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone or city..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Grid */}
      {filtered.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No customers found</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={openAdd}>
            Add First Customer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-elevated overflow-hidden group"
            >
              <div className="h-16 bg-gradient-to-br from-accent/10 to-primary/10 relative">
                <div className="absolute -bottom-5 left-5">
                  <div className="w-10 h-10 rounded-full bg-card border-4 border-background flex items-center justify-center shadow">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost" size="icon"
                      className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(customer)}>
                      <Edit className="w-4 h-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer text-destructive"
                      onClick={() => setDeleteConfirm(customer.id)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="p-5 pt-8">
                <h3 className="font-semibold text-base">{customer.name}</h3>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{customer.city}{customer.address ? `, ${customer.address}` : ''}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Purchases</p>
                    <p className="text-sm font-semibold text-success">रु{customer.totalPurchases.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Loyalty Points</p>
                    <p className="text-sm font-semibold text-warning">{customer.loyaltyPoints.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Added {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Add New Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={openAdd}
            className="card-elevated min-h-[220px] flex items-center justify-center cursor-pointer border-dashed hover:border-accent/50 transition-all group"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                <Plus className="w-7 h-7 text-accent" />
              </div>
              <p className="font-semibold">Add New Customer</p>
              <p className="text-sm text-muted-foreground mt-1">Click to add a client</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input required placeholder="e.g. Fashion Forward Retail" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input required type="email" placeholder="email@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Phone *</Label>
                <Input required placeholder="+977 98XXXXXXXX" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City *</Label>
                <Input required placeholder="e.g. Kathmandu" value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Address</Label>
                <Input placeholder="Street address" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="btn-accent-gradient">
                <Check className="w-4 h-4 mr-1" />
                {editingCustomer ? 'Save Changes' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this customer? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CustomerManagement;
