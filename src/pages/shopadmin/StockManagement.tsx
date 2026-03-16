import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  PackagePlus,
  PackageMinus,
  ArrowUp,
  ArrowDown,
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
import type { StockItem } from '@/types';

const StockManagement: React.FC = () => {
  const { activeBrandId, isSuperAdmin } = useAuthStore();
  const { getStockByBrand, getSuppliersByBrand } = useInventoryStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'value'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);

  const stockItems = activeBrandId ? getStockByBrand(activeBrandId) : [];
  const suppliers = activeBrandId ? getSuppliersByBrand(activeBrandId) : [];

  // Filter and sort items
  const filteredItems = stockItems
    .filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'quantity') {
        comparison = a.quantity - b.quantity;
      } else if (sortBy === 'value') {
        comparison = (a.quantity * a.unitPrice) - (b.quantity * b.unitPrice);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'raw_material', label: 'Raw Materials' },
    { value: 'finished_goods', label: 'Finished Goods' },
    { value: 'accessory', label: 'Accessories' },
    { value: 'packaging', label: 'Packaging' },
  ];

  const totalValue = filteredItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const lowStockCount = filteredItems.filter(
    (item) => item.quantity <= item.minQuantity
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Stock Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory, track stock levels and movements
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowStockOutModal(true)}
          >
            <PackageMinus className="w-4 h-4" />
            Stock Out
          </Button>
          <Button 
            className="btn-accent-gradient gap-2"
            onClick={() => setShowStockInModal(true)}
          >
            <PackagePlus className="w-4 h-4" />
            Stock In
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{filteredItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{lowStockCount}</p>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Suppliers</p>
              <p className="text-2xl font-bold">{suppliers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card-elevated p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
                <Filter className="w-4 h-4" />
                {categories.find((c) => c.value === categoryFilter)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.value}
                  onClick={() => setCategoryFilter(category.value)}
                  className="cursor-pointer"
                >
                  {category.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover">
              <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('asc'); }}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('desc'); }}>
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('quantity'); setSortOrder('asc'); }}>
                Quantity (Low-High)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('quantity'); setSortOrder('desc'); }}>
                Quantity (High-Low)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('value'); setSortOrder('desc'); }}>
                Value (High-Low)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Export */}
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Location</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No stock items found</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setShowStockInModal(true)}
                    >
                      Add First Item
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{item.sku}</td>
                    <td>
                      <span className="px-2 py-1 rounded-full bg-muted text-xs font-medium capitalize">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={cn(
                        'font-semibold',
                        item.quantity <= item.minQuantity && 'text-warning'
                      )}>
                        {item.quantity}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">
                        {item.unit}
                      </span>
                    </td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td className="font-semibold">
                      ${(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                    <td className="text-sm text-muted-foreground">{item.location}</td>
                    <td>
                      {item.quantity <= item.minQuantity ? (
                        <span className="badge-warning px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="badge-success px-2 py-1 rounded-full text-xs font-medium">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Eye className="w-4 h-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Edit className="w-4 h-4" /> Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <PackagePlus className="w-4 h-4" /> Stock In
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <PackageMinus className="w-4 h-4" /> Stock Out
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                              <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default StockManagement;
