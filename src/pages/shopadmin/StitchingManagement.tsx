import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useBrandStore } from '@/store/brandStore';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  Shirt,
  Plus,
  Search,
  Clock,
  User,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  ShieldCheck,
  XCircle,
  Calendar,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { StitchingTask } from '@/types';

type Status = StitchingTask['status'];

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string; badge: string }> = {
  pending:       { label: 'Pending',       icon: Clock,        color: 'text-warning',     bg: 'bg-warning/10',     badge: 'badge-warning' },
  assigned:      { label: 'Assigned',      icon: User,         color: 'text-info',        bg: 'bg-info/10',        badge: 'badge-info' },
  in_progress:   { label: 'In Progress',   icon: PlayCircle,   color: 'text-info',        bg: 'bg-info/10',        badge: 'badge-info' },
  quality_check: { label: 'QC Review',     icon: ShieldCheck,  color: 'text-accent',      bg: 'bg-accent/10',      badge: 'badge-accent' },
  completed:     { label: 'Completed',     icon: CheckCircle2, color: 'text-success',     bg: 'bg-success/10',     badge: 'badge-success' },
  rejected:      { label: 'Rejected',      icon: XCircle,      color: 'text-destructive', bg: 'bg-destructive/10', badge: 'badge-destructive' },
};

const KANBAN_COLS: Status[] = ['pending', 'in_progress', 'quality_check', 'completed'];

const defaultForm = () => ({
  batchCode: '',
  cuttingOrderId: '',
  memberName: '',
  assignedTo: '',
  totalPieces: '',
  startDate: '',
  dueDate: '',
});

