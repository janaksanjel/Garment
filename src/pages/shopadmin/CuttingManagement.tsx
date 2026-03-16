import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useBrandStore } from '@/store/brandStore';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  Scissors,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  QrCode,
  Printer,
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
import type { CuttingOrder } from '@/types';

const CuttingManagement: React.FC = () => {
  const { activeBrandId } = useAuthStore();
  const { getUsersByBrand } = useBrandStore();
  const { getCuttingOrdersByBrand } = useInventoryStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const cuttingOrders = activeBrandId ? getCuttingOrdersByBrand(activeBrandId) : [];
  const users = activeBrandId ? getUsersByBrand(activeBrandId) : [];

  const statuses = [
    { value: 'all', label: 'All Status', icon: Filter },
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-warning' },
    { value: 'in_progress', label: 'In Progress', icon: PlayCircle, color: 'text-info' },
    { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-success' },
    { value: 'cancelled', label: 'Cancelled', icon: AlertCircle, color: 'text-destructive' },
  ];

  const filteredOrders = cuttingOrders.filter((order) => {
    const matchesSearch = order.batchCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: CuttingOrder['status']) => {
    const statusConfig = statuses.find((s) => s.value === status);
    const Icon = statusConfig?.icon || Clock;
    return <Icon className={cn('w-4 h-4', statusConfig?.color)} />;
  };

  const getStatusBadge = (status: CuttingOrder['status']) => {
    const classes = {
      pending: 'badge-warning',
      in_progress: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-destructive',
    };
    return classes[status] || '';
  };

  // Kanban columns
  const kanbanColumns = [
    { id: 'pending', label: 'Pending', color: 'border-warning' },
    { id: 'in_progress', label: 'In Progress', color: 'border-info' },
    { id: 'completed', label: 'Completed', color: 'border-success' },
  ];

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
            Cutting Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage cutting orders with batch tracking
          </p>
        </div>
        
        <Button className="btn-accent-gradient gap-2">
          <Plus className="w-4 h-4" />
          New Cutting Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statuses.slice(1).map((status) => {
          const count = cuttingOrders.filter((o) => o.status === status.value).length;
          const Icon = status.icon;
          return (
            <div 
              key={status.value}
              className={cn(
                'card-elevated p-4 cursor-pointer transition-all hover:border-accent/30',
                statusFilter === status.value && 'border-accent'
              )}
              onClick={() => setStatusFilter(status.value === statusFilter ? 'all' : status.value)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  status.value === 'pending' && 'bg-warning/10',
                  status.value === 'in_progress' && 'bg-info/10',
                  status.value === 'completed' && 'bg-success/10',
                  status.value === 'cancelled' && 'bg-destructive/10'
                )}>
                  <Icon className={status.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{status.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card-elevated p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by batch code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'table' ? 'bg-background shadow-sm' : 'text-muted-foreground'
              )}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'kanban' ? 'bg-background shadow-sm' : 'text-muted-foreground'
              )}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Batch Code</th>
                  <th>Status</th>
                  <th>Colors</th>
                  <th>Progress</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Wastage</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <Scissors className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No cutting orders found</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Create First Order
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const progress = Math.round((order.completedPieces / order.totalPieces) * 100);
                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Scissors className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold font-mono">{order.batchCode}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.totalPieces} pieces
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1',
                            getStatusBadge(order.status)
                          )}>
                            {getStatusIcon(order.status)}
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {order.colors.map((color) => (
                              <span 
                                key={color}
                                className="px-2 py-0.5 bg-muted rounded text-xs"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{order.completedPieces}/{order.totalPieces}</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex -space-x-2">
                            {order.assignedTo.slice(0, 3).map((userId, i) => (
                              <div 
                                key={userId}
                                className="w-8 h-8 rounded-full bg-accent/20 border-2 border-background flex items-center justify-center"
                              >
                                <User className="w-3 h-3 text-accent" />
                              </div>
                            ))}
                            {order.assignedTo.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                                +{order.assignedTo.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(order.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          {order.wastage > 0 ? (
                            <span className="text-warning font-medium">{order.wastage}%</span>
                          ) : (
                            <span className="text-muted-foreground">0%</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <QrCode className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Printer className="w-4 h-4" />
                            </Button>
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
                                  <Edit className="w-4 h-4" /> Edit Order
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                                  <Trash2 className="w-4 h-4" /> Cancel
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
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanColumns.map((column) => {
            const columnOrders = filteredOrders.filter((o) => o.status === column.id);
            return (
              <div key={column.id} className="space-y-4">
                <div className={cn(
                  'flex items-center gap-3 p-4 rounded-lg bg-card border-l-4',
                  column.color
                )}>
                  <h3 className="font-semibold">{column.label}</h3>
                  <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium">
                    {columnOrders.length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {columnOrders.map((order) => {
                    const progress = Math.round((order.completedPieces / order.totalPieces) * 100);
                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-elevated p-4 cursor-pointer hover:border-accent/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono font-semibold">{order.batchCode}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Eye className="w-4 h-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Edit className="w-4 h-4" /> Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {order.colors.map((color) => (
                            <span 
                              key={color}
                              className="px-2 py-0.5 bg-muted rounded text-xs"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                              {order.completedPieces}/{order.totalPieces} pieces
                            </span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.dueDate).toLocaleDateString()}
                          </div>
                          <div className="flex -space-x-2">
                            {order.assignedTo.slice(0, 2).map((userId) => (
                              <div 
                                key={userId}
                                className="w-6 h-6 rounded-full bg-accent/20 border border-background flex items-center justify-center"
                              >
                                <User className="w-3 h-3 text-accent" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {columnOrders.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                      No orders
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default CuttingManagement;
