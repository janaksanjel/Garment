import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  PackageOpen,
  Plus,
  Search,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle2,
  PlayCircle,
  Tag,
  AlertTriangle,
  Calendar,
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
import type { PackagingBatch } from '@/types';

type Status = PackagingBatch['status'];

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string; badge: string; border: string }> = {
  pending:     { label: 'Pending',     icon: Clock,        color: 'text-warning',  bg: 'bg-warning/10',  badge: 'badge-warning',  border: 'border-warning' },
  in_progress: { label: 'In Progress', icon: PlayCircle,   color: 'text-info',     bg: 'bg-info/10',     badge: 'badge-info',     border: 'border-info' },
  completed:   { label: 'Completed',   icon: CheckCircle2, color: 'text-success',  bg: 'bg-success/10',  badge: 'badge-success',  border: 'border-success' },
};

const PackagingManagement: React.FC = () => {
  const { activeBrandId } = useAuthStore();
  const { getPackagingBatchesByBrand, updatePackagingBatch } = useInventoryStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const batches = activeBrandId ? getPackagingBatchesByBrand(activeBrandId) : [];

  const filtered = batches.filter((b) => {
    const matchSearch = b.batchCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const advanceStatus = (batch: PackagingBatch) => {
    const flow: Status[] = ['pending', 'in_progress', 'completed'];
    const idx = flow.indexOf(batch.status);
    if (idx < flow.length - 1 && activeBrandId) {
      updatePackagingBatch(activeBrandId, batch.id, { status: flow[idx + 1] });
    }
  };

  const toggleLabel = (batch: PackagingBatch) => {
    if (activeBrandId) {
      updatePackagingBatch(activeBrandId, batch.id, { labelGenerated: !batch.labelGenerated });
    }
  };

  const StatusBadge = ({ status }: { status: Status }) => {
    const cfg = STATUS_CONFIG[status];
    const Icon = cfg.icon;
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1', cfg.badge)}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  const totalPackaged = batches.reduce((s, b) => s + b.packagedPieces, 0);
  const totalDamaged = batches.reduce((s, b) => s + b.damagedPieces, 0);
  const labelsGenerated = batches.filter((b) => b.labelGenerated).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Packaging Management</h1>
          <p className="text-muted-foreground mt-1">Batch packaging, damage tracking & label generation</p>
        </div>
        <Button className="btn-accent-gradient gap-2">
          <Plus className="w-4 h-4" /> New Packaging Batch
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(STATUS_CONFIG) as Status[]).map((s) => {
          const count = batches.filter((b) => b.status === s).length;
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <div
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={cn(
                'card-elevated p-4 cursor-pointer transition-all hover:border-accent/30',
                statusFilter === s && 'border-accent'
              )}
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-2', cfg.bg)}>
                <Icon className={cn('w-4 h-4', cfg.color)} />
              </div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{cfg.label}</p>
            </div>
          );
        })}
        <div className="card-elevated p-4">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
            <Tag className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold">{labelsGenerated}</p>
          <p className="text-xs text-muted-foreground">Labels Generated</p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-elevated p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <PackageOpen className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalPackaged}</p>
            <p className="text-xs text-muted-foreground">Total Packaged Pieces</p>
          </div>
        </div>
        <div className="card-elevated p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalDamaged}</p>
            <p className="text-xs text-muted-foreground">Total Damaged Pieces</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by batch code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
          {(['table', 'kanban'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize',
                viewMode === m ? 'bg-background shadow-sm' : 'text-muted-foreground'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Batch Code</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Damaged</th>
                  <th>Label</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <PackageOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No packaging batches found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((batch) => {
                    const progress = batch.totalPieces > 0
                      ? Math.round((batch.packagedPieces / batch.totalPieces) * 100)
                      : 0;
                    return (
                      <tr key={batch.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                              <PackageOpen className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-semibold font-mono">{batch.batchCode}</p>
                              <p className="text-xs text-muted-foreground">{batch.totalPieces} pieces</p>
                            </div>
                          </div>
                        </td>
                        <td><StatusBadge status={batch.status} /></td>
                        <td>
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{batch.packagedPieces}/{batch.totalPieces}</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          {batch.damagedPieces > 0 ? (
                            <div>
                              <span className="text-destructive font-medium">{batch.damagedPieces}</span>
                              {batch.damageReasons.length > 0 && (
                                <p className="text-xs text-muted-foreground">{batch.damageReasons[0]}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => toggleLabel(batch)}
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors',
                              batch.labelGenerated
                                ? 'bg-success/10 text-success'
                                : 'bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent'
                            )}
                          >
                            <Tag className="w-3 h-3" />
                            {batch.labelGenerated ? 'Generated' : 'Generate'}
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(batch.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            {batch.status !== 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => advanceStatus(batch)}
                              >
                                Advance
                              </Button>
                            )}
                            {batch.labelGenerated && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Printer className="w-4 h-4" />
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
                                  <Eye className="w-4 h-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                  <Edit className="w-4 h-4" /> Edit Batch
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
          {(Object.keys(STATUS_CONFIG) as Status[]).map((col) => {
            const cfg = STATUS_CONFIG[col];
            const colBatches = filtered.filter((b) => b.status === col);
            const Icon = cfg.icon;
            return (
              <div key={col} className="space-y-3">
                <div className={cn('flex items-center gap-3 p-3 rounded-lg bg-card border-l-4', cfg.border)}>
                  <Icon className={cn('w-4 h-4', cfg.color)} />
                  <h3 className="font-semibold text-sm">{cfg.label}</h3>
                  <span className="ml-auto px-2 py-0.5 bg-muted rounded-full text-xs font-medium">{colBatches.length}</span>
                </div>
                {colBatches.map((batch) => {
                  const progress = batch.totalPieces > 0
                    ? Math.round((batch.packagedPieces / batch.totalPieces) * 100)
                    : 0;
                  return (
                    <motion.div
                      key={batch.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-elevated p-4 cursor-pointer hover:border-accent/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono font-semibold text-sm">{batch.batchCode}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => advanceStatus(batch)}>
                              <PlayCircle className="w-4 h-4" /> Advance
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => toggleLabel(batch)}>
                              <Tag className="w-4 h-4" /> {batch.labelGenerated ? 'Remove Label' : 'Generate Label'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{batch.packagedPieces}/{batch.totalPieces} pcs</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(batch.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          {batch.damagedPieces > 0 && (
                            <span className="text-destructive flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {batch.damagedPieces}
                            </span>
                          )}
                          {batch.labelGenerated && (
                            <span className="text-success flex items-center gap-1">
                              <Tag className="w-3 h-3" /> Label
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {colBatches.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                    No batches
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default PackagingManagement;