const StitchingManagement: React.FC = () => {
  const { activeBrandId } = useAuthStore();
  const { getUsersByBrand } = useBrandStore();
  const { getStitchingTasksByBrand, updateStitchingTask, addStitchingTask, getCuttingOrdersByBrand } = useInventoryStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm());

  const tasks = activeBrandId ? getStitchingTasksByBrand(activeBrandId) : [];
  const cuttingOrders = activeBrandId ? getCuttingOrdersByBrand(activeBrandId) : [];
  const users = activeBrandId ? getUsersByBrand(activeBrandId) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrandId) return;
    addStitchingTask({
      batchCode: form.batchCode,
      cuttingOrderId: form.cuttingOrderId,
      memberName: form.memberName,
      assignedTo: form.assignedTo,
      totalPieces: Number(form.totalPieces),
      completedPieces: 0,
      rejectedPieces: 0,
      status: 'pending',
      startDate: new Date(form.startDate).toISOString(),
      dueDate: new Date(form.dueDate).toISOString(),
      brandId: activeBrandId,
    });
    setForm(defaultForm());
    setShowForm(false);
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.batchCode.toLowerCase().includes(search.toLowerCase()) ||
      t.memberName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const advanceStatus = (task: StitchingTask) => {
    const flow: Status[] = ['pending', 'assigned', 'in_progress', 'quality_check', 'completed'];
    const idx = flow.indexOf(task.status);
    if (idx < flow.length - 1 && activeBrandId) {
      const next = flow[idx + 1];
      updateStitchingTask(activeBrandId, task.id, {
        status: next,
        ...(next === 'completed' ? { completedDate: new Date().toISOString() } : {}),
      });
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Stitching Management</h1>
          <p className="text-muted-foreground mt-1">Assign members, track tasks & quality checks</p>
        </div>
        <Button className="btn-accent-gradient gap-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> New Stitching Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {(Object.keys(STATUS_CONFIG) as Status[]).map((s) => {
          const count = tasks.filter((t) => t.status === s).length;
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
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by batch code or member..."
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
                  <th>Member</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Rejected</th>
                  <th>Due Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Shirt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No stitching tasks found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((task) => {
                    const progress = task.totalPieces > 0
                      ? Math.round((task.completedPieces / task.totalPieces) * 100)
                      : 0;
                    return (
                      <tr key={task.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                              <Shirt className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-semibold font-mono">{task.batchCode}</p>
                              <p className="text-xs text-muted-foreground">{task.totalPieces} pieces</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-sm">{task.memberName}</span>
                          </div>
                        </td>
                        <td><StatusBadge status={task.status} /></td>
                        <td>
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{task.completedPieces}/{task.totalPieces}</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          {task.rejectedPieces > 0 ? (
                            <span className="text-destructive font-medium">{task.rejectedPieces}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            {task.status !== 'completed' && task.status !== 'rejected' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => advanceStatus(task)}
                              >
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
                                  <Eye className="w-4 h-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                  <Edit className="w-4 h-4" /> Edit Task
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer text-destructive"
                                  onClick={() => activeBrandId && updateStitchingTask(activeBrandId, task.id, { status: 'rejected' })}
                                >
                                  <XCircle className="w-4 h-4" /> Reject
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {KANBAN_COLS.map((col) => {
            const cfg = STATUS_CONFIG[col];
            const colTasks = filtered.filter((t) => t.status === col);
            const Icon = cfg.icon;
            return (
              <div key={col} className="space-y-3">
                <div className={cn('flex items-center gap-3 p-3 rounded-lg bg-card border-l-4', `border-l-[var(--${col === 'pending' ? 'warning' : col === 'in_progress' ? 'info' : col === 'quality_check' ? 'accent' : 'success'})]`)}>
                  <Icon className={cn('w-4 h-4', cfg.color)} />
                  <h3 className="font-semibold text-sm">{cfg.label}</h3>
                  <span className="ml-auto px-2 py-0.5 bg-muted rounded-full text-xs font-medium">{colTasks.length}</span>
                </div>
                {colTasks.map((task) => {
                  const progress = task.totalPieces > 0
                    ? Math.round((task.completedPieces / task.totalPieces) * 100)
                    : 0;
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-elevated p-4 cursor-pointer hover:border-accent/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-semibold text-sm">{task.batchCode}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => advanceStatus(task)}>
                              <PlayCircle className="w-4 h-4" /> Advance
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive"
                              onClick={() => activeBrandId && updateStitchingTask(activeBrandId, task.id, { status: 'rejected' })}>
                              <XCircle className="w-4 h-4" /> Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                          <User className="w-3 h-3 text-accent" />
                        </div>
                        <span className="text-xs text-muted-foreground">{task.memberName}</span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{task.completedPieces}/{task.totalPieces} pcs</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      {task.rejectedPieces > 0 && (
                        <p className="text-xs text-destructive">{task.rejectedPieces} rejected</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </motion.div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                    No tasks
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Stitching Task Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shirt className="w-5 h-5 text-accent" />
              New Stitching Task
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Batch Code */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Batch Code</label>
              <Input
                required
                placeholder="e.g. ST-2024-005"
                value={form.batchCode}
                onChange={(e) => setForm({ ...form, batchCode: e.target.value })}
              />
            </div>

            {/* Cutting Order */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Cutting Order</label>
              <select
                required
                value={form.cuttingOrderId}
                onChange={(e) => setForm({ ...form, cuttingOrderId: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select cutting order...</option>
                {cuttingOrders.map((o) => (
                  <option key={o.id} value={o.id}>{o.batchCode} ({o.totalPieces} pcs)</option>
                ))}
              </select>
            </div>

            {/* Assign Member */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Assign Member</label>
              <select
                value={form.assignedTo}
                onChange={(e) => {
                  const user = users.find((u) => u.id === e.target.value);
                  setForm({ ...form, assignedTo: e.target.value, memberName: user?.name ?? '' });
                }}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select member...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} — {u.role.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Total Pieces */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Total Pieces</label>
              <Input
                required
                type="number"
                min={1}
                placeholder="e.g. 100"
                value={form.totalPieces}
                onChange={(e) => setForm({ ...form, totalPieces: e.target.value })}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  required
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="btn-accent-gradient">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default StitchingManagement;
